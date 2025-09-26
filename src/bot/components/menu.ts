import { InlineKeyboardMarkup } from 'node-telegram-bot-api';
import { Button } from './button';

export class Menu {
  private menuItems: Button[];
  constructor(items: Button[]) {
    this.menuItems = items;
  }

  getMarkup(callbackPrefix: string): InlineKeyboardMarkup {
    return {
      inline_keyboard: this.menuItems.map((item) => [
        {
          text: item.text,
          callback_data: `${callbackPrefix}_${item.callback}`,
        },
      ]),
    };
  }
}
