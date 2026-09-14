import axios from "axios";
import { pingEvolution } from "./pingEvolution";

jest.mock("axios");

describe("pingEvolution", () => {
  it("is true when the instance is open", async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      status: 200,
      data: { instance: { state: "open" } },
    });
    await expect(
      pingEvolution({
        groupId: "1@g.us",
        instanceName: "bot",
        apiKey: "secret",
        apiUrl: "http://192.168.15.200:8080",
      }),
    ).resolves.toBe(true);
  });

  it("is false when Evolution returns an error status", async () => {
    (axios.get as jest.Mock).mockResolvedValue({ status: 404, data: {} });
    await expect(
      pingEvolution({
        groupId: "1@g.us",
        instanceName: "NEWS",
        apiKey: "secret",
        apiUrl: "http://192.168.15.200:8080",
      }),
    ).resolves.toBe(false);
  });
});
