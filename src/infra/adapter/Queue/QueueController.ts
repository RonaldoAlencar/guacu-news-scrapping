import Queue from "../../../domain/adapters/Queue";
import SendMessage from "../../../domain/adapters/SendMessage";
import News from "../../../domain/entities/News";

export default class QueueController {
  private messages: string[] = [];

  constructor(readonly queue: Queue, readonly sendMessage: SendMessage) {
    const processMessages = async () => {
      if (this.messages.length > 0) {
        await this.sendMessages();
      }
      setTimeout(processMessages, 10000);
    };

    processMessages();

    this.queue.on("news", async (event: News) => {
      console.log(`Received news: ${event.title}`);
      this.messages.push(`📰 ${event.title}\n\n${event.link}\n${event.postedAt}`);
    })
  }

  async sendMessages(): Promise<void> {
    console.log(`Sending ${this.messages.length} messages`);

    for (const message of this.messages) {
      try {
        await this.sendMessage.send(message);
        const position = this.messages.indexOf(message);
        this.messages.splice(position, 1);
      } catch (error) {
        console.log(error);
      }
    }
  }
}
