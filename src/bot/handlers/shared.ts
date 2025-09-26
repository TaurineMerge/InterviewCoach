import TelegramBot from 'node-telegram-bot-api';
import { Menu } from '../components/menu.js';

export async function showMainMenu(
  query: TelegramBot.CallbackQuery,
  bot: TelegramBot,
  mainMenu: Menu,
) {
  const chatId = query.message?.chat.id;
  if (!chatId) return;

  await bot.editMessageReplyMarkup(mainMenu.getMarkup('main'), {
    chat_id: chatId,
    message_id: query.message!.message_id,
  });
}
