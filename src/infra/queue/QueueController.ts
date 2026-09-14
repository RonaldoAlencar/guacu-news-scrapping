import { Job, Worker } from "bullmq";
import SendMessage from "../../domain/adapters/SendMessage";
import LoggerAdapter from "../../domain/adapters/LoggerAdapter";
import NewsRepository from "../../domain/repository/NewsRepository";
import { NewsItem } from "../../domain/entities/NewsItem";
import { AppConfig } from "../config/env";
import { NEWS_QUEUE_NAME } from "./BullMQ";
import { redisConnection } from "./redis";
import { formatWhatsappMessage } from "../messaging/formatWhatsappMessage";

export default class QueueController {
  private worker: Worker | undefined;

  constructor(
    private readonly config: AppConfig,
    private readonly sendMessage: SendMessage,
    private readonly logger: LoggerAdapter,
    private newsRepository?: NewsRepository,
  ) {}

  setNewsRepository(repository: NewsRepository): void {
    this.newsRepository = repository;
  }

  start(): Worker {
    this.worker = new Worker(
      NEWS_QUEUE_NAME,
      async (job: Job<NewsItem>) => {
        const message = formatWhatsappMessage(job.data);
        await this.sendMessage.send(message);
        if (this.newsRepository && job.data.link) {
          await this.newsRepository.markPublished(job.data.link);
        }
      },
      {
        connection: redisConnection(this.config.redis),
        concurrency: 1,
        lockDuration: 120000,
        limiter: { max: 1, duration: Math.max(this.config.sendDelayMs, 1000) },
      },
    );

    this.worker.on("completed", (job: Job<NewsItem>) => {
      this.logger.logInfo(`Job completed ${job.data.title}`);
    });

    this.worker.on("failed", (job: Job<NewsItem> | undefined, err: Error) => {
      this.logger.logError(`Job failed ${job?.data.title ?? "unknown"} ${err.message}`);
    });

    return this.worker;
  }

  async close(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
      this.worker = undefined;
    }
  }
}
