import { logger } from '@/utils/logger/logger.js';
import { createClient, RedisClientType } from 'redis';
import 'dotenv/config';

let client: RedisClientType | null = null;

export async function connectSession(): Promise<RedisClientType> {
  try {
    if (client?.isOpen) {
      return client;
    }

    client = createClient({
      url: process.env.SESSION_URL,
    }) as RedisClientType;

    client.on('error', (err) =>
      logger.error('Session config > Redis Client Error', err),
    );
    client.on('connect', () =>
      logger.info('Session config > Redis Client Connected'),
    );
    client.on('disconnect', () =>
      logger.info('Session config > Redis Client Disconnected'),
    );

    await client.connect();

    return client;
  } catch (e) {
    logger.error(`Session config > Error while connecting to session: ${e}`);
    client = null;
    throw e;
  }
}

export function getSession(): RedisClientType {
  if (!client || !client.isOpen) {
    throw new Error(
      'Session config > Redis client is not connected. Call connectSession() first.',
    );
  }
  return client;
}

export async function closeSession(): Promise<void> {
  try {
    if (client?.isOpen) {
      await client.quit();
    }
    client = null;
  } catch (e) {
    logger.error(`Session config > Error while closing session: ${e}`);
    throw e;
  }
}
