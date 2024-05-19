import { Kafka } from 'kafkajs';
import Queue from "../../../domain/adapters/Queue";
import LoggerAdapter from "../../../domain/adapters/LoggerAdapter";

export default class KafkaAdapter implements Queue {
  kafka: Kafka;
  producer: any;
  consumer: any;

  constructor (readonly logger: LoggerAdapter) {
    this.kafka = new Kafka({
      clientId: 'my-app',
      brokers: ['kafka:29092'],
      retry: {
        initialRetryTime: 30000,
        retries: 50
      }
    });
  }

  async connect (connectionName: string): Promise<void> {
    try {
      this.producer = this.kafka.producer();
      this.consumer = this.kafka.consumer({ groupId: connectionName });
      await this.producer.connect();
      await this.consumer.connect();
      this.logger.logInfo("Connected to Kafka");
    } catch (err) {
      this.logger.logError("Error connecting to Kafka");
      this.logger.logError(err as string);
      throw err;
    }
  }

  async on (topicName: string, callback: Function): Promise<void> {
    await this.consumer.subscribe({ topic: topicName, fromBeginning: true });
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }: any) => {
        const input = JSON.parse(message.value.toString());
        await callback(input);
      },
    });
  }

  async publish (topicName: string, data: any): Promise<void> {
    await this.producer.send({
      topic: topicName,
      messages: [
        { value: JSON.stringify(data) },
      ],
    });
  }
}