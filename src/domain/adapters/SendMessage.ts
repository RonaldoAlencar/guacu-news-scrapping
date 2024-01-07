export default interface SendMessage {
  send (message: string): Promise<void>;
}