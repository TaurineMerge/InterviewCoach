import TelegramBot from 'node-telegram-bot-api';
import { Menu } from './components/menu.js';
import { createHandlers } from './handlers/handlers.js';
import { BotService } from '@/application/bot-service.js';

interface IBotServiceProvider {
  getServiceForChat(chatId: number): BotService;
}

export class BotController {
  private handlersMap: Record<number, ReturnType<typeof createHandlers>> = {};

  private mainMenu: Menu;
  private navMenu: Menu;

  constructor(
    private readonly bot: TelegramBot,
    private readonly serviceProvider: IBotServiceProvider,
  ) {
    this.mainMenu = new Menu([
      { text: 'Выбрать темы', callback: 'set-topics' },
      { text: 'Начать подготовку', callback: 'start-interview' },
    ]);

    this.navMenu = new Menu([
      { text: 'Далее', callback: 'next' },
      { text: 'Отмена', callback: 'cancel' },
    ]);
  }

  start() {
    this.setupMessageHandlers();
    this.setupCallbackHandlers();
  }

  private setupMessageHandlers() {
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const service = this.serviceProvider.getServiceForChat(chatId);

      this.handlersMap[chatId] = createHandlers(
        this.navMenu,
        this.mainMenu,
        service,
      );

      await service.start();

      this.bot.sendMessage(chatId, 'Выбирай темы и начинай подготовку!', {
        reply_markup: this.mainMenu.getMarkup('main'),
      });
    });
  }

  private setupCallbackHandlers() {
    this.bot.on('callback_query', async (query) => {
      const chatId = query.message?.chat.id;
      if (!chatId || !query.data) return;

      const handlers = this.handlersMap[chatId];
      if (!handlers) return;

      const [prefix, id] = query.data.split('_');
      const handler = handlers[prefix as keyof typeof handlers];
      if (handler) {
        await handler(id, query, this.bot);
      }
    });
  }
}
