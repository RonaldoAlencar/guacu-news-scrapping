import LoggerAdapter from "../../domain/adapters/LoggerAdapter";
import AxiosAdapter from "./AxiosAdapter";
import PlaywrightAdapter from "./PlaywrightAdapter";
import { looksLikeCloudflare } from "../../utils/newsParse";

export default class ScrapingHttp {
  constructor(
    private readonly axios: AxiosAdapter,
    private readonly playwright: PlaywrightAdapter,
    private readonly logger: LoggerAdapter,
  ) {}

  async get(url: string, engine: "axios" | "playwright" = "axios"): Promise<string> {
    if (engine === "playwright") {
      return this.playwright.get(url);
    }

    const html = await this.axios.get(url);
    if (looksLikeCloudflare(html)) {
      this.logger.logWarning(`Cloudflare detected on ${url}, falling back to Playwright`);
      return this.playwright.get(url);
    }
    return html;
  }

  async close(): Promise<void> {
    await this.playwright.close();
  }
}
