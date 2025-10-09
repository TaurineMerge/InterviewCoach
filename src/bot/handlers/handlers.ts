import TelegramBot from 'node-telegram-bot-api';
import { combineMarkups } from '../helpers/combineMarkups.js';
import { Menu } from '../components/menu.js';
import { showMainMenu } from './shared.js';
import { BotService } from '@/application/bot-service.js';
import { Question } from '../components/question.js';
import { ProgressStatus } from '@/types/progress-repository.js';

export function createHandlers(
  navMenu: Menu,
  mainMenu: Menu,
  service: BotService,
) {
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

      const generalChecklist = service.getGeneralChecklist();
      if (!generalChecklist) return;

      if (id === 'set-topics') {
        await bot.editMessageReplyMarkup(
          combineMarkups(
            generalChecklist.getMarkup('general'),
            navMenu.getMarkup('nav-general'),
          ),
          { chat_id: chatId, message_id: query.message!.message_id },
        );
      } else if (id === 'start-interview') {
        await service.beginSession();
        const curQuestion = await service.nextQuestion();
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

      const generalChecklist = service.getGeneralChecklist();
      if (!generalChecklist) return;

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
      const chatId = query.message?.chat.id;
      if (!chatId) return;

      const generalChecklist = service.getGeneralChecklist();
      if (!generalChecklist) return;

      if (id === 'next') {
        service.setGeneralTopics(
          generalChecklist.getSelectedItems().map((item) => item.label),
        );

        service.updateSpecificChecklist();

        const specificChecklist = service.getSpecificChecklist();
        if (!specificChecklist) return;

        await bot.editMessageReplyMarkup(
          combineMarkups(
            specificChecklist.getMarkup('specific'),
            navMenu.getMarkup('nav-specific'),
          ),
          { chat_id: chatId, message_id: query.message!.message_id },
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

      const specificChecklist = service.getSpecificChecklist();
      if (!specificChecklist) return;

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
      const chatId = query.message?.chat.id;
      if (!chatId) return;

      const specificChecklist = service.getSpecificChecklist();
      if (!specificChecklist) return;

      if (id === 'cancel') return showMainMenu(query, bot, mainMenu);

      if (id === 'next') {
        service.setSpecificTopics(
          specificChecklist.getSelectedItems().map((item) => item.label),
        );
        return showMainMenu(query, bot, mainMenu);
      }
    },

    question: async (
      id: string,
      query: TelegramBot.CallbackQuery,
      bot: TelegramBot,
    ) => {
      const chatId = query.message?.chat.id;
      const messageId = query.message?.message_id;
      if (!chatId || !messageId) return;

      const handlers: Record<string, () => Promise<void>> = {
        main: async () => showMainMenu(query, bot, mainMenu),
        skip: async () => {
          const curQuestion = await service.nextQuestion();
          if (!curQuestion) return;

          const questionData = new Question(
            curQuestion.question,
          ).getMessageWithMarkup('question');
          await bot.editMessageText(questionData.text, {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: questionData.reply_markup,
          });
        },
        know: async () => {
          const questionNode = await service.getCurrentQuestion();
          if (!questionNode) return;

          await service.markQuestion(questionNode.path, ProgressStatus.KNOW);

          const nextQ = await service.nextQuestion();
          if (!nextQ) return;

          const questionData = new Question(
            nextQ.question,
          ).getMessageWithMarkup('question');
          await bot.editMessageText(questionData.text, {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: questionData.reply_markup,
          });
        },
        'dont-know': async () => {
          const questionNode = await service.getCurrentQuestion();
          if (!questionNode) return;

          await service.markQuestion(
            questionNode.path,
            ProgressStatus.DONT_KNOW,
          );

          const nextQ = await service.nextQuestion();
          if (!nextQ) return;

          const questionData = new Question(
            nextQ.question,
          ).getMessageWithMarkup('question');
          await bot.editMessageText(questionData.text, {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: questionData.reply_markup,
          });
        },
        short: async () => {
          const questionNode = await service.getCurrentQuestion();
          if (!questionNode) return;

          const text = questionNode.shortAnswer ?? 'Ответ не найден';
          const updatedText = getQuestionMessage(
            questionNode.question,
            text,
            'short',
          );
          await bot.editMessageText(updatedText, {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: new Question(
              questionNode.question,
            ).getMessageWithMarkup('question').reply_markup,
            parse_mode: 'MarkdownV2',
          });
        },
        long: async () => {
          const questionNode = await service.getCurrentQuestion();
          if (!questionNode) return;

          const longAnswer =
            (await service.getLongAnswer(questionNode.path)) ??
            'Ответ не найден';
          const updatedText = getQuestionMessage(
            questionNode.question,
            longAnswer,
            'long',
          );
          await bot.editMessageText(updatedText, {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: new Question(
              questionNode.question,
            ).getMessageWithMarkup('question').reply_markup,
            parse_mode: 'MarkdownV2',
          });
        },
      };

      if (handlers[id]) await handlers[id]();
    },
  };
}
