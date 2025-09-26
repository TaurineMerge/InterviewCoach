import { FileNode } from '@models/node.js';

export interface QuestionSelector {
  selectQuestions(userId: string, questions: FileNode[]): Promise<string[]>;
}
