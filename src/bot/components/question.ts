export class Question {
  constructor(
    public text: string,
    public shortAnswer?: string,
    public longAnswer?: string,
  ) {}

  getMessageWithMarkup(callbackPrefix: string) {
    const messageText = `❓ Вопрос:\n\n${this.text}\n\nВыберите действие:`;

    const markup = {
      inline_keyboard: [
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

    return {
      text: messageText,
      reply_markup: markup,
    };
  }
}
