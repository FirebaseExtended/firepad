import * as monaco from "monaco-editor";
import { v4 as uuid } from "uuid";
import * as firebase from "firebase/app";

import { IDatabaseAdapter, UserIDType } from "./database-adapter";
import { FirebaseAdapter } from "./firebase-adapter";
import { Firepad, IFirepad, IFirepadConstructorOptions } from "./firepad";
import { MonacoAdapter } from "./monaco-adapter";
import * as Utils from "./utils";
import { FirestoreAdapter } from "./firestore-adapter";

/**
 * Creates a modern Firepad from Monaco editor.
 * @param databaseRef - Firebase database Reference path.
 * @param editor - Monaco Editor instance.
 * @param options - Firepad constructor options (optional).
 */
export function fromMonacoWithFirebase(
  databaseRef: string | firebase.database.Reference,
  editor: monaco.editor.IStandaloneCodeEditor,
  options: Partial<IFirepadConstructorOptions> = {}
): IFirepad {
  // Initialize constructor options with their default values
  const userId: UserIDType = options.userId || uuid();
  const userColor: string =
    options.userColor || Utils.colorFromUserId(userId.toString());
  const userName: string = options.userName || userId.toString();
  const defaultText: string = options.defaultText || editor.getValue();

  let databaseAdapter: IDatabaseAdapter = new FirebaseAdapter(
    databaseRef,
    userId,
    userColor,
    userName
  );

  const editorAdapter = new MonacoAdapter(editor, false);
  return new Firepad(databaseAdapter, editorAdapter, {
    userId,
    userName,
    userColor,
    defaultText,
  });
}

/**
 * Creates a modern Firepad from Monaco editor.
 * @param databaseRef - Firestore database document Reference.
 * @param editor - Monaco Editor instance.
 * @param options - Firepad constructor options (optional).
 */
export function fromMonacoWithFirestore(
  databaseRef: firebase.firestore.DocumentReference, //TODO should we support path : string
  editor: monaco.editor.IStandaloneCodeEditor,
  options: Partial<IFirepadConstructorOptions> = {}
): IFirepad {
  // Initialize constructor options with their default values
  const userId: UserIDType = options.userId || uuid();
  const userColor: string =
    options.userColor || Utils.colorFromUserId(userId.toString());
  const userName: string = options.userName || userId.toString();
  const defaultText: string = options.defaultText || editor.getValue();

  let databaseAdapter: IDatabaseAdapter = new FirestoreAdapter(
    databaseRef,
    userId,
    userColor,
    userName
  );

  const editorAdapter = new MonacoAdapter(editor, false);
  return new Firepad(databaseAdapter, editorAdapter, {
    userId,
    userName,
    userColor,
    defaultText,
  });
}

/**
 * Creates a modern Firepad from Monaco editor.
 * @param databaseRef - Firebase database Reference path.
 * @param editor - Monaco Editor instance.
 * @param options - Firepad constructor options (optional).
 */
export function fromMonaco(
  databaseRef: string | firebase.database.Reference,
  editor: monaco.editor.IStandaloneCodeEditor,
  options: Partial<IFirepadConstructorOptions> = {}
): IFirepad {
  return fromMonacoWithFirebase(databaseRef, editor, options);
}
