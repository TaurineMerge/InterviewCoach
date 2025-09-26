import TelegramBot from 'node-telegram-bot-api';
import { logger } from '@logger/logger';

export function botInit(token: string): TelegramBot {
  try {
    if (!token) {
      logger.error('telegram bot token is not defined');
      throw new Error('telegram bot token is not defined');
    }

    const bot = new TelegramBot(token, {
      polling: { autoStart: false, interval: 300 },
      filepath: false,
    });

    logger.info('Bot is up and running');

    return bot;
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
}
