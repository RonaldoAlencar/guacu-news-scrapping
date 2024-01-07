import amqp from "amqplib";
import Queue from "../../../domain/adapters/Queue";

export default class RabbitMQAdapter implements Queue {
  connection: any;

  async connect (): Promise<void> {
    this.connection = await amqp.connect("amqp://localhost");
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
