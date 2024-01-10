import HTTPRequests from "../../../domain/adapters/HTTPRequests";
import SendMessage from "../../../domain/adapters/SendMessage";

export default class SendWhatsappMessage implements SendMessage {
  constructor (private readonly httpRequests: HTTPRequests) {}

  async send (message: string): Promise<void> {
    console.log(`Sending message to whatsapp`);
    await this.httpRequests.post(`${process.env.WHATSAPP_API_URL}/message/sendText/${process.env.WHATSAPP_INSTANCE_NAME}`, {
      "number": process.env.WHATSAPP_GROUP_ID,
      "textMessage": {
        "text": message
      },
        "options": {
          "delay": 1200,
          "presence": "composing",
          "linkPreview": true
        }, 
      }, {
      headers: {
        'Apikey': process.env.WHATSAPP_API_KEY,
      }
    });
  }
}
