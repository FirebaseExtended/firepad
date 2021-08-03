import "firebase/database";

import firebase from "firebase/app";

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
import * as Utils from "./utils";

type FirebaseRefCallbackType = (
  snapshot: firebase.database.DataSnapshot
) => void;

type FirebaseRefCallbackHookType = {
  ref: firebase.database.Reference | firebase.database.Query;
  eventType: firebase.database.EventType;
  callback: FirebaseRefCallbackType;
  context?: ThisType<FirebaseAdapter>;
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
  t: number;
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

export class FirebaseAdapter implements IDatabaseAdapter {
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
  protected _databaseRef: firebase.database.Reference | null;
  protected _firebaseCallbacks: FirebaseRefCallbackHookType[];

  /** Frequency of Text Operation to mark as checkpoint */
  protected static readonly CHECKPOINT_FREQUENCY: number = 100;

  /**
   * Creates a Database adapter for Firebase
   * @param databaseRef - Firebase Database path or Reference object
   * @param userId - Unique Identifier of the User
   * @param userColor - Color of the Cursor of the User
   * @param userName - Name of the Cursor of the User
   */
  constructor(
    databaseRef: string | firebase.database.Reference,
    userId: number | string,
    userColor: string,
    userName: string
  ) {
    if (typeof databaseRef !== "object") {
      databaseRef = firebase.database().ref(databaseRef);
    }

    // Add Database Ref and states
    this._databaseRef = databaseRef;
    this._ready = false;
    this._firebaseCallbacks = [];
    this._zombie = false;
    this._initialRevisions = false;

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

  protected _init(): void {
    const connectedRef = this._databaseRef!.root.child(".info/connected");

    this._firebaseOn(
      connectedRef,
      "value",
      (snapshot: firebase.database.DataSnapshot) => {
        if (snapshot.val() === true) {
          this._initializeUserData();
        }
      }
    );

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
    this._databaseRef = null;
    this._userRef = null;
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
    this._userRef!.child("cursor").onDisconnect().remove();
    this._userRef!.child("color").onDisconnect().remove();
    this._userRef!.child("name").onDisconnect().remove();

    this.sendCursor(this._userCursor || null);
  }

  /**
   * Fetch latest Document state from `checkpoint` node of Firebase ref once.
   */
  protected _monitorHistory(): void {
    // Get the latest checkpoint as a starting point so we don't have to re-play entire history.
    this._databaseRef!.child("checkpoint").once("value", (snapshot) => {
      if (this._zombie) {
        // just in case we were cleaned up before we got the checkpoint data.
        return;
      }

      const revisionId: string | null = snapshot.child("id").val();
      const op: TextOperationType | null = snapshot.child("o").val();
      const author: UserIDType | null = snapshot.child("a").val();

      if (op != null && revisionId != null && author !== null) {
        this._pendingReceivedRevisions[revisionId] = { o: op, a: author };
        this._checkpointRevision = this._revisionFromId(revisionId);
        this._monitorHistoryStartingAt(this._checkpointRevision + 1);
      } else {
        this._checkpointRevision = 0;
        this._monitorHistoryStartingAt(this._checkpointRevision);
      }
    });
  }

  /**
   * Callback listener for `child_added` event on `history` node of Firebase ref.
   * @param revisionSnapshot - JSON serializable data snapshot of the child.
   */
  protected _historyChildAdded(
    revisionSnapshot: firebase.database.DataSnapshot
  ): void {
    const revisionId: string = revisionSnapshot.key as string;
    this._pendingReceivedRevisions[
      revisionId
    ] = revisionSnapshot.val() as RevisionType;

    if (this._ready) {
      this._handlePendingReceivedRevisions();
    }
  }

  /**
   * Attach listeners for `child_added` event on `history` node of Firebase ref after given entry, and apply changes that are pending in `history` node.
   * @param revision - Intial revision to start monitoring from.
   */
  protected _monitorHistoryStartingAt(revision: number): void {
    const historyRef = this._databaseRef!.child("history").startAt(
      null,
      this._revisionToId(revision)
    );

    this._firebaseOn(historyRef, "child_added", this._historyChildAdded, this);

    historyRef.once("value", () => {
      this._handleInitialRevisions();
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
          this._userRef!.toString(),
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
          this._databaseRef!.toString(),
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
            if (this._revision % FirebaseAdapter.CHECKPOINT_FREQUENCY === 0) {
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
      t: firebase.database.ServerValue.TIMESTAMP as number,
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
    this._databaseRef!.child("history")
      .child(revisionId)
      .transaction(
        (current) => {
          if (current === null) {
            return revisionData;
          }
        },
        (error, committed) => {
          if (error) {
            if (error.message === "disconnect") {
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
          }

          return callback(null, committed);
        },
        false
      );
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
    this._databaseRef!.child("checkpoint").set({
      a: this._userId,
      o: this._document!.toJSON(),
      // use the id for the revision we just wrote.
      id: this._revisionToId(this._revision - 1),
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

    if (this._userRef) {
      // Clean up existing data.  Avoid nuking another user's data
      // (if a future user takes our old name).
      this._userRef.child("cursor").remove();
      this._userRef.child("cursor").onDisconnect().cancel();
      this._userRef.child("color").remove();
      this._userRef.child("color").onDisconnect().cancel();
      this._userRef = null;
    }

    this._userId = userId;
    this._userRef = this._databaseRef!.child("users").child(userId.toString());

    this._initializeUserData();
  }

  setUserColor(userColor: string): void {
    Utils.validateTruth(
      typeof userColor === "string",
      "User Color must be String."
    );

    if (!this._userRef) {
      return;
    }

    this._userRef.child("color").set(userColor);
    this._userColor = userColor;
  }

  setUserName(userName: string): void {
    Utils.validateTruth(
      typeof userName === "string",
      "User Name must be String."
    );

    if (!this._userRef) {
      return;
    }

    this._userRef.child("name").set(userName);
    this._userName = userName;
  }

  sendCursor(
    cursor: ICursor | null,
    callback: SendCursorCallbackType = Utils.noop
  ): void {
    if (!this._userRef) {
      return;
    }

    const cursorData: CursorType | null =
      cursor != null ? cursor.toJSON() : null;

    this._userRef.child("cursor").set(cursorData, function (error) {
      if (typeof callback === "function") {
        callback(error, cursor);
      }
    });

    this._userCursor = cursor;
  }

  /**
   * Callback listener for `child_added` and `child_changed` events on `users` node of Firebase ref.
   * @param childSnap - JSON serializable data snapshot of the child.
   */
  protected _childChanged(childSnap: firebase.database.DataSnapshot): void {
    if (this._zombie) {
      // just in case we were cleaned up before we got the users data.
      return;
    }

    const userId = childSnap.key as string;
    const userData = childSnap.val() as FirebaseCursorDataType;

    this._trigger(
      FirebaseAdapterEvent.CursorChange,
      userId,
      userData.cursor,
      userData.color,
      userData.name
    );
  }

  /**
   * Callback listener for `child_removed` events on `users` node of Firebase ref.
   * @param childSnap - JSON serializable data snapshot of the child.
   */
  protected _childRemoved(childSnap: firebase.database.DataSnapshot): void {
    const userId = childSnap.key as string;
    this._trigger(FirebaseAdapterEvent.CursorChange, userId, null);
  }

  /**
   * Attach listeners for `child_added`, `child_changed` and `child_removed` event on `users` node of Firebase ref.
   */
  protected _monitorCursors(): void {
    const usersRef = this._databaseRef!.child("users");

    this._firebaseOn(usersRef, "child_added", this._childChanged, this);
    this._firebaseOn(usersRef, "child_changed", this._childChanged, this);
    this._firebaseOn(usersRef, "child_removed", this._childRemoved, this);
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
