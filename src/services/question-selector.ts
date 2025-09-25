import { shuffle } from '@shuffle/fisher-yates';
import { ProgressRepository } from '@models/session';
import { QuestionSelector as QS } from '@models/question-selector';
import { FileNode } from '@models/node';
import { logger } from '@/utils/logger/logger';

export class QuestionSelector implements QS {
  constructor(private progressRepo: ProgressRepository) {}

  async selectQuestions(
    userId: string,
    questions: FileNode[],
  ): Promise<string[]> {
    const repeat: string[] = [];
    const unknown: string[] = [];

    for (const q of questions) {
      logger.debug(`ProgressAwareSelector > Checking progress for ${q.path}`);

      const progress = await this.progressRepo.getProgress(userId, q.path);

      logger.debug(
        `ProgressAwareSelector > Progress for ${q.path}: ${progress}`,
      );

      if (progress === 'repeat') {
        repeat.push(q.path);
      } else if (progress === null) {
        unknown.push(q.path);
      }
    }

    return [...shuffle(repeat), ...shuffle(unknown)];
  }
}
