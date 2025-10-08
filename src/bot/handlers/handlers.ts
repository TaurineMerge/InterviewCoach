import TelegramBot from 'node-telegram-bot-api';
import { combineMarkups } from '../helpers/combineMarkups.js';
import { Menu } from '../components/menu.js';
import { showMainMenu } from './shared.js';
import { BotClient, SpecificItem } from '@/services/bot-client.js';
import { Question } from '../components/question.js';

export function createHandlers(
  navMenu: Menu,
  mainMenu: Menu,
  client: BotClient,
) {
  const generalChecklist = client.getGeneralChecklist()!;
  let specificChecklist = client.getSpecificChecklist()!;

  const getQuestionMessage = (
    questionText: string,
    answer?: string,
    answerType?: 'short' | 'long',
  ) => {
    let message = `❓ Вопрос:\n\n${questionText}\n\nВыберите действие:`;

    if (answer && answerType) {
      const answerLabel =
        answerType === 'short' ? 'Короткий ответ' : 'Длинный ответ';
      message = `❓ Вопрос:\n\n${questionText}\n\n────────────────\n*${answerLabel}:*\n${answer}\n\nВыберите действие:`;
    }

    return message;
  };

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
        const curQuestion = await client.getCurrentQuestion();
        if (curQuestion) {
          const questionData = new Question(
            curQuestion.question,
          ).getMessageWithMarkup('question');
          await bot.editMessageText(questionData.text, {
            chat_id: chatId,
            message_id: query.message!.message_id,
            reply_markup: questionData.reply_markup,
          });
        }
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

    question: async (
      id: string,
      query: TelegramBot.CallbackQuery,
      bot: TelegramBot,
    ) => {
      try {
        const chatId = query.message?.chat.id;
        const messageId = query.message?.message_id;

        if (!chatId || !messageId) return;

        const handlers: Record<string, () => Promise<void>> = {
          main: async () => showMainMenu(query, bot, mainMenu),
          skip: async () => {
            const curQuestion = await client.getNextQuestion();
            if (curQuestion) {
              const questionData = new Question(
                curQuestion,
              ).getMessageWithMarkup('question');
              await bot.editMessageText(questionData.text, {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: questionData.reply_markup,
              });
            }
          },
          know: async () => {
            const questionNode = await client.getCurrentQuestion();
            if (!questionNode) return;
            const questionPath = questionNode.path;
            if (questionPath) {
              await client.markQuestion(questionPath, 'know');
              const curQuestion = await client.getNextQuestion();
              if (curQuestion) {
                const questionData = new Question(
                  curQuestion,
                ).getMessageWithMarkup('question');
                await bot.editMessageText(questionData.text, {
                  chat_id: chatId,
                  message_id: messageId,
                  reply_markup: questionData.reply_markup,
                });
              }
            }
          },
          'dont-know': async () => {
            const questionNode = await client.getCurrentQuestion();
            if (!questionNode) return;
            const questionPath = questionNode.path;
            if (questionPath) {
              await client.markQuestion(questionPath, 'dont_know');
              const curQuestion = await client.getNextQuestion();
              if (curQuestion) {
                const questionData = new Question(
                  curQuestion,
                ).getMessageWithMarkup('question');
                await bot.editMessageText(questionData.text, {
                  chat_id: chatId,
                  message_id: messageId,
                  reply_markup: questionData.reply_markup,
                });
              }
            }
          },
          short: async () => {
            const currentQuestion = await client.getCurrentQuestion();
            if (!currentQuestion) return;

            const shortAnswer =
              currentQuestion.shortAnswer || 'Ответ не найден';
            const updatedText = getQuestionMessage(
              currentQuestion.question,
              shortAnswer,
              'short',
            );

            const currentText = query.message?.text || '';
            const isShowingShortAnswer =
              currentText.includes('*Короткий ответ:*');
            if (currentText.includes(shortAnswer) && isShowingShortAnswer) {
              await bot.answerCallbackQuery(query.id, {
                text: 'Изменений нет',
                show_alert: false,
              });
              return;
            }

            await bot.editMessageText(updatedText, {
              chat_id: chatId,
              message_id: messageId,
              reply_markup: new Question(
                currentQuestion.question,
              ).getMessageWithMarkup('question').reply_markup,
              parse_mode: 'MarkdownV2',
            });
          },
          long: async () => {
            const currentQuestion = await client.getCurrentQuestion();
            if (!currentQuestion) return;

            const longAnswer =
              (await client.getLongAnswer(currentQuestion.path)) ||
              'Ответ не найден';
            const updatedText = getQuestionMessage(
              currentQuestion.question,
              longAnswer,
              'long',
            );

            const currentText = query.message?.text || '';
            const isShowingLongAnswer =
              currentText.includes('*Длинный ответ:*');
            if (currentText.includes(longAnswer) && isShowingLongAnswer) {
              await bot.answerCallbackQuery(query.id, {
                text: 'Изменений нет',
                show_alert: false,
              });
              return;
            }

            await bot.editMessageText(updatedText, {
              chat_id: chatId,
              message_id: messageId,
              reply_markup: new Question(
                currentQuestion.question,
              ).getMessageWithMarkup('question').reply_markup,
              parse_mode: 'MarkdownV2',
            });
          },
        };

        if (handlers[id]) {
          await handlers[id]();
        }
      } catch (error) {
        console.error('Error in question handler:', error);
      }
    },
  };
}
