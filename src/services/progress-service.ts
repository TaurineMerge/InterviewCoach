import {
  ProgressRepository,
  ProgressStatus,
} from '@models/progress-repository.js';

export class ProgressService {
  constructor(private repo: ProgressRepository) {}

  async markQuestion(
    userId: string,
    path: string,
    status: ProgressStatus,
  ): Promise<void> {
    await this.repo.setQuestionStatus(userId, path, status);
  }

  async getQuestionStatus(
    userId: string,
    path: string,
  ): Promise<ProgressStatus | null> {
    return this.repo.getQuestionStatus(userId, path);
  }

  async resetProgress(userId: string): Promise<void> {
    await this.repo.resetUserProgress(userId);
  }

  async getStats(userId: string): Promise<{ know: number; dontKnow: number }> {
    return this.repo.getStats(userId);
  }
}
