import { Db, MongoClient } from 'mongodb';
import { logger } from '@logger/logger';
import 'dotenv/config';

let client: MongoClient | null = null;
let db: Db | null = null;

try {
  client = new MongoClient(process.env.DB_URI || '');
  db = client.db('progress');
  await db.command({ ping: 1 });
  logger.info('Database config > Successfully connected to database!');
} catch (e) {
  logger.error(`Database config > Error connecting to database: ${e}`);
}

export default db;
