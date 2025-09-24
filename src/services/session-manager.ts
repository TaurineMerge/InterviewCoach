import { randomUUID } from 'crypto';
import { logger } from '@logger/logger';
import { shuffle } from '@shuffle/fisher-yates';
import { FileNode } from '@models/node';
import {
  SessionStore,
  ProgressRepository,
  SessionState,
} from '@models/session';

export class SessionManager {
  constructor(
    private sessionStore: SessionStore,
    private progressRepo: ProgressRepository,
  ) {}

  async startSession(userId: string, questions: FileNode[]): Promise<string> {
    logger.debug(`SessionManager > Starting new session for user "${userId}"`);

    const sessionId = randomUUID();
    const shuffled = shuffle(questions.map((q) => q.path));

    const state: SessionState = {
      userId,
      questions: shuffled,
      currentIndex: 0,
    };

    await this.sessionStore.set(sessionId, state);

    logger.info(
      `SessionManager > Session started successfully for user "${userId}" with ID: "${sessionId}"`,
    );

    return sessionId;
  }

  async getCurrentQuestion(sessionId: string): Promise<string | null> {
    logger.debug(
      `SessionManager > Getting current question for session "${sessionId}"`,
    );

    const state = await this.sessionStore.get(sessionId);

    if (!state) {
      logger.error(`SessionManager > Session "${sessionId}" not found`);
      return null;
    }

    const currentQuestion = state?.questions[state.currentIndex];

    logger.debug(`SessionManager > Current question: ${currentQuestion}`);

    return currentQuestion ?? null;
  }

  async nextQuestion(sessionId: string): Promise<string | null> {
    logger.debug(
      `SessionManager > Getting next question for session "${sessionId}"`,
    );

    const state = await this.sessionStore.get(sessionId);

    if (!state) {
      logger.error(`SessionManager > Session "${sessionId}" not found`);
      return null;
    }

    state.currentIndex++;
    await this.sessionStore.set(sessionId, state);

    logger.debug(
      `SessionManager > Next question: "${state.questions[state.currentIndex]}" for session "${sessionId}"}`,
    );

    return state.questions[state.currentIndex] ?? null;
  }

  async markProgress(
    userId: string,
    questionPath: string,
    status: 'know' | 'repeat',
  ): Promise<boolean> {
    const isMarked = await this.progressRepo.markProgress(
      userId,
      questionPath,
      status,
    );

    logger.debug(
      `SessionManager > Marked progress for user "${userId}" and question "${questionPath}" as "${status}"`,
    );

    return isMarked;
  }
}
