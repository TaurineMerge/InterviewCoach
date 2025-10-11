import { IBotClientFactory } from '@/types/bot-client-factory.js';
import { BotClient } from './bot-client.js';

export class BotSessionRegistry {
  private clients = new Map<number, BotClient>();

  constructor(private readonly factory: IBotClientFactory) {}

  getOrCreate(userId: number): BotClient {
    if (!this.clients.has(userId)) {
      const client = this.factory.createClient(userId);
      this.clients.set(userId, client);
    }
    return this.clients.get(userId)!;
  }

  remove(userId: number): void {
    this.clients.delete(userId);
  }

  has(userId: number): boolean {
    return this.clients.has(userId);
  }
}
