import { DatabaseAdapterEvent } from "../src/database-adapter";

describe("Database Adapter", () => {
  it("should only listen to finite number of events", () => {
    expect(DatabaseAdapterEvent).toMatchSnapshot();
  });
});
