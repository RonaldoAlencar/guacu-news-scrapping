import axios, { AxiosInstance } from "axios";
import HTTPRequests, { HttpGetOptions, HttpPostOptions } from "../../domain/adapters/HTTPRequests";

export const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export default class AxiosAdapter implements HTTPRequests {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      timeout: 25000,
      headers: {
        "User-Agent": BROWSER_USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      },
      maxRedirects: 5,
      validateStatus: (status) => status >= 200 && status < 400,
    });
  }

  async get(url: string, options?: HttpGetOptions): Promise<string> {
    const response = await this.client.get<string>(url, {
      headers: options?.headers,
      responseType: "text",
      transformResponse: [(data) => data],
    });
    return typeof response.data === "string" ? response.data : String(response.data ?? "");
  }

  async post<T = unknown>(url: string, body?: unknown, options?: HttpPostOptions): Promise<T> {
    const response = await this.client.post<T>(url, body, {
      headers: options?.headers,
    });
    return response.data;
  }
}
