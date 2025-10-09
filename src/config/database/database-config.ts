import { Db, MongoClient } from 'mongodb';
import { logger } from '@/utils/logger/logger.js';
import 'dotenv/config';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectDatabase() {
  try {
    if (client && db) {
      return db;
    }

    client = new MongoClient(process.env.DB_URI || '');
    await client.connect();
    db = client.db(process.env.DB_NAME || '');

    await db.command({ ping: 1 });
    logger.info('Database config > Successfully connected to database!');
    return db;
  } catch (e) {
    await client?.close();
    client = null;
    db = null;
    logger.error(`Database config > Error connecting to database: ${e}`);
    throw e;
  }
}

export function getDatabase(): Db {
  if (!db) {
    throw new Error(
      'Database config > Database not initialized. Call connectDatabase() first.',
    );
  }
  return db;
}

export async function closeDatabase() {
  await client?.close();
  client = null;
  db = null;
}

connectDatabase().catch(console.error);

export default getDatabase;
