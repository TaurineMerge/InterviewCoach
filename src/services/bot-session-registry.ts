import { BotClient } from '@/services/bot-client.js';
import { SessionManager } from '@/services/session-manager.js';
import { QuestionSelector } from '@/services/question-selector.js';
import { TreeNode } from '@/models/node.js';
import { logger } from '@logger/logger.js';

export class BotSessionRegistry {
  private clients = new Map<number, BotClient>();

  constructor(
    private sessionManager: SessionManager,
    private questionSelector: QuestionSelector,
    private fsTree: TreeNode,
  ) {}

  getOrCreate(userId: number): BotClient {
    if (!this.clients.has(userId)) {
      logger.debug(`Creating new BotClient for user ${userId}`);
      const client = new BotClient(
        this.sessionManager,
        this.questionSelector,
        this.fsTree,
      );
      client.setClientId(userId);
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
