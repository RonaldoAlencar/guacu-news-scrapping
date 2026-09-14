import { createHash } from "crypto";
import { Queue as QueueBullMQ } from "bullmq";
import Queue from "../../domain/adapters/Queue";
import LoggerAdapter from "../../domain/adapters/LoggerAdapter";
import News from "../../domain/entities/News";
import { AppConfig } from "../config/env";
import { redisConnection } from "./redis";

export const NEWS_QUEUE_NAME = "news";

export function newsJobId(link: string): string {
  return createHash("sha256").update(link).digest("hex");
}

function isDuplicateJob(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.toLowerCase().includes("already exists");
}

export default class BullMQ implements Queue {
  private queue: QueueBullMQ | undefined;

  constructor(
    private readonly config: AppConfig["redis"],
    private readonly logger: LoggerAdapter,
  ) {}

  async connect(): Promise<void> {
    this.logger.logInfo(`Connecting to BullMQ: ${NEWS_QUEUE_NAME}`);
    this.queue = new QueueBullMQ(NEWS_QUEUE_NAME, {
      connection: redisConnection(this.config),
    });
    await this.queue.waitUntilReady();
  }

  async publish(news: News): Promise<void> {
    if (!this.queue) {
      throw new Error("BullMQ queue is not connected");
    }
    this.logger.logInfo(`Publishing message to queue: ${NEWS_QUEUE_NAME} with title: ${news.title}`);
    try {
      await this.queue.add("send", news.toItem(), {
        jobId: newsJobId(news.link),
        removeOnComplete: { age: 86400 * 10 },
        removeOnFail: { age: 86400 * 10 },
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
      });
    } catch (error) {
      if (isDuplicateJob(error)) {
        this.logger.logInfo(`Job already queued for ${news.link}`);
        return;
      }
      throw error;
    }
  }

  async waitUntilEmpty(): Promise<void> {
    if (!this.queue) {
      return;
    }
    for (;;) {
      const counts = await this.queue.getJobCounts("waiting", "active", "delayed", "paused");
      const pending =
        Number(counts.waiting ?? 0) +
        Number(counts.active ?? 0) +
        Number(counts.delayed ?? 0) +
        Number(counts.paused ?? 0);
      if (pending === 0) {
        return;
      }
      this.logger.logInfo(`Waiting for WhatsApp queue to drain (${pending} remaining)`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  async close(): Promise<void> {
    if (this.queue) {
      await this.queue.close();
      this.queue = undefined;
    }
  }
}
