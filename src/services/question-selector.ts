import { shuffle } from '@shuffle/fisher-yates.js';
import { ProgressService } from '@/services/progress-service.js';
import { QuestionSelector as QS } from '@models/question-selector.js';
import { FileNode } from '@models/node.js';
import { logger } from '@/utils/logger/logger.js';

export class QuestionSelector implements QS {
  constructor(private progressService: ProgressService) {}

  async selectQuestions(
    userId: string,
    questions: FileNode[],
  ): Promise<string[]> {
    const repeat: string[] = [];
    const unknown: string[] = [];

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
        repeat.push(q.path);
      } else if (progress === null) {
        unknown.push(q.path);
      }
    }

    return [...shuffle(repeat), ...shuffle(unknown)];
  }
}
