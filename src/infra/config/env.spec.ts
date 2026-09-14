import { loadConfig, whatsappDestination } from "./env";

describe("loadConfig", () => {
  const valid = {
    WHATSAPP_GROUP_ID: "120363427966503551",
    WHATSAPP_INSTANCE_NAME: "bot",
    WHATSAPP_API_KEY: "secret",
    WHATSAPP_API_URL: "http://192.168.15.200:8080/",
    MYSQL_HOST: "192.168.15.200",
    MYSQL_USER: "root",
    MYSQL_PASSWORD: "secret",
    MYSQL_DATABASE: "news",
    REDIS_HOST: "192.168.15.200",
  };

  it("requires WhatsApp and database settings outside dry-run", () => {
    expect(() => loadConfig({})).toThrow(/WHATSAPP_GROUP_ID/);
    expect(() => loadConfig({ ...valid, WHATSAPP_API_KEY: "  " })).toThrow(/WHATSAPP_API_KEY/);
    expect(() => loadConfig({ ...valid, MYSQL_HOST: "" })).toThrow(/MYSQL_HOST/);
  });

  it("allows empty WhatsApp settings in dry-run", () => {
    const config = loadConfig({ DRY_RUN: "true" });
    expect(config.dryRun).toBe(true);
    expect(config.runOnce).toBe(true);
    expect(config.whatsapp.apiKey).toBe("");
  });

  it("normalizes group id and api url", () => {
    const config = loadConfig(valid);
    expect(config.whatsapp.groupId).toBe("120363427966503551@g.us");
    expect(config.whatsapp.apiUrl).toBe("http://192.168.15.200:8080");
  });
});

describe("whatsappDestination", () => {
  it("keeps jid and phone numbers", () => {
    expect(whatsappDestination("120363@g.us")).toBe("120363@g.us");
    expect(whatsappDestination("5511999999999")).toBe("5511999999999");
  });
});
