import Queue from "../../domain/adapters/Queue";
import LoggerAdapter from "../../domain/adapters/LoggerAdapter";
import News from "../../domain/entities/News";

export default class LoggingQueue implements Queue {
  constructor(private readonly logger: LoggerAdapter) {}

  async connect(): Promise<void> {
    this.logger.logInfo("LoggingQueue connected (DRY_RUN)");
  }

  async publish(news: News): Promise<void> {
    this.logger.logInfo(`[${news.source} | ${news.city}] ${news.title} — ${news.link}`);
  }

  async close(): Promise<void> {}
}
