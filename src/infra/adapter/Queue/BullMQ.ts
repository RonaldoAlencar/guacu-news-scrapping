import { Queue as QueueBullMQ } from 'bullmq';
import Queue from "../../../domain/adapters/Queue";
import LoggerAdapter from '../../../domain/adapters/LoggerAdapter';

export default class BullMQ implements Queue {
  private queue: QueueBullMQ | undefined;

  constructor(readonly logger: LoggerAdapter) {
    this.logger.logInfo('Initializing BullMQ');
  }

  connect(connectionName: string): Promise<void> {
    this.logger.logInfo(`Connecting to BullMQ: ${connectionName}`);
    this.queue = new QueueBullMQ(connectionName, { connection: { host: 'redis', port: 6379 } });
    return Promise.resolve();
  }

  on(queueName: string, callback: Function): Promise<void> {
    this.logger.logInfo(`Subscribing to queue: ${queueName}`);
    this.queue!.getJob(queueName).then(job => {
      console.log(job);
    });
    return Promise.resolve();
  }

  publish(queueName: string, data: any): Promise<void> {
    this.logger.logInfo(`Publishing message to queue: ${queueName} with title: ${data.title}`);
    this.queue!.add(queueName, data);
    return Promise.resolve();
  }
}