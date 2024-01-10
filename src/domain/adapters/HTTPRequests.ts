export default interface HTTPRequests {
  get(url: string, params?: any): Promise<any>;
  post(url: string, body?: any, params?: any): Promise<any>;
}
