import HTTPRequests from "../../domain/adapters/HTTPRequests";
import LoggerAdapter from "../../domain/adapters/LoggerAdapter";
import SendWhatsappMessage from "./SendWhatsappMessage";

describe("SendWhatsappMessage", () => {
  const config = {
    groupId: "120363@g.us",
    instanceName: "guacu",
    apiKey: "secret",
    apiUrl: "https://evolution.example.com",
  };

  const logger: LoggerAdapter = {
    logDebug: jest.fn(),
    logError: jest.fn(),
    logInfo: jest.fn(),
    logWarning: jest.fn(),
  };

  it("posts text to Evolution sendText with Apikey header", async () => {
    const http: HTTPRequests = {
      get: jest.fn(),
      post: jest.fn().mockResolvedValue({ status: "ok" }),
    };
    const sender = new SendWhatsappMessage(http, logger, config);

    await sender.send("📰 teste");

    expect(http.post).toHaveBeenCalledWith(
      "https://evolution.example.com/message/sendText/guacu",
      { number: "120363@g.us", text: "📰 teste" },
      { headers: { Apikey: "secret" } },
    );
  });

  it("retries and then throws", async () => {
    const http: HTTPRequests = {
      get: jest.fn(),
      post: jest.fn().mockRejectedValue(new Error("network")),
    };
    const sender = new SendWhatsappMessage(http, logger, config, 2);

    await expect(sender.send("falha")).rejects.toThrow("network");
    expect(http.post).toHaveBeenCalledTimes(2);
  });
});
