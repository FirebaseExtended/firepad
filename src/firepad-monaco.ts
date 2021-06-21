import * as monaco from "monaco-editor";
import { v4 as uuid } from "uuid";

import { UserIDType } from "./database-adapter";
import { FirebaseAdapter } from "./firebase-adapter";
import { Firepad, IFirepad, IFirepadConstructorOptions } from "./firepad";
import { MonacoAdapter } from "./monaco-adapter";
import * as Utils from "./utils";

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
  // Initialize constructor options with their default values
  const userId: UserIDType = options.userId || uuid();
  const userColor: string =
    options.userColor || Utils.colorFromUserId(userId.toString());
  const userName: string = options.userName || userId.toString();
  const defaultText: string = options.defaultText || editor.getValue();

  const databaseAdapter = new FirebaseAdapter(
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
