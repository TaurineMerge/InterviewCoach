import TelegramBot from 'node-telegram-bot-api';
import { Menu } from '../components/menu.js';

export async function showMainMenu(
  query: TelegramBot.CallbackQuery,
  bot: TelegramBot,
  mainMenu: Menu,
) {
  const chatId = query.message?.chat.id;
  const messageId = query.message?.message_id;
  if (!chatId || !messageId) return;

  await bot.editMessageText('Выбирай темы и начинай подготовку!', {
    chat_id: chatId,
    message_id: messageId,
    reply_markup: mainMenu.getMarkup('main'),
  });
}
