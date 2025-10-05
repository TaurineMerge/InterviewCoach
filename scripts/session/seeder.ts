import { createClient } from 'redis';
import { faker } from '@faker-js/faker';
import { logger } from '../../src/utils/logger/logger.ts';
import { RedisSessionStore } from '../../dist/infra/session-repository.js';
import 'dotenv/config';

class RedisSessionSeeder {
  private store: RedisSessionStore;
  private client;

  constructor() {
    this.client = createClient({
      url: process.env.SESSION_URL || '',
    });

    this.client.on('error', (err) => logger.error('Redis Client Error', err));
    this.store = new RedisSessionStore(this.client);
  }

  async connect() {
    await this.client.connect();
  }

  generateSessions(count = 20) {
    const sessions = {};

    for (let i = 0; i < count; i++) {
      const sessionId = faker.string.uuid();
      sessions[sessionId] = {
        userId: faker.number.int({ min: 1, max: 999999999 }),
        questions: Array.from(
          { length: faker.number.int({ min: 3, max: 7 }) },
          () => faker.lorem.sentence(),
        ),
        currentIndex: faker.number.int({ min: 0, max: 2 }),
      };
    }

    return sessions;
  }

  async seed() {
    try {
      logger.debug('Starting Redis session seeding...');
      const sessions = this.generateSessions(20);

      for (const [sessionId, state] of Object.entries(sessions)) {
        await this.store.set(sessionId, state);
      }

      logger.debug(
        `Seeding completed successfully! Inserted ${Object.keys(sessions).length} sessions.`,
      );
      return sessions;
    } catch (error) {
      logger.error('Redis session seeding failed:', error);
      throw error;
    } finally {
      await this.client.disconnect();
    }
  }
}

async function seedRedis() {
  const seeder = new RedisSessionSeeder();
  await seeder.connect();
  await seeder.seed();
  process.exit(0);
}

await seedRedis();
