export enum ProgressStatus {
  KNOW = 'know',
  DONT_KNOW = 'dont_know',
}
export interface IProgressRepository {
  setQuestionStatus(
    userId: number,
    path: string,
    status: ProgressStatus,
  ): Promise<void>;
  getQuestionStatus(
    userId: number,
    path: string,
  ): Promise<ProgressStatus | null>;
  resetUserProgress(userId: number): Promise<void>;
  getStats(userId: number): Promise<{ know: number; dontKnow: number }>;
}
