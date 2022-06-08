import { Cursor } from "../src/cursor";
import { UserIDType } from "../src/database-adapter";
import { IEditorAdapter } from "../src/editor-adapter";
import { IRemoteClient, RemoteClient } from "../src/remote-client";
import { getEditorAdapter, IEditorAdapterMock } from "./factory";

describe("Remote Client", () => {
  let clientId: UserIDType;
  let remoteClient: IRemoteClient;
  let editorAdapter: IEditorAdapterMock;

  beforeAll(() => {
    clientId = Math.round(Math.random() * 100);
    editorAdapter = getEditorAdapter();

    remoteClient = new RemoteClient(clientId, editorAdapter as IEditorAdapter);
  });

  describe("#setColor", () => {
    it("should set cursor/selection color for remote user", () => {
      const fn = () => remoteClient.setColor("#fff");
      expect(fn).not.toThrowError();
    });
  });

  describe("#setUserName", () => {
    it("should set name/short-name for remote user", () => {
      const fn = () => remoteClient.setUserName("Robin");
      expect(fn).not.toThrowError();
    });
  });

  describe("#updateCursor", () => {
    it("should update cursor/selection position for remote user", () => {
      const userCursor = new Cursor(5, 8);
      remoteClient.updateCursor(userCursor);
      expect(editorAdapter.setOtherCursor).toHaveBeenCalledWith(
        clientId,
        userCursor,
        "#fff",
        "Robin"
      );
    });
  });

  describe("#removeCursor", () => {
    it("should remove cursor/selection for remote user", () => {
      remoteClient.removeCursor();
      expect(editorAdapter.disposeCursor).toHaveBeenCalled();
    });
  });
});
