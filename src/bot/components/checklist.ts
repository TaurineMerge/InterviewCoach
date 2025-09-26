import { InlineKeyboardMarkup } from 'node-telegram-bot-api';
import { Checkbox } from './checkbox.js';

export class Checklist {
  private items: Checkbox[];

  constructor(labels: string[]) {
    this.items = labels.map((label) => new Checkbox(label));
  }

  toggle(index: number) {
    this.items[index]?.toggle();
  }

  getItem(index: number): Checkbox | undefined {
    return this.items[index];
  }

  getMarkup(callbackPrefix: string): InlineKeyboardMarkup {
    return {
      inline_keyboard: this.items.map((item, i) => [
        {
          text: item.getText(),
          callback_data: `${callbackPrefix}_${i}`,
        },
      ]),
    };
  }
}
