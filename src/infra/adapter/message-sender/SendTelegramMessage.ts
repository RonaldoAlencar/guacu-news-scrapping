import HTTPRequests from "../../../domain/adapters/HTTPRequests";
import LoggerAdapter from "../../../domain/adapters/LoggerAdapter";
import SendMessage from "../../../domain/adapters/SendMessage";

export default class SendTelegramMessage implements SendMessage {
  constructor (private readonly httpRequests: HTTPRequests, private readonly logger: LoggerAdapter) {}

  async send (message: string): Promise<void> {
    const encodedMessage = encodeURI(message);
    this.logger.logInfo(`Sending message to telegram`);
    await this.httpRequests.get(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${process.env.TELEGRAM_CHAT_ID}&text=${encodedMessage}`);
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}
