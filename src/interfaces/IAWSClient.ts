export interface IAWSClient {
  connect(brokerEndpoint: string): Promise<void>;
  subscribe(topics: string[]): Promise<void>;
  publish(topic: string, message: string): Promise<void>;
}
