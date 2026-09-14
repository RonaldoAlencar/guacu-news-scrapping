import { newsJobId } from "./BullMQ";

describe("newsJobId", () => {
  it("is stable for the same link", () => {
    const first = newsJobId("https://oregional.net/feira");
    const second = newsJobId("https://oregional.net/feira");
    expect(first).toHaveLength(64);
    expect(first).toBe(second);
    expect(first).not.toBe(newsJobId("https://oregional.net/outra"));
  });
});
