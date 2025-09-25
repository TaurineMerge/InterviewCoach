import { FileNode } from '@models/node';

export interface QuestionSelector {
  selectQuestions(userId: string, questions: FileNode[]): Promise<string[]>;
}
