import { FileNode } from '@/types/node.js';
import { ISessionStore, ISessionState } from '@/types/session.js';

export class SessionManager {
  constructor(private readonly store: ISessionStore) {}

  async startSession(userId: number, questions: FileNode[]): Promise<string> {
    const sessionId = crypto.randomUUID();
    const state: ISessionState = { userId, questions, currentIndex: 0 };
    await this.store.set(sessionId, state);
    return sessionId;
  }

  async getCurrentQuestion(sessionId: string): Promise<FileNode | null> {
    const state = await this.store.get(sessionId);
    if (!state || state.currentIndex >= state.questions.length) return null;
    return state.questions[state.currentIndex];
  }

  async nextQuestion(sessionId: string): Promise<FileNode | null> {
    const state = await this.store.get(sessionId);
    if (!state || state.currentIndex + 1 >= state.questions.length) return null;

    state.currentIndex++;
    await this.store.set(sessionId, state);
    return state.questions[state.currentIndex];
  }

  async hasNext(sessionId: string): Promise<boolean> {
    const state = await this.store.get(sessionId);
    return !!state && state.currentIndex + 1 < state.questions.length;
  }

  async endSession(sessionId: string): Promise<void> {
    const state = await this.store.get(sessionId);
    if (!state) return;

    state.currentIndex = state.questions.length;
    await this.store.set(sessionId, state);
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.store.delete(sessionId);
  }
}
