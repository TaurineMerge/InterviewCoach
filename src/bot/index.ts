import TelegramBot from 'node-telegram-bot-api';
import { Checklist } from './components/checklist.js';
import { Menu } from './components/menu.js';
import { logger } from '@logger/logger.js';
import 'dotenv/config';
import { createHandlers } from './handlers/handlers.js';

function initBot(token: string): TelegramBot {
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

export function runBot() {
  const bot = initBot(process.env.TG_BOT_TOKEN || '');

  const generalTopics = ['Frontend', 'Backend', 'Архитектура', 'HR-скрининг'];
  const specificTopics = ['Next.js', 'CSS', 'Tailwind', 'Solid'];

  const mainMenu = new Menu([
    { text: 'Выбрать темы', callback: 'set-topics' },
    { text: 'Начать подготовку', callback: 'start-interview' },
  ]);
  const navMenu = new Menu([
    { text: 'Далее', callback: 'next' },
    { text: 'Отмена', callback: 'cancel' },
  ]);

  const generalChecklist = new Checklist(generalTopics);
  const specificChecklist = new Checklist(specificTopics);

  bot.on('polling_error', (error) => logger.error(`polling error: ${error}`));
  bot.on('error', (error) => logger.error(`error: ${error}`));

  bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Выбирай темы и начинай подготовку!', {
      reply_markup: mainMenu.getMarkup('main'),
    });
  });

  bot.on('callback_query', async (query) => {
    const chatId = query.message?.chat.id;
    if (!chatId) return;

    const [prefix, id] = query.data?.split('_') || [];
    const handlers = createHandlers(
      generalChecklist,
      specificChecklist,
      navMenu,
      mainMenu,
    );

    const handler = handlers[prefix as keyof typeof handlers];
    if (handler) {
      await handler(id, query, bot);
    }
  });
}
