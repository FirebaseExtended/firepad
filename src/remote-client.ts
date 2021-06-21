import { ICursor } from "./cursor";
import { UserIDType } from "./database-adapter";
import { IEditorAdapter } from "./editor-adapter";
import { IDisposable } from "./utils";

export interface IRemoteClient {
  /** Set Cursor/Selection Color for Remote Client */
  setColor(color: string): void;
  /** Set Cursor/Selection Owner for Remote Client */
  setUserName(userName: string): void;
  /** Update Cursor/Selection position for Remote Client */
  updateCursor(cursor: ICursor): void;
  /** Remove Cursor/Selection from Editor */
  removeCursor(): void;
}

export class RemoteClient implements IRemoteClient {
  protected readonly _clientId: UserIDType;
  protected readonly _editorAdapter: IEditorAdapter;

  protected _userName: string;
  protected _userColor: string;
  protected _userCursor: ICursor | null;
  protected _mark: IDisposable | null;

  /**
   * Creates a Client object for Remote Users.
   * @param clientId - Unique Identifier for Remote User.
   * @param editorAdapter - Editor instance wrapped in Adapter interface.
   */
  constructor(clientId: UserIDType, editorAdapter: IEditorAdapter) {
    this._clientId = clientId;
    this._editorAdapter = editorAdapter;
  }

  setColor(color: string): void {
    this._userColor = color;
  }

  setUserName(userName: string): void {
    this._userName = userName;
  }

  updateCursor(cursor: ICursor): void {
    this.removeCursor();
    this._userCursor = cursor;
    this._mark = this._editorAdapter.setOtherCursor(
      this._clientId,
      cursor,
      this._userColor,
      this._userName
    );
  }

  removeCursor(): void {
    if (this._mark) {
      this._mark.dispose();
    }
  }
}
