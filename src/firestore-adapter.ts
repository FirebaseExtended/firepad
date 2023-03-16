import "firebase/database";

import * as firebase from "firebase/app";

import { CursorType, ICursor } from "./cursor";
import {
  DatabaseAdapterCallbackType,
  DatabaseAdapterEvent as FirebaseAdapterEvent,
  IDatabaseAdapter,
  IDatabaseAdapterEvent,
  SendCursorCallbackType,
  SendOperationCallbackType,
  UserIDType,
} from "./database-adapter";
import { EventEmitter, EventListenerType, IEventEmitter } from "./emitter";
import {
  ITextOperation,
  TextOperation,
  TextOperationType,
} from "./text-operation";
import { ITextOp } from "./text-op";
import * as Utils from "./utils";

type FirebaseRefCallbackType = (
  snapshot: firebase.database.DataSnapshot
) => void;

type FirebaseRefCallbackHookType = {
  ref: firebase.database.Reference | firebase.database.Query;
  eventType: firebase.database.EventType;
  callback: FirebaseRefCallbackType;
  context?: ThisType<FirestoreAdapter>;
};

type RevisionType = {
  /** Author */
  a: UserIDType;
  /** Operation */
  o: TextOperationType;
};

type RevisionHistoryType = {
  [revisionId: string]: RevisionType;
};

export type FirebaseOperationDataType = RevisionType & {
  /** Timestamp */
  t: any;
};

export type FirebaseCursorDataType = {
  /** Color of Cursor */
  color: string;
  /** Name of User */
  name: string;
  /** Position of Cursor/Selection */
  cursor: CursorType;
};

// Based off ideas from http://www.zanopha.com/docs/elen.pdf
const characters =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export interface IFirebaseAdapterEvent extends IDatabaseAdapterEvent {}

/** Copy of the Operation and Revision ID just sent */
interface ISentOperation {
  /** Revision ID */
  id: string;
  /** Operation Sent to Server */
  op: ITextOperation;
}

/** Parsed Operation data from JSON representation */
interface IRevision {
  /** Author */
  author: UserIDType;
  /** Operation */
  operation: ITextOperation;
}

export class FirestoreAdapter implements IDatabaseAdapter {
  protected _zombie: boolean;
  protected _initialRevisions: boolean;
  protected _ready: boolean;
  protected _revision: number;
  protected _sent: ISentOperation | null;
  protected _checkpointRevision: number;
  protected _userId: UserIDType | null;
  protected _userColor: string | null;
  protected _userName: string | null;
  protected _userCursor: ICursor | null;
  protected _pendingReceivedRevisions: RevisionHistoryType;
  protected _emitter: IEventEmitter | null;
  protected _document: ITextOperation | null;
  protected _userRef: firebase.database.Reference | null;
  protected _firestoreUserRef: firebase.firestore.DocumentReference | null;
  protected _firestoreRef: firebase.firestore.DocumentReference | null;
  protected _firebaseCallbacks: FirebaseRefCallbackHookType[];
  protected _typingState: any;
  protected _userColorMap: any;

  /** Frequency of Text Operation to mark as checkpoint */
  protected static readonly CHECKPOINT_FREQUENCY: number = 100;

  protected static readonly MAX_CURSOR_SYNC_TIME: number = 1 * 10 * 1000;

  protected static readonly CURSOR_RANGE_SELECTION_DELAY: number = 300;

  protected static readonly CURSOR_EVENT_DEFER_DELAY: number = 1500;

