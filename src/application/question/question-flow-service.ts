import { FileNode, FolderNode, TreeNode } from '@/types/node.js';
import { ProgressStatus } from '@/types/progress-repository.js';
import { IProgressService } from '@/types/progress-service.js';
import { IQuestionSelector } from '@/types/question-selector.js';
import { shuffle } from '@/utils/shuffle/fisher-yates.js';

export class QuestionFlowService implements IQuestionSelector {
  constructor(private readonly progressService: IProgressService) {}

  async selectQuestions(
    userId: number,
    questions: FileNode[],
  ): Promise<FileNode[]> {
    const repeat: FileNode[] = [];
    const unknown: FileNode[] = [];

    for (const q of questions) {
      const progress = await this.progressService.getQuestionStatus(
        userId,
        q.path,
      );

      if (progress === 'dont_know') repeat.push(q);
      else if (progress === null) unknown.push(q);
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

  async prepareQuestions(
    userId: number,
    selectedNodes: TreeNode[],
  ): Promise<FileNode[]> {
    const allQuestions: FileNode[] = [];

    for (const node of selectedNodes) {
      if (node.type === 'file') {
        allQuestions.push(node);
      } else if (node.type === 'folder') {
        allQuestions.push(...this.flattenFolder(node));
      }
    }

    return this.selectQuestions(userId, allQuestions);
  }

  private flattenFolder(folder: FolderNode): FileNode[] {
    const files: FileNode[] = [];

    for (const child of folder.children) {
      if (child.type === 'file') {
        files.push(child);
      } else if (child.type === 'folder') {
        files.push(...this.flattenFolder(child));
      }
    }

    return files;
  }

  async getLongAnswer(path: string): Promise<string | null> {
    return null;
  }
}
