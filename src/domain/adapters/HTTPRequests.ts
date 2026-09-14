export type HttpGetOptions = {
  headers?: Record<string, string>;
};

export type HttpPostOptions = {
  headers?: Record<string, string>;
};

export default interface HTTPRequests {
  get(url: string, options?: HttpGetOptions): Promise<string>;
  post<T = unknown>(url: string, body?: unknown, options?: HttpPostOptions): Promise<T>;
}
