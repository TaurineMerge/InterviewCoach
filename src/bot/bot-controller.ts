import TelegramBot from 'node-telegram-bot-api';
import { Menu } from './components/menu.js';
import { createHandlers } from './handlers/handlers.js';
import { logger } from '@logger/logger.js';
import { BotSessionRegistry } from '@/services/bot-session-registry.js';

export class BotController {
  private bot: TelegramBot;
  private clientSessionRegistry: BotSessionRegistry;
  private mainMenu: Menu;
  private navMenu: Menu;

  constructor(bot: TelegramBot, clientSessionRegistry: BotSessionRegistry) {
    this.bot = bot;
    this.clientSessionRegistry = clientSessionRegistry;

    this.mainMenu = new Menu([
      { text: 'Выбрать темы', callback: 'set-topics' },
      { text: 'Начать подготовку', callback: 'start-interview' },
    ]);

    this.navMenu = new Menu([
      { text: 'Далее', callback: 'next' },
      { text: 'Отмена', callback: 'cancel' },
    ]);
  }

  public start(): void {
    this.setupErrorHandlers();
    this.setupMessageHandlers();
    this.setupCallbackHandlers();

    logger.info('Bot controller started');
  }

  private setupErrorHandlers(): void {
    this.bot.on('polling_error', (error) =>
      logger.error(`polling error: ${error}`),
    );
    this.bot.on('error', (error) => logger.error(`bot error: ${error}`));
  }

  private setupMessageHandlers(): void {
    this.bot.onText(/\/start/, (msg) => this.handleStart(msg));
    // Добавьте другие текстовые обработчики здесь
    // this.bot.onText(/\/help/, (msg) => this.handleHelp(msg));
  }

  private setupCallbackHandlers(): void {
    this.bot.on('callback_query', async (query) => this.handleCallback(query));
  }

  private handleStart(msg: TelegramBot.Message): void {
    try {
      const chatId = msg.chat.id;
      const client = this.clientSessionRegistry.getOrCreate(chatId);
      client.initChecklists();

      logger.debug(`User ${chatId} started the bot`);

      this.bot.sendMessage(chatId, 'Выбирай темы и начинай подготовку!', {
        reply_markup: this.mainMenu.getMarkup('main'),
      });
    } catch (error) {
      logger.error(`Error while starting the bot: ${error}`);
      // Можно добавить отправку сообщения об ошибке пользователю
    }
  }

  private async handleCallback(
    query: TelegramBot.CallbackQuery,
  ): Promise<void> {
    const chatId = query.message?.chat.id;
    if (!chatId) return;

    try {
      const client = this.clientSessionRegistry.getOrCreate(chatId);
      const handlers = createHandlers(this.navMenu, this.mainMenu, client);

      const [prefix, id] = query.data?.split('_') || [];
      const handler = handlers[prefix as keyof typeof handlers];

      if (handler) {
        await handler(id, query, this.bot);
      } else {
        logger.warn(`No handler found for callback prefix: ${prefix}`);
      }
    } catch (error) {
      logger.error(`Error handling callback: ${error}`);
      // Обработка ошибок для callback
    }
  }
}
