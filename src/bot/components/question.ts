export class Question {
  constructor(
    public text: string,
    public shortAnswer?: string,
    public longAnswer?: string,
  ) {}

  getMarkup(callbackPrefix: string) {
    return {
      inline_keyboard: [
        [{ text: this.text, callback_data: `${callbackPrefix}_text` }],
        [
          { text: 'Знаю ✅', callback_data: `${callbackPrefix}_know` },
          { text: 'Не знаю ❌', callback_data: `${callbackPrefix}_dont-know` },
        ],
        [
          { text: 'Короткий ответ', callback_data: `${callbackPrefix}_short` },
          { text: 'Длинный ответ', callback_data: `${callbackPrefix}_long` },
        ],
        [{ text: 'Пропустить', callback_data: `${callbackPrefix}_skip` }],
        [{ text: 'В главное меню', callback_data: `${callbackPrefix}_main` }],
      ],
    };
  }
}
