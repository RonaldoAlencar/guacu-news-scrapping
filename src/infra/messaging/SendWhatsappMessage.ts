import axios from "axios";
import HTTPRequests from "../../domain/adapters/HTTPRequests";
import LoggerAdapter from "../../domain/adapters/LoggerAdapter";
import SendMessage from "../../domain/adapters/SendMessage";
import { AppConfig } from "../config/env";
import { sleep } from "../../utils/formatDate";

export default class SendWhatsappMessage implements SendMessage {
  constructor(
    private readonly httpRequests: HTTPRequests,
    private readonly logger: LoggerAdapter,
    private readonly config: AppConfig["whatsapp"],
    private readonly maxAttempts = 3,
  ) {}

  async send(message: string): Promise<void> {
    const url = `${this.config.apiUrl}/message/sendText/${this.config.instanceName}`;
    let lastError: unknown;

    for (let attempt = 1; attempt <= this.maxAttempts; attempt += 1) {
      try {
        this.logger.logInfo(`Sending message to whatsapp (attempt ${attempt})`);
        await this.httpRequests.post(
          url,
          {
            number: this.config.groupId,
            text: message,
          },
          {
            headers: {
              Apikey: this.config.apiKey,
            },
          },
        );
        return;
      } catch (error: unknown) {
        lastError = error;
        const details = axios.isAxiosError(error)
          ? `${error.message} ${JSON.stringify(error.response?.data ?? {})}`
          : error instanceof Error
            ? error.message
            : String(error);
        this.logger.logError(`WhatsApp send failed: ${details}`);
        if (attempt < this.maxAttempts) {
          await sleep(1000 * attempt);
        }
      }
    }

    throw lastError instanceof Error ? lastError : new Error(String(lastError));
  }
}
