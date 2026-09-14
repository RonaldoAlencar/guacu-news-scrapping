import { collectHealth } from "./healthServer";

describe("collectHealth", () => {
  it("is ok when every check passes", async () => {
    const snapshot = await collectHealth([
      { name: "mysql", check: async () => true },
      { name: "redis", check: async () => true },
    ]);
    expect(snapshot).toEqual({
      status: "ok",
      checks: { mysql: "ok", redis: "ok" },
    });
  });

  it("is degraded when a check fails or throws", async () => {
    const snapshot = await collectHealth([
      { name: "mysql", check: async () => true },
      { name: "redis", check: async () => false },
      {
        name: "evolution",
        check: async () => {
          throw new Error("down");
        },
      },
    ]);
    expect(snapshot.status).toBe("degraded");
    expect(snapshot.checks).toEqual({
      mysql: "ok",
      redis: "error",
      evolution: "error",
    });
  });
});
