import { FileNode } from './node.js';
import { ProgressStatus } from './progress-repository.js';

export interface IQuestionSelector {
  selectQuestions(userId: number, questions: FileNode[]): Promise<FileNode[]>;
  markQuestion(
    userId: number,
    path: string,
    status: ProgressStatus,
  ): Promise<void>;
}
