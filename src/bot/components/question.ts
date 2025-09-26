export class Question {
  constructor(
    public text: string,
    public shortAnswer: string,
    public longAnswer: string,
  ) {}

  getMarkup() {
    return {
      inline_keyboard: [
        [
          { text: 'Знаю ✅', callback_data: 'know' },
          { text: 'Не знаю ❌', callback_data: 'dont_know' },
        ],
        [
          { text: 'Короткий ответ', callback_data: 'short' },
          { text: 'Длинный ответ', callback_data: 'long' },
        ],
      ],
    };
  }
}