  /**
   * Creates a Database adapter for Firebase
   * @param firestoreRef - Firestore Reference object
   * @param userId - Unique Identifier of the User
   * @param userColor - Color of the Cursor of the User
   * @param userName - Name of the Cursor of the User
   */
  constructor(
    firestoreRef: firebase.firestore.DocumentReference,
    userId: number | string,
    userColor: string,
    userName: string
  ) {
    // Add Database Ref and states
    this._firestoreRef = firestoreRef;
    this._ready = false;
    this._firebaseCallbacks = [];
    this._zombie = false;
    this._initialRevisions = false;
    this._userColorMap = new Map();
    this._typingState = new Map();

    // Add User Information
    this.setUserId(userId);
    this.setUserColor(userColor);
    this.setUserName(userName);

    // We store the current document state as a TextOperation so we can write checkpoints to Firebase occasionally.
    // TODO: Consider more efficient ways to do this (composing text operations is ~linear in the length of the document).
    this._document = new TextOperation();

    // The next expected revision.
    this._revision = 0;

    // This is used for two purposes:
    // 1) On initialization, we fill this with the latest checkpoint and any subsequent operations and then
    //      process them all together.
    // 2) If we ever receive revisions out-of-order (e.g. rev 5 before rev 4), we queue them here until it's time
    //    for them to be handled. [this should never happen with well-behaved clients; but if it /does/ happen we want
    //    to handle it gracefully.]
    this._pendingReceivedRevisions = {};

    this._emitter = new EventEmitter([
      FirebaseAdapterEvent.Acknowledge,
      FirebaseAdapterEvent.CursorChange,
      FirebaseAdapterEvent.Error,
      FirebaseAdapterEvent.Operation,
      FirebaseAdapterEvent.Ready,
      FirebaseAdapterEvent.Retry,
      FirebaseAdapterEvent.InitialRevision,
    ]);

    this._init();
  }

  public enable() {
    this._zombie = false;
  }

  public disable() {
    this._zombie = true;
  }

  protected _init(): void {
    // const connectedRef = this._databaseRef!.root.child(".info/connected");

    // this._firebaseOn(
    //   connectedRef,
    //   "value",
    //   (snapshot: firebase.database.DataSnapshot) => {
    //     if (snapshot.val() === true) {
    //       this._initializeUserData();
    //     }
    //   }
    // );

    // Once we're initialized, start tracking users' cursors.
    this.on(FirebaseAdapterEvent.Ready, () => {
      this._monitorCursors();
    });

    // Avoid triggering any events until our callers have had a chance to attach their listeners.
    setTimeout(() => {
      this._monitorHistory();
    }, 1);
  }

  dispose(): void {
    if (!this._ready) {
      this.on(FirebaseAdapterEvent.Ready, () => {
        this.dispose();
      });
      return;
    }

    if (this._emitter) {
      this._emitter.dispose();
      this._emitter = null;
    }

    this._removeFirebaseCallbacks();
    this._firestoreUserRef = null;
    this._document = null;
    this._zombie = true;
  }

  getDocument(): ITextOperation | null {
    return this._document;
  }

  isCurrentUser(clientId: string): boolean {
    return this._userId == clientId;
  }

  on(
    event: FirebaseAdapterEvent,
    listener: EventListenerType<IFirebaseAdapterEvent>
  ): void {
    return this._emitter?.on(event, listener);
  }

  off(
    event: FirebaseAdapterEvent,
    listener: EventListenerType<IFirebaseAdapterEvent>
  ): void {
    return this._emitter?.off(event, listener);
  }

  registerCallbacks(callbacks: DatabaseAdapterCallbackType): void {
    Object.entries(callbacks).forEach(([event, listener]) => {
      this.on(
        event as FirebaseAdapterEvent,
        listener as EventListenerType<IFirebaseAdapterEvent>
      );
    });
  }

  protected _trigger(
    event: FirebaseAdapterEvent,
    eventArgs: IFirebaseAdapterEvent | void,
    ...extraArgs: unknown[]
  ): void {
    return this._emitter?.trigger(event, eventArgs || {}, ...extraArgs);
  }

  /**
   * Setup user indicator data and hooks in `users` node in Firebase ref.
   */
  protected _initializeUserData(): void {
    this.sendCursor(this._userCursor || null);
  }

