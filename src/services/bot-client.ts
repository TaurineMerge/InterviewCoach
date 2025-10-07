import { FileNode, TreeNode } from '@/models/node.js';
import { QuestionSelector } from '@/services/question-selector.js';
import { SessionManager } from '@/services/session-manager.js';
import { Checklist } from '@/bot/components/checklist.js';
import { Checkbox } from '@/bot/components/checkbox.js';
import { ProgressStatus } from '@/models/progress-repository';

export interface SpecificItem {
  label: string;
  parent: string;
}

export class BotClient {
  private clientId?: number;
  private sessionId?: string;

  private selectedGeneral: string[] = [];
  private selectedSpecific: SpecificItem[] = [];

  private sessionManager: SessionManager;
  private questionSelector: QuestionSelector;
  private fsTree: TreeNode;

  private generalChecklist?: Checklist;
  private specificChecklist?: Checklist;

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

  initChecklists() {
    if (this.fsTree.type !== 'folder') {
      throw new Error('fsTree must be a folder node at root');
    }

    const general: string[] = [];
    const specific: Checkbox[] = [];

    for (const folder of this.fsTree.children) {
      if (folder.type === 'folder') {
        general.push(folder.name);

        for (const child of folder.children) {
          if (child.type === 'folder') {
            specific.push(new Checkbox(child.name, false, folder.id));
          }
        }
      }
    }

    this.generalChecklist = new Checklist(general.map((t) => new Checkbox(t)));
    this.specificChecklist = new Checklist(specific);
  }

  getGeneralChecklist(): Checklist | undefined {
    return this.generalChecklist;
  }

  getSpecificChecklist(): Checklist | undefined {
    return this.specificChecklist;
  }

  updateSpecificChecklist() {
    if (!this.generalChecklist || this.fsTree.type !== 'folder') return;

    const selectedGeneral = new Set(
      this.generalChecklist.getSelectedItems().map((item) => item.label),
    );

    const specific: Checkbox[] = [];

    for (const folder of this.fsTree.children) {
      if (folder.type === 'folder' && selectedGeneral.has(folder.name)) {
        for (const child of folder.children) {
          if (child.type === 'folder') {
            specific.push(new Checkbox(child.name, false, folder.id));
          }
        }
      }
    }

    this.specificChecklist = new Checklist(specific);
  }

  async startSession(): Promise<void> {
    if (!this.clientId) throw new Error('BotClient > Client ID must be set');

    this.sessionId = await this.sessionManager.startSession(
      this.clientId,
      await this.getFilteredQuestions(),
    );
  }

  private getAllQuestionPaths(): FileNode[] {
    if (this.fsTree.type !== 'folder') return [];

    const paths: FileNode[] = [];

    for (const g of this.selectedGeneral) {
      const generalFolder = this.fsTree.children.find(
        (f) => f.type === 'folder' && f.name === g,
      );
      if (!generalFolder) continue;

      for (const s of this.selectedSpecific) {
        if (s.parent !== generalFolder.id) continue;
        if (generalFolder.type !== 'folder') continue;
        const specificFolder = generalFolder.children.find(
          (c) => c.type === 'folder' && c.name === s.label,
        );
        if (!specificFolder) continue;
        if (specificFolder.type !== 'folder') continue;
        for (const node of specificFolder.children) {
          if (node.type === 'file') paths.push(node);
        }
      }
    }

    return paths;
  }

  private async getFilteredQuestions(): Promise<FileNode[]> {
    return this.questionSelector.selectQuestions(
      this.clientId!,
      this.getAllQuestionPaths(),
    );
  }

  async stopSession(): Promise<void> {
    if (!this.sessionId) return;
    await this.sessionManager.endSession(this.sessionId);
  }

  getCurrentQuestion(): Promise<string | null> {
    if (!this.sessionId) return Promise.resolve(null);
    return this.sessionManager.getCurrentQuestion(this.sessionId);
  }

  getCurrentQuestionPath(): Promise<string | null> {
    if (!this.sessionId) return Promise.resolve(null);
    return this.sessionManager.getCurrentQuestionPath(this.sessionId);
  }

  getNextQuestion(): Promise<string | null> {
    if (!this.sessionId) return Promise.resolve(null);
    if (!this.sessionManager.hasNext(this.sessionId)) {
      return Promise.resolve(null);
    }
    return this.sessionManager.nextQuestion(this.sessionId);
  }

  markQuestion(questionPath: string, status: ProgressStatus): Promise<void> {
    if (!this.sessionId) return Promise.resolve();
    if (!this.questionSelector) return Promise.resolve();
    if (!this.clientId) return Promise.resolve();
    return this.questionSelector.markQuestion(
      this.clientId,
      questionPath,
      status,
    );
  }
}
