import { EditorAdapterEvent } from "../src/editor-adapter";

describe("Editor Adapter", () => {
  it("should only listen to finite number of events", () => {
    expect(EditorAdapterEvent).toMatchSnapshot();
  });
});
