import HTTPRequests from "../../../domain/adapters/HTTPRequests";
import LoggerAdapter from "../../../domain/adapters/LoggerAdapter";
import SendWhatsappMessage from "./SendWhatsappMessage";

describe('SendWhatsappMessage', () => {
  let mockHttpAdapter: HTTPRequests = {
    post: jest.fn(),
    get: jest.fn(),
  }
  let mockLoggerAdapter: LoggerAdapter = {
    logDebug: jest.fn(),
    logError: jest.fn(),
    logInfo: jest.fn(),
    logWarning: jest.fn(),
  }

  it('should send a message to whatsapp', async () => {
    const input = { message: 'send message test' };
    const spyPost = jest.spyOn(mockHttpAdapter, 'post');
    const sendWhatsappMessage = new SendWhatsappMessage(mockHttpAdapter, mockLoggerAdapter);
    await sendWhatsappMessage.send(input.message);

    expect(spyPost).toHaveBeenCalled();
    expect(spyPost.mock.calls[0][1].text).toBe(input.message);
  });
});
