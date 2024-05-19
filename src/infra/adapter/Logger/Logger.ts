import LoggerAdapter from "../../../domain/adapters/LoggerAdapter";
import formatDate from "../../../utils/formatDate";

export default class Logger implements LoggerAdapter {
  logInfo(message: string): void {
    console.log(`[${formatDate(new Date())}] - ${message}`);
  }

  logError(message: string): void {
    console.log(`[${formatDate(new Date())}] - ${message}`);
  }

  logWarning(message: string): void {
    console.log(`[${formatDate(new Date())}] - ${message}`);
  }

  logDebug(message: string): void {
    console.log(`[${formatDate(new Date())}] - ${message}`);
  }
}
