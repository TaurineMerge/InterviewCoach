export type ProgressStatus = 'know' | 'dont_know';

export interface ProgressRepository {
  setQuestionStatus(
    userId: string,
    path: string,
    status: ProgressStatus,
  ): Promise<void>;
  getQuestionStatus(
    userId: string,
    path: string,
  ): Promise<ProgressStatus | null>;
  resetUserProgress(userId: string): Promise<void>;
  getStats(userId: string): Promise<{ know: number; dontKnow: number }>;
}
