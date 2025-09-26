import { InlineKeyboardMarkup } from 'node-telegram-bot-api';

export function combineMarkups(
  ...markups: InlineKeyboardMarkup[]
): InlineKeyboardMarkup {
  return {
    inline_keyboard: markups.flatMap((m) => m.inline_keyboard),
  };
}
