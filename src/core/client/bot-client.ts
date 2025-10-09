import { ChecklistService } from '../checklist/checklist-service.js';
import { SessionOrchestrator } from '../session/session-orchestrator.js';
import { QuestionFlowService } from '../question/question-flow-service.js';
import { ClientContext } from '../session/session-context.js';
import { ProgressStatus } from '@/types/progress-repository.js';
import { FileNode, TreeNode } from '@/types/node.js';

export class BotClient {
  private currentQuestion: FileNode | null = null;
  private isSessionActive: boolean = false;

  constructor(
    private readonly context: ClientContext,
    private readonly session: SessionOrchestrator,
    private readonly checklist: ChecklistService,
    private readonly flow: QuestionFlowService,
  ) {}

  async initialize() {
    this.checklist.initFromTree(this.context.fsTree);
  }

  async startSession() {
    if (this.isSessionActive) return;

    const selected = this.checklist.getSelected();
    const selectedNodes: TreeNode[] = [];

    const rootTree = this.context.fsTree;
    if (rootTree.type !== 'folder') return;

    for (const g of selected.general) {
      const folder = rootTree.children.find(
        (f) => f.type === 'folder' && f.name === g.label,
      );
      if (folder) selectedNodes.push(folder);
    }

    for (const s of selected.specific) {
      const parentFolder = rootTree.children.find(
        (f) => f.type === 'folder' && f.id === s.parent,
      );
      if (!parentFolder || parentFolder.type !== 'folder') continue;
      const specificFolder = parentFolder.children.find(
        (f) => f.type === 'folder' && f.name === s.label,
      );
      if (specificFolder) selectedNodes.push(specificFolder);
    }

    const questions = await this.flow.prepareQuestions(
      this.context.clientId,
      selectedNodes,
    );
    await this.session.start(this.context.clientId, questions);
    this.currentQuestion = questions[0] ?? null;
  }

  async nextQuestion(): Promise<FileNode | null> {
    const next = await this.session.next();
    this.currentQuestion = next ?? null;
    return next;
  }

  getCurrentQuestion(): FileNode | null {
    return this.currentQuestion;
  }

  async markQuestion(path: string, status: ProgressStatus) {
    return this.flow.markQuestion(this.context.clientId, path, status);
  }

  async getLongAnswer(path: string): Promise<string | null> {
    return this.flow.getLongAnswer(path);
  }

  getGeneralChecklist() {
    return this.checklist.getGeneralChecklist();
  }

  getSpecificChecklist() {
    return this.checklist.getSpecificChecklist();
  }

  setGeneralTopics(topics: string[]) {
    this.checklist.setGeneralTopics(topics);
  }

  setSpecificTopics(topics: string[]) {
    this.checklist.setSpecificTopics(topics);
  }

  updateSpecificChecklist() {
    this.checklist.updateSpecific(this.context.fsTree);
  }

  async stop() {
    await this.session.end();
    this.isSessionActive = false;
  }
}
