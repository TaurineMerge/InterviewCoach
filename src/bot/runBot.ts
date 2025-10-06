import TelegramBot from 'node-telegram-bot-api';
import { Menu } from './components/menu.js';
import { createHandlers } from './handlers/handlers.js';
import { logger } from '@logger/logger.js';
import { BotSessionRegistry } from '@/services/bot-session-registry.js';

export function runBot(
  bot: TelegramBot,
  clientSessionRegistry: BotSessionRegistry,
) {
  const mainMenu = new Menu([
    { text: 'Выбрать темы', callback: 'set-topics' },
    { text: 'Начать подготовку', callback: 'start-interview' },
  ]);
  const navMenu = new Menu([
    { text: 'Далее', callback: 'next' },
    { text: 'Отмена', callback: 'cancel' },
  ]);

  bot.on('polling_error', (error) => logger.error(`polling error: ${error}`));
  bot.on('error', (error) => logger.error(`error: ${error}`));

  bot.onText(/\/start/, (msg) => {
    try {
      const chatId = msg.chat.id;
      const client = clientSessionRegistry.getOrCreate(chatId);
      client.initChecklists();
      logger.debug(`User ${chatId} started the bot`);
    } catch (e) {
      logger.error(`Error while starting the bot: ${e}`);
    }
    bot.sendMessage(msg.chat.id, 'Выбирай темы и начинай подготовку!', {
      reply_markup: mainMenu.getMarkup('main'),
    });
  });

  bot.on('callback_query', async (query) => {
    const chatId = query.message?.chat.id;
    if (!chatId) return;

    const client = clientSessionRegistry.getOrCreate(chatId);

    const [prefix, id] = query.data?.split('_') || [];
    const handlers = createHandlers(navMenu, mainMenu, client);

    const handler = handlers[prefix as keyof typeof handlers];
    if (handler) {
      await handler(id, query, bot);
    }
  });
}
