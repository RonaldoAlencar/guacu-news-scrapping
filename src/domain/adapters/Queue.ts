import News from "../entities/News";

export default interface Queue {
  connect(): Promise<void>;
  publish(news: News): Promise<void>;
  close(): Promise<void>;
}
