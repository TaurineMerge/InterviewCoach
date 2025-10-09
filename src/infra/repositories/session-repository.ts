import { RedisClientType } from 'redis';
import { ISessionState, ISessionStore } from '@/types/session.js';

export class RedisSessionRepository implements ISessionStore {
  constructor(
    private redis: RedisClientType,
    private ttlSeconds: number = 3600,
  ) {}

  async get(sessionId: string): Promise<ISessionState | null> {
    const raw = await this.redis.get(`session:${sessionId}`);
    return raw ? JSON.parse(raw) : null;
  }

  async set(sessionId: string, state: ISessionState): Promise<void> {
    await this.redis.set(`session:${sessionId}`, JSON.stringify(state), {
      EX: this.ttlSeconds,
    });
  }

  async delete(sessionId: string): Promise<void> {
    await this.redis.del(`session:${sessionId}`);
  }
}
