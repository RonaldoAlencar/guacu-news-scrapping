import HTTPRequests from "../../../domain/adapters/HTTPRequests";
import LoggerAdapter from "../../../domain/adapters/LoggerAdapter";
import SendMessage from "../../../domain/adapters/SendMessage";

export default class SendWhatsappMessage implements SendMessage {
  constructor (private readonly httpRequests: HTTPRequests, private readonly logger: LoggerAdapter) {}

  async send (message: string): Promise<void> {
    this.logger.logInfo(`Sending message to whatsapp`);
    await this.httpRequests.post(`${process.env.WHATSAPP_API_URL}/message/sendText/${process.env.WHATSAPP_INSTANCE_NAME}`, {
      "number": process.env.WHATSAPP_GROUP_ID,
      "text": message,
    }, {
      headers: {
        'Apikey': process.env.WHATSAPP_API_KEY,
      }
    });
  }
}
