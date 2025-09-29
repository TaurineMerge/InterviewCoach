import {
  ProgressRepository,
  ProgressStatus,
} from '@models/progress-repository.js';

export class ProgressService {
  constructor(private repo: ProgressRepository) {}

  async markQuestion(
    userId: number,
    path: string,
    status: ProgressStatus,
  ): Promise<void> {
    await this.repo.setQuestionStatus(userId, path, status);
  }

  async getQuestionStatus(
    userId: number,
    path: string,
  ): Promise<ProgressStatus | null> {
    return this.repo.getQuestionStatus(userId, path);
  }

  async resetProgress(userId: number): Promise<void> {
    await this.repo.resetUserProgress(userId);
  }

  async getStats(userId: number): Promise<{ know: number; dontKnow: number }> {
    return this.repo.getStats(userId);
  }
}