  /**
   * Fetch latest Document state from `checkpoint` node of Firebase ref once.
   */
  protected _monitorHistory(): void {
    // Get the latest checkpoint as a starting point so we don't have to re-play entire history.
    // TODO this reads the complete doc, read "checkpoint" field only
    this._firestoreRef!.get()
      .then((doc) => {
        if (this._zombie) {
          // just in case we were cleaned up before we got the checkpoint data.
          return;
        }

        let hasCheckpoint = false;
        let revisionId = null;
        let op = null;
        let author = null;

        let checkpoint = doc?.data()?.checkpoint;

        if (checkpoint) {
          const data = checkpoint || {};
          revisionId = data.id;
          op = data.o;
          author = data.a;

          if (op != null && revisionId != null && author !== null) {
            hasCheckpoint = true;
          }
        }

        if (hasCheckpoint) {
          this._pendingReceivedRevisions[revisionId] = { o: op, a: author };
          this._checkpointRevision = this._revisionFromId(revisionId);
          this._monitorHistoryStartingAt(this._checkpointRevision + 1);
        } else {
          this._checkpointRevision = 0;
          this._monitorHistoryStartingAt(this._checkpointRevision);
        }
      })
      .catch((error) => {
        console.error("[firestore] Error getting checkpoint", error);
      });
  }

  /**
   * Callback listener for `child_added` event on `history` node of Firebase ref.
   * @param revisionSnapshot - JSON serializable data snapshot of the child.
   */
  protected _historyChildAdded(
    revisionSnapshot: firebase.firestore.QueryDocumentSnapshot
  ): void {
    const revisionId = revisionSnapshot.id;
    this._pendingReceivedRevisions[
      revisionId
    ] = revisionSnapshot.data() as RevisionType;

    if (this._ready) {
      this._handlePendingReceivedRevisions();
    }
  }

