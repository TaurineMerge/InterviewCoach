import { FileNode } from '@models/node.js';

export interface QuestionSelector {
  selectQuestions(userId: number, questions: FileNode[]): Promise<FileNode[]>;
}
