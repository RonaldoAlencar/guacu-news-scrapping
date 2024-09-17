import 'dotenv/config';
import Queue from "../../../domain/adapters/Queue";
import SendMessage from "../../../domain/adapters/SendMessage";
import { Worker, Job } from "bullmq";

export default class QueueController {
  constructor(readonly queue: Queue, readonly sendMessage: SendMessage) {
    const worker = new Worker(
      "news",
      async (job: Job) => {
        const { title, link, postedAt } = job.data;
        await this.sendMessage.send(`📰 ${title}\n\n${link}\n${postedAt}`);
      },
      { 
        connection: { host: process.env.REDIS_HOST, port: Number(process.env.REDIS_PORT) },
        concurrency: 3, 
        removeOnComplete: { age: 86400 * 10 }, 
        removeOnFail: { age: 86400 * 10 },
        runRetryDelay: 100000,
      }
    );

    worker.on("completed", (job: Job) => {
      console.log("Job completed", job?.data.title);
    });

    worker.on("failed", (job: Job | undefined, err: Error) => {
      console.log("Job failed", job?.data.title, err);
    });
  }
}
