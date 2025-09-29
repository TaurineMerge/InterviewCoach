import { FileNode, TreeNode } from '@/models/node';
import { QuestionSelector } from '@/services/question-selector.js';
import { SessionManager } from './session-manager';

export interface SpecificItem {
  label: string;
  parent: string;
}

export class BotClient {
  private clientId?: number;
  private selectedGeneral: string[] = [];
  private selectedSpecific: SpecificItem[] = [];

  private sessionManager: SessionManager;
  private questionSelector: QuestionSelector;
  private fsTree: TreeNode;

  constructor(
    sessionManager: SessionManager,
    questionSelector: QuestionSelector,
    fsTree: TreeNode,
  ) {
    this.sessionManager = sessionManager;
    this.questionSelector = questionSelector;
    this.fsTree = fsTree;
  }

  getClientId(): number {
    return this.clientId!;
  }

  setClientId(clientId: number): void {
    this.clientId = clientId;
  }

  setGeneralTopics(topics: string[]): void {
    this.selectedGeneral = topics;
  }

  setSpecificTopics(topics: SpecificItem[]): void {
    this.selectedSpecific = topics;
  }

  async startSession(): Promise<string> {
    return this.sessionManager.startSession(
      this.clientId!,
      await this.getFilteredQuestions(),
    );
  }

  private getAllQuestionPaths(): FileNode[] {
    const paths: FileNode[] = [];
    for (const g of this.selectedGeneral) {
      for (const s of this.selectedSpecific) {
        if (s.parent === g) {
          paths.push(this.fsTree[g][s.label]);
        }
      }
    }
    return paths;
  }

  private async getFilteredQuestions(): Promise<string[]> {
    return this.questionSelector.selectQuestions(
      this.clientId!,
      this.getAllQuestionPaths(),
    );
  }
}
