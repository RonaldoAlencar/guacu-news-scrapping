export default interface LoggerAdapter {
  logDebug(message: string): void;
  logInfo(message: string): void;
  logError(message: string): void;
  logWarning(message: string): void;
}