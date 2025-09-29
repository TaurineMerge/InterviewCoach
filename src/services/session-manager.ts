import { randomUUID } from 'crypto';
import { logger } from '@logger/logger.js';
import { SessionStore, SessionState } from '@models/session.js';

export class SessionManager {
  constructor(private sessionStore: SessionStore) {}

  async startSession(userId: number, questions: string[]): Promise<string> {
    logger.debug(`SessionManager > Starting new session for user "${userId}"`);

    const sessionId = randomUUID();

    const state: SessionState = {
      userId,
      questions,
      currentIndex: 0,
    };

    await this.sessionStore.set(sessionId, state);

    logger.info(
      `SessionManager > Session started successfully for user "${userId}" with ID: "${sessionId}"`,
    );

    return sessionId;
  }

  async getCurrentQuestion(sessionId: string): Promise<string | null> {
    const state = await this.sessionStore.get(sessionId);

    if (!state) {
      logger.warn(`SessionManager > Session "${sessionId}" not found`);
      return null;
    }

    if (state.currentIndex >= state.questions.length) {
      logger.info(`SessionManager > Session "${sessionId}" is finished`);
      return null;
    }

    return state.questions[state.currentIndex];
  }

  async nextQuestion(sessionId: string): Promise<string | null> {
    const state = await this.sessionStore.get(sessionId);

    if (!state) {
      logger.warn(`SessionManager > Session "${sessionId}" not found`);
      return null;
    }

    if (state.currentIndex + 1 >= state.questions.length) {
      logger.info(
        `SessionManager > No more questions in session "${sessionId}"`,
      );
      return null;
    }

    state.currentIndex++;
    await this.sessionStore.set(sessionId, state);

    return state.questions[state.currentIndex];
  }

  async hasNext(sessionId: string): Promise<boolean> {
    const state = await this.sessionStore.get(sessionId);

    if (!state) return false;

    return state.currentIndex + 1 < state.questions.length;
  }

  async endSession(sessionId: string): Promise<void> {
    const state = await this.sessionStore.get(sessionId);

    if (!state) return;

    state.currentIndex = state.questions.length;
    await this.sessionStore.set(sessionId, state);

    logger.info(`SessionManager > Session "${sessionId}" marked as finished`);
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.sessionStore.delete(sessionId);
    logger.info(`SessionManager > Session "${sessionId}" deleted`);
  }
}
