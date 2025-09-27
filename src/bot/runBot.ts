import TelegramBot from 'node-telegram-bot-api';
import { Menu } from './components/menu';
import { Checklist } from './components/checklist';
import { createHandlers } from './handlers/handlers';
import { logger } from '@logger/logger';

export function runBot(bot: TelegramBot) {
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
    try {
      const chatId = msg.chat.id;
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
