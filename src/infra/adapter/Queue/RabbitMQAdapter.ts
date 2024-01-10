import amqp from "amqplib";
import Queue from "../../../domain/adapters/Queue";
import LoggerAdapter from "../../../domain/adapters/LoggerAdapter";

export default class RabbitMQAdapter implements Queue {
  connection: any;

  constructor (readonly logger: LoggerAdapter) {}

  async connect (connectionName: string): Promise<void> {
    try {
      this.connection = await amqp.connect("amqp://localhost", {
        clientProperties: {
          connection_name: connectionName,
        },
      });
      this.logger.logInfo("Connected to RabbitMQ");
    } catch (err) {
      this.logger.logError("Error connecting to RabbitMQ");
      this.logger.logError(err as string);
      throw err;
    }
  }

  async on (queueName: string, callback: Function): Promise<void> {
    const channel = await this.connection.createChannel();
    await channel.assertQueue(queueName, { durable: true });
    await channel.consume(queueName, async (message: any) => {
      const input = JSON.parse(message.content.toString());
      await callback(input);
      channel.ack(message);
    });
  }

  async publish (queueName: string, data: any): Promise<void> {
    const channel = await this.connection.createChannel();
    await channel.assertQueue(queueName, { durable: true });
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));
  }
}
