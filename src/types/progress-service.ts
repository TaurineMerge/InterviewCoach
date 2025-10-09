import { ProgressStatus } from './progress-repository.js';

export interface IProgressService {
  getQuestionStatus(
    userId: number,
    path: string,
  ): Promise<ProgressStatus | null>;
  markQuestion(
    userId: number,
    path: string,
    status: ProgressStatus,
  ): Promise<void>;
}
