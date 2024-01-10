export default interface Queue {
  connect (connectionName: string): Promise<void>;
  on (queueName: string, callback: Function): Promise<void>;
  publish (queueName: string, data: any): Promise<void>;
}
