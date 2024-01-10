import LoggerAdapter from "../../../domain/adapters/LoggerAdapter";
import { red, green, cyan, cyanBright } from 'console-log-colors';
import formatDate from "../../../utils/formatDate";

export default class Logger implements LoggerAdapter {
  logInfo(message: string): void {
    console.log(cyan(`[${formatDate(new Date())}] - ${message}`));
  }

  logError(message: string): void {
    console.log(red(`[${formatDate(new Date())}] - ${message}`));
  }

  logWarning(message: string): void {
    console.log(cyanBright(`[${formatDate(new Date())}] - ${message}`));
  }

  logDebug(message: string): void {
    console.log(green(`[${formatDate(new Date())}] - ${message}`));
  }
}
