import { Browser, chromium } from "playwright";
import HTTPRequests, { HttpGetOptions } from "../../domain/adapters/HTTPRequests";
import { sleep } from "../../utils/formatDate";
import { BROWSER_USER_AGENT } from "./AxiosAdapter";

export default class PlaywrightAdapter implements HTTPRequests {
  private browser: Browser | undefined;

  private async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: [
          "--disable-blink-features=AutomationControlled",
          "--no-sandbox",
          "--disable-dev-shm-usage",
        ],
      });
    }
    return this.browser;
  }

  async get(url: string, options?: HttpGetOptions): Promise<string> {
    const browser = await this.getBrowser();
    const page = await browser.newPage({
      userAgent: options?.headers?.["User-Agent"] ?? BROWSER_USER_AGENT,
    });
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
      await page
        .waitForSelector(
          "article, h1, h2, h3, .news-flex, .td-module-container, .js-results, .vw-post-box, item",
          { timeout: 8000 },
        )
        .catch(() => undefined);
      await sleep(400);
      return await page.content();
    } finally {
      await page.close();
    }
  }

  async post<T = unknown>(): Promise<T> {
    throw new Error("PlaywrightAdapter.post is not implemented");
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = undefined;
    }
  }
}
