export default interface HTTPRequests {
  get(url: string, params?: any): Promise<any>;
}
