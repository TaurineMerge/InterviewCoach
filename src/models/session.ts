export interface SessionState {
  userId: number;
  questions: string[];
  currentIndex: number;
}

export interface SessionStore {
  get(sessionId: string): Promise<SessionState | null>;
  set(sessionId: string, state: SessionState): Promise<void>;
  delete(sessionId: string): Promise<void>;
}
