import axios, { AxiosResponse } from 'axios';
import HTTPRequests from "../../../domain/adapters/HTTPRequests";

export default class AxiosAdapter implements HTTPRequests {
  async get<T>(url: string, params?: any): Promise<T> {
    const response: AxiosResponse = await axios.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response: AxiosResponse = await axios.post<T>(url, data);
    return response.data;
  }
}
