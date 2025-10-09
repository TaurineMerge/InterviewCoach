import { BotClient } from '@/core/client/bot-client.js';

export interface IBotClientFactory {
  createClient(userId: number): BotClient;
}
