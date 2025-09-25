export interface SessionState {
  userId: string;
  questions: string[];
  currentIndex: number;
}

export interface SessionStore {
  get(sessionId: string): Promise<SessionState | null>;
  set(sessionId: string, state: SessionState): Promise<void>;
  delete(sessionId: string): Promise<void>;
}

export interface ProgressRepository {
  markProgress(
    userId: string,
    questionPath: string,
    status: 'know' | 'repeat',
  ): Promise<boolean>;

  getProgress(
    userId: string,
    questionPath: string,
  ): Promise<'know' | 'repeat' | null>;
}
