import Queue from "../../../domain/adapters/Queue";
import SendMessage from "../../../domain/adapters/SendMessage";
import { Worker, Job } from "bullmq";

export default class QueueController {
  constructor(readonly queue: Queue, readonly sendMessage: SendMessage) {
    const worker = new Worker(
      "news",
      async (job: Job) => {
        const { title, link, postedAt } = job.data;
        //await this.sendMessage.send(`📰 ${title}\n\n${link}\n${postedAt}`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      },
      { 
        connection: { host: "localhost", port: 6379 }, 
        concurrency: 1, 
        removeOnComplete: { age: 86400 }, 
        removeOnFail: { age: 86400 },
        runRetryDelay: 100000,
      }
    );

    worker.on("completed", (job: Job) => {
      console.log("Job completed", job.data.title);
    });
  }
}
