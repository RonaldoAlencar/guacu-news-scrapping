import mysql from "mysql2/promise";
import LoggerAdapter from "../../domain/adapters/LoggerAdapter";
import DatabaseConnection from "../repository/DatabaseConnection";
import ScrapeLock from "./ScrapeLock";

function logger(): LoggerAdapter {
  return {
    logDebug: jest.fn(),
    logInfo: jest.fn(),
    logError: jest.fn(),
    logWarning: jest.fn(),
  };
}

describe("ScrapeLock", () => {
  it("skips mysql when dry-run", async () => {
    const database = { getPool: jest.fn() } as unknown as DatabaseConnection;
    const lock = new ScrapeLock(database, logger(), true);
    const task = jest.fn().mockResolvedValue(undefined);

    await lock.run(task);

    expect(task).toHaveBeenCalled();
    expect(database.getPool).not.toHaveBeenCalled();
  });

  it("does not run the task when GET_LOCK is not acquired", async () => {
    const connection = {
      query: jest.fn().mockResolvedValue([[{ taken: 0 }]]),
      release: jest.fn(),
    };
    const database = {
      getPool: jest.fn().mockResolvedValue({
        getConnection: jest.fn().mockResolvedValue(connection),
      }),
    } as unknown as DatabaseConnection;
    const log = logger();
    const lock = new ScrapeLock(database, log, false);
    const task = jest.fn();

    await lock.run(task);

    expect(task).not.toHaveBeenCalled();
    expect(log.logWarning).toHaveBeenCalled();
    expect(connection.release).toHaveBeenCalled();
  });

  it("releases the mysql lock after the task", async () => {
    const connection = {
      query: jest
        .fn()
        .mockResolvedValueOnce([[{ taken: 1 }]] as mysql.RowDataPacket[][])
        .mockResolvedValueOnce([[]]),
      release: jest.fn(),
    };
    const database = {
      getPool: jest.fn().mockResolvedValue({
        getConnection: jest.fn().mockResolvedValue(connection),
      }),
    } as unknown as DatabaseConnection;
    const lock = new ScrapeLock(database, logger(), false);

    await lock.run(async () => undefined);

    expect(connection.query).toHaveBeenNthCalledWith(1, "SELECT GET_LOCK(?, 0) AS taken", [
      "guacu-news-scrape",
    ]);
    expect(connection.query).toHaveBeenNthCalledWith(2, "SELECT RELEASE_LOCK(?)", [
      "guacu-news-scrape",
    ]);
    expect(connection.release).toHaveBeenCalled();
  });

  it("skips a second scrape while the first is running", async () => {
    const log = logger();
    const lock = new ScrapeLock({} as DatabaseConnection, log, true);
    let release!: () => void;
    let started!: () => void;
    const ready = new Promise<void>((resolve) => {
      started = resolve;
    });
    const first = lock.run(
      () =>
        new Promise<void>((resolve) => {
          started();
          release = resolve;
        }),
    );
    await ready;
    await lock.run(async () => undefined);
    expect(log.logWarning).toHaveBeenCalled();
    release();
    await first;
  });
});
