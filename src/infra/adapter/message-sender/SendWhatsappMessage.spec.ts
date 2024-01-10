import AxiosAdapter from "../axios/AxiosAdapter";
import SendWhatsappMessage from "./SendWhatsappMessage";
import dotenv from 'dotenv';

describe('SendWhatsappMessage', () => {
  dotenv.config();
  it('should send a message to whatsapp', async () => {
    const httpRequests = new AxiosAdapter();
    const sendWhatsappMessage = new SendWhatsappMessage(httpRequests);
    expect(await sendWhatsappMessage.send('test')).toBe(undefined);
  });
});
