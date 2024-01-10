import HTTPRequests from "../../../domain/adapters/HTTPRequests";
import cloudscraper from "cloudscraper";

export default class CloudscrapperAdapter implements HTTPRequests {
  async get(url: string): Promise<any> {
    const response = await cloudscraper({
      uri: url,
      headers: {
        'User-Agent': 'Ubuntu Chromium/34.0.1847.116 Chrome/34.0.1847.116 Safari/537.36',
        'Cache-Control': 'private',
        'Accept': 'application/xml,application/xhtml+xml,text/html;q=0.9, text/plain;q=0.8,image/png,*/*;q=0.5'
      },    
    });
    return response;
  }

  async post(url: string, params?: any): Promise<any> {
    throw new Error("Method not implemented.");
  }
}
