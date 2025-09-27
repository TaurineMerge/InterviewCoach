import TelegramBot from 'node-telegram-bot-api';
import { logger } from '@logger/logger.js';
import 'dotenv/config';

export function initBot(token: string): TelegramBot {
  if (!token) {
    logger.error('telegram bot token is not defined');
    throw new Error('telegram bot token is not defined');
  }

  try {
    logger.debug('Initializing telegram bot');
    const bot = new TelegramBot(token, { polling: true, filepath: false });
    logger.info('Bot is up and running');

    return bot;
  } catch (error) {
    logger.error(`telegram bot init error: ${error}`);
    throw new Error(`telegram bot init error: ${error}`);
  }
}
