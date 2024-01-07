import { Telegraf } from "telegraf";
import SendMessage from "../../../domain/adapters/SendMessage";

export default class SendTelegramMessage implements SendMessage {
  private bot: Telegraf = new Telegraf(process.env.TELEGRAM_BOT_TOKEN as string);

  async send (message: string): Promise<void> {
    await this.bot.telegram.sendMessage(process.env.TELEGRAM_CHAT_ID as string, message);
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100000));
  }
}
