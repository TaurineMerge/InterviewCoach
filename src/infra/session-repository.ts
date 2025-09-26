import { RedisClientType } from 'redis';
import { SessionState, SessionStore } from '@models/session.js';

export class RedisSessionStore implements SessionStore {
  constructor(
    private redis: RedisClientType,
    private ttlSeconds: number = 3600,
  ) {}

  async get(sessionId: string): Promise<SessionState | null> {
    const raw = await this.redis.get(`session:${sessionId}`);
    return raw ? JSON.parse(raw) : null;
  }

  async set(sessionId: string, state: SessionState): Promise<void> {
    await this.redis.set(`session:${sessionId}`, JSON.stringify(state), {
      EX: this.ttlSeconds,
    });
  }

  async delete(sessionId: string): Promise<void> {
    await this.redis.del(`session:${sessionId}`);
  }
}
