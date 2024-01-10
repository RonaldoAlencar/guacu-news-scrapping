import amqp from "amqplib";
import Queue from "../../../domain/adapters/Queue";

export default class RabbitMQAdapter implements Queue {
  connection: any;

  async connect (connectionName: string): Promise<void> {
    try {
      this.connection = await amqp.connect("amqp://localhost", {
        clientProperties: {
          connection_name: connectionName,
        },
      });
      console.log("Connected to RabbitMQ");
    } catch (err) {
      console.log("Error connecting to RabbitMQ");
      console.log(err);
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
