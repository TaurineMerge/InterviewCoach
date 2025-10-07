import { shuffle } from '@shuffle/fisher-yates.js';
import { ProgressService } from '@/services/progress-service.js';
import { QuestionSelector as QS } from '@models/question-selector.js';
import { FileNode } from '@models/node.js';
import { logger } from '@/utils/logger/logger.js';
import { ProgressStatus } from '@/models/progress-repository';

export class QuestionSelector implements QS {
  constructor(private progressService: ProgressService) {}

  async selectQuestions(
    userId: number,
    questions: FileNode[],
  ): Promise<FileNode[]> {
    const repeat: FileNode[] = [];
    const unknown: FileNode[] = [];

    for (const q of questions) {
      logger.debug(`ProgressAwareSelector > Checking progress for ${q.path}`);

      const progress = await this.progressService.getQuestionStatus(
        userId,
        q.path,
      );

      logger.debug(
        `ProgressAwareSelector > Progress for ${q.path}: ${progress}`,
      );

      if (progress === 'dont_know') {
        repeat.push(q);
      } else if (progress === null) {
        unknown.push(q);
      }
    }

    return [...shuffle(repeat), ...shuffle(unknown)];
  }

  markQuestion(
    userId: number,
    path: string,
    status: ProgressStatus,
  ): Promise<void> {
    return this.progressService.markQuestion(userId, path, status);
  }
}