  /**
   * Attach listeners for `child_added` event on `history` node of Firebase ref after given entry, and apply changes that are pending in `history` node.
   * @param revision - Intial revision to start monitoring from.
   */
  protected _monitorHistoryStartingAt(revision: number): void {
    const historyRef = this._firestoreRef!.collection("history")
      .orderBy(firebase.firestore.FieldPath.documentId())
      .startAt(this._revisionToId(revision));

    historyRef.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          this._historyChildAdded(change.doc);
        }
      });
    });

    historyRef
      .get()
      .then(() => {
        this._handleInitialRevisions();
      })
      .catch((error) => {
        console.error("[firestore] Error getting initial revisions", error);
      });
  }

  /**
   * Apply all pending changes in `history` node that aren't yet checked in into `checkpoint`, and then mark connection to be Ready.
   */
  protected _handleInitialRevisions(): void {
    if (this._zombie) {
      // just in case we were cleaned up before we got the data.
      return;
    }

    Utils.validateFalse(this._ready, "Should not be called multiple times.");

    if (!this._initialRevisions) {
      this._initialRevisions = true;
      this._trigger(FirebaseAdapterEvent.InitialRevision);
    }

    // Compose the checkpoint and all subsequent revisions into a single operation to apply at once.
    this._revision = this._checkpointRevision;

    let revisionId = this._revisionToId(this._revision);
    const pending = this._pendingReceivedRevisions;

    while (pending[revisionId] != null) {
      const revision: IRevision | null = this._parseRevision(
        pending[revisionId] as any
      );

      if (!revision) {
        // If a misbehaved client adds a bad operation, just ignore it.
        console.log(
          "Invalid operation.",
          this._firestoreUserRef!.toString(),
          revisionId,
          pending[revisionId]
        );
      } else {
        this._document = this._document!.compose(revision.operation);
      }

      delete pending[revisionId];
      this._revision++;

      revisionId = this._revisionToId(this._revision);
    }

    this._trigger(FirebaseAdapterEvent.Operation, this._document!);
    this._ready = true;

    setTimeout(() => {
      this._trigger(FirebaseAdapterEvent.Ready, true);
    });
  }

  /**
   * Apply incoming changes from newly added child in `history` node of Firebase ref.
   */
  protected _handlePendingReceivedRevisions(): void {
    const pending = this._pendingReceivedRevisions;

    let revisionId = this._revisionToId(this._revision);
    let triggerRetry = false;

    while (pending[revisionId] != null) {
      this._revision++;

      const revision: IRevision | null = this._parseRevision(
        pending[revisionId]
      );
      if (!revision) {
        // If a misbehaved client adds a bad operation, just ignore it.
        console.log(
          "Invalid operation.",
          this._firestoreRef!.toString(),
          revisionId,
          pending[revisionId]
        );
      } else {
        this._document = this._document!.compose(revision.operation);

        if (this._sent && revisionId === this._sent.id) {
          // We have an outstanding change at this revision id.
          if (
            this._sent.op.equals(revision.operation) &&
            revision.author == this._userId
          ) {
            // This is our change; it succeeded.
            if (this._revision % FirestoreAdapter.CHECKPOINT_FREQUENCY === 0) {
              this._saveCheckpoint();
            }
            this._sent = null;
            this._trigger(FirebaseAdapterEvent.Acknowledge);
          } else {
            // our op failed.  Trigger a retry after we're done catching up on any incoming ops.
            triggerRetry = true;
            this._trigger(FirebaseAdapterEvent.Operation, revision.operation);
          }
        } else {
          this._trigger(FirebaseAdapterEvent.Operation, revision.operation);
          this._syncCursorForTypingEvents(revision);
        }
      }
      delete pending[revisionId];

      revisionId = this._revisionToId(this._revision);
    }

    if (triggerRetry) {
      this._sent = null;
      this._trigger(FirebaseAdapterEvent.Retry);
    }
  }

  /**
   * @desc Perform cursor sync. In case of Fire"Store" database, updates are batched unlike Fire"base" RTDB.
   * In case of firestore, the cursor updates arrive first before the text operation
   * That results in inappropriate cursor placement. Idea is to "ignore" the cursor events
   * once the typing is started by the remote user. Make sure to block cursor events for
   * the same user from where the operations are being received.
   * @param revision - Revision with author and Operation information
   */
  protected _syncCursorForTypingEvents(revision: IRevision): void {
    const author = revision.author.toString();
    const ops: ITextOp[] = revision.operation.getOps().slice(0, 2);

    let position = 0;

    for (const op of ops) {
      if (op.isRetain()) {
        position += op.chars!;
      }

      if (op.isInsert()) {
        position += op.text!.length;
      }
    }

    setTimeout(() => {
      if (this._zombie) {
        return;
      }

      const { color, name } = this._userColorMap.get(author);

      this._trigger(
        FirebaseAdapterEvent.CursorChange,
        author,
        { position, selectionEnd: position },
        color,
        name
      );
    }, 1);

    if (this._typingState.has(author)) {
      clearTimeout(this._typingState.get(author));
      this._typingState.delete(author);
    }

    const timerId = setTimeout(() => {
      /**
       * Unblock remote users for
       * 1. Code range Highlight events
       * 2. Code navigation using keyboard events
       */
      this._typingState.delete(author);
    }, FirestoreAdapter.CURSOR_EVENT_DEFER_DELAY);

    /**
     * Block early arriving cursor events when remote
     * user is typing
     */
    this._typingState.set(author, timerId);
  }

  sendOperation(
    operation: TextOperation,
    callback: SendOperationCallbackType = Utils.noop
  ): void {
    // If we're not ready yet, do nothing right now, and trigger a retry when we're ready.
    if (!this._ready) {
      this.on(FirebaseAdapterEvent.Ready, () => {
        this._trigger(FirebaseAdapterEvent.Retry);
      });
      return;
    }

    // Sanity check that this operation is valid.
    if (!this._document!.canMergeWith(operation)) {
      const error = "sendOperation() called with invalid operation.";
      this._trigger(FirebaseAdapterEvent.Error, error, operation.toString(), {
        operation: operation.toString(),
        document: this._document!.toString(),
      });
      Utils.onInvalidOperationRecieve(error);
    }

    // Convert revision into an id that will sort properly lexicographically.
    const revisionId = this._revisionToId(this._revision);

    this._sent = { id: revisionId, op: operation };
    const revisionData: FirebaseOperationDataType = {
      a: this._userId!,
      o: operation.toJSON(),
      t: firebase.firestore.FieldValue.serverTimestamp(), // placeholder for timestamp, it was Number type in RTDB
    };

    this._doTransaction(revisionId, revisionData, callback);
  }

  /**
   * Perform Insert transaction Text Operation into given Revision ID in `history` node of Firebase ref.
   * @param revisionId - Revision ID.
   * @param revisionData - Text Operation and metadata in JSON format.
   * @param callback - Success/Error callback handler.
   */
  protected _doTransaction(
    revisionId: string,
    revisionData: FirebaseOperationDataType,
    callback: SendOperationCallbackType
  ): void {
    this._firestoreRef!.firestore.runTransaction((t) => {
      const docRef = this._firestoreRef!.collection("history").doc(revisionId);
      return t.get(docRef).then((doc) => {
        if (doc.data() == null) {
          t.set(docRef, revisionData);
        }
      });
    })
      .then(() => {
        return callback(null, true);
      })
      .catch((error) => {
        if (error) {
          if (error.message === "unavailable") {
            if (this._sent && this._sent.id === revisionId) {
              // We haven't seen our transaction succeed or fail.  Send it again.
              setTimeout(() => {
                this._doTransaction(revisionId, revisionData, callback);
              });
            }
            return callback(error, false);
          } else {
            this._trigger(
              FirebaseAdapterEvent.Error,
              error,
              revisionData.o.toString(),
              {
                operation: revisionData.o.toString(),
                document: this._document!.toString(),
              }
            );
            Utils.onFailedDatabaseTransaction(error.message);
          }
        } else {
          // this should not happen
          console.log("Unhandled error");
        }
      });
  }

  /**
   * Returns parsed Text Operation with metadata for given JSON representation of the same.
   * @param data - Partial representation of the Text Operation in Firebase.
   */
  protected _parseRevision(data: RevisionType): IRevision | null {
    // We could do some of this validation via security rules.  But it's nice to be robust, just in case.
    if (typeof data !== "object" || typeof data.o !== "object") {
      return null;
    }

    let op: TextOperation | null = null;

    try {
      op = TextOperation.fromJSON(data.o);
    } catch (e) {
      return null;
    }

    if (!this._document!.canMergeWith(op)) {
      return null;
    }

    return {
      author: data.a,
      operation: op,
    };
  }

  /**
   * Updates current document state into `checkpoint` node in Firebase.
   */
  protected _saveCheckpoint(): void {
    this._firestoreRef!.set({
      checkpoint: {
        a: this._userId,
        o: this._document!.toJSON(),
        // use the id for the revision we just wrote.
        id: this._revisionToId(this._revision - 1),
      },
    });
  }

  isHistoryEmpty(): boolean {
    Utils.validateTruth(this._ready, "Not ready yet.");
    return this._revision === 0;
  }

  setUserId(userId: UserIDType): void {
    Utils.validateTruth(
      typeof userId === "string" || typeof userId === "number",
      "User ID must be either String or Integer."
    );

    if (this._firestoreUserRef) {
      // Clean up existing data.  Avoid nuking another user's data
      // (if a future user takes our old name).
      this._firestoreUserRef.update({ cursor: null });
      this._firestoreUserRef.update({ color: null });
      this._firestoreUserRef = null;
    }

    this._userId = userId;
    this._firestoreUserRef = this._firestoreRef!.collection("users").doc(
      userId.toString()
    );

    this._initializeUserData();
  }

  setUserColor(userColor: string): void {
    Utils.validateTruth(
      typeof userColor === "string",
      "User Color must be String."
    );

    if (!this._firestoreUserRef) {
      return;
    }

    this._firestoreUserRef.set({ color: userColor }, { merge: true });

    this._userColor = userColor;
  }

  setUserName(userName: string): void {
    Utils.validateTruth(
      typeof userName === "string",
      "User Name must be String."
    );

    if (!this._firestoreUserRef) {
      return;
    }

    this._firestoreUserRef.set({ name: userName }, { merge: true });

    this._userName = userName;
  }

  sendCursor(
    cursor: ICursor | null,
    callback: SendCursorCallbackType = Utils.noop
  ): void {
    if (!this._firestoreUserRef) {
      return;
    }

    const cursorData: CursorType | null =
      cursor != null ? cursor.toJSON() : null;

    this._firestoreUserRef!.set(
      { lastUpdated: Date.now(), cursor: { ...cursorData } },
      { merge: true }
    )
      .then(() => {
        if (typeof callback === "function") {
          callback(null, cursor);
        }
      })
      .catch((error) => {
        console.error("[firestore] Error sending cursor", error);

        if (typeof callback === "function") {
          callback(error, cursor);
        }
      });

    this._userCursor = cursor;
  }

  /**
   * Attach listeners for `child_added`, `child_changed` and `child_removed` event on `users` node of Firebase ref.
   */
  protected _monitorCursors(): void {
    const firestoreUsersRef = this._firestoreRef!.collection("users").where(
      "lastUpdated",
      ">=",
      Date.now() - FirestoreAdapter.MAX_CURSOR_SYNC_TIME
    );
    firestoreUsersRef.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added" || change.type === "modified") {
          const userId = change.doc.id.toString();
          const userData = change.doc.data() as FirebaseCursorDataType;
          const {
            position: cPosition,
            selectionEnd: cSelectionEnd,
          } = userData.cursor;
          const isRangeSelected: boolean = cPosition !== cSelectionEnd;

          this._userColorMap.set(userId, {
            color: userData.color,
            name: userData.name,
          });

          if (this._typingState.has(userId) && !isRangeSelected) {
            /**
             * When the operations are being received and it is not
             * code range highlighting,
             * early return to defer cursor events arriving before text operations
             * for given user id
             */
            return;
          }

          /**
           * This code will only execute when:
           * 1. Remote user(s) navigates through code using cursor
           * 2. Remote user(s) highlighting the code range
           */
          if (userData.color && userData.name && !this._zombie) {
            this._trigger(
              FirebaseAdapterEvent.CursorChange,
              userId,
              userData.cursor,
              userData.color,
              userData.name
            );
          }
        }
        if (change.type === "removed") {
          const userId = change.doc.id;
          this._trigger(FirebaseAdapterEvent.CursorChange, userId, null);
        }
      });
    });
    // TODO how to de-register callbacks on _removeFirebaseCallbacks()
  }

  protected _firebaseOn(
    ref: firebase.database.Reference | firebase.database.Query,
    eventType: firebase.database.EventType,
    callback: FirebaseRefCallbackType,
    context?: ThisType<IDatabaseAdapter>
  ): void {
    this._firebaseCallbacks.push({
      ref,
      eventType,
      callback,
      context,
    });

    ref.on(eventType, callback, context);
  }

  protected _removeFirebaseCallbacks() {
    for (const callbackRef of this._firebaseCallbacks) {
      const { ref, eventType, callback, context } = callbackRef;
      ref.off(eventType, callback, context);
    }

    this._firebaseCallbacks = [];
  }

  /**
   * Returns Database key for `history` node based on current Revision index _(0-based)_.
   * @param revision - Current Revision Index.
   */
  protected _revisionToId(revision: number): string {
    if (revision === 0) {
      return "A0";
    }

    let str: string = "";

    while (revision > 0) {
      const digit: number = revision % characters.length;
      str = characters[digit] + str;
      revision -= digit;
      revision /= characters.length;
    }

    // Prefix with length (starting at 'A' for length 1) to ensure the id's sort lexicographically.
    const prefix = characters[str.length + 9];
    return `${prefix}${str}`;
  }

  /**
   * Returns Revision Index _(0-based)_ based on Database key provided.
   * @param revisionId - Database key for `history` node.
   */
  protected _revisionFromId(revisionId: string): number {
    Utils.validateTruth(
      revisionId.length > 0 &&
        revisionId[0] === characters[revisionId.length + 8]
    );

    let revision: number = 0;

    for (let i = 1; i < revisionId.length; i++) {
      revision *= characters.length;
      revision += characters.indexOf(revisionId[i]);
    }

    return revision;
  }
}
