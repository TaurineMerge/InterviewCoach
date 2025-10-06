import TelegramBot from 'node-telegram-bot-api';
import { combineMarkups } from '../helpers/combineMarkups.js';
import { Menu } from '../components/menu.js';
import { showMainMenu } from './shared.js';
import { BotClient, SpecificItem } from '@/services/bot-client.js';

export function createHandlers(
  navMenu: Menu,
  mainMenu: Menu,
  client: BotClient,
) {
  const generalChecklist = client.getGeneralChecklist()!;
  let specificChecklist = client.getSpecificChecklist()!;
  return {
    main: async (
      id: string,
      query: TelegramBot.CallbackQuery,
      bot: TelegramBot,
    ) => {
      const chatId = query.message?.chat.id;
      if (!chatId) return;

      if (id === 'set-topics') {
        await bot.editMessageReplyMarkup(
          combineMarkups(
            generalChecklist.getMarkup('general'),
            navMenu.getMarkup('nav-general'),
          ),
          { chat_id: chatId, message_id: query.message!.message_id },
        );
      } else if (id === 'start-interview') {
        await client.startSession();
      }
    },

    general: async (
      id: string,
      query: TelegramBot.CallbackQuery,
      bot: TelegramBot,
    ) => {
      const chatId = query.message?.chat.id;
      if (!chatId) return;

      const index = parseInt(id, 10);
      if (!isNaN(index)) {
        generalChecklist.toggle(index);
        await bot.editMessageReplyMarkup(
          combineMarkups(
            generalChecklist.getMarkup('general'),
            navMenu.getMarkup('nav-general'),
          ),
          { chat_id: chatId, message_id: query.message!.message_id },
        );
      }
    },

    'nav-general': async (
      id: string,
      query: TelegramBot.CallbackQuery,
      bot: TelegramBot,
    ) => {
      if (id === 'next') {
        client.setGeneralTopics(
          generalChecklist.getSelectedItems().map((item) => item.label),
        );
        client.updateSpecificChecklist();
        specificChecklist = client.getSpecificChecklist()!;
        await bot.editMessageReplyMarkup(
          combineMarkups(
            specificChecklist.getMarkup('specific'),
            navMenu.getMarkup('nav-specific'),
          ),
          {
            chat_id: query.message!.chat.id,
            message_id: query.message!.message_id,
          },
        );
      } else if (id === 'cancel') {
        return showMainMenu(query, bot, mainMenu);
      }
    },

    specific: async (
      id: string,
      query: TelegramBot.CallbackQuery,
      bot: TelegramBot,
    ) => {
      const chatId = query.message?.chat.id;
      if (!chatId) return;

      const index = parseInt(id, 10);
      if (!isNaN(index)) {
        specificChecklist.toggle(index);
        await bot.editMessageReplyMarkup(
          combineMarkups(
            specificChecklist.getMarkup('specific'),
            navMenu.getMarkup('nav-specific'),
          ),
          { chat_id: chatId, message_id: query.message!.message_id },
        );
      }
    },

    'nav-specific': async (
      id: string,
      query: TelegramBot.CallbackQuery,
      bot: TelegramBot,
    ) => {
      if (id === 'cancel') {
        return showMainMenu(query, bot, mainMenu);
      } else if (id === 'next') {
        client.setSpecificTopics(
          specificChecklist.getSelectedItems() as SpecificItem[],
        );
        return showMainMenu(query, bot, mainMenu);
      }
    },
  };
}
