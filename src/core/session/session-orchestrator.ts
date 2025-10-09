import { SessionManager } from './session-manager.js';
import { FileNode } from '@/types/node.js';

export class SessionOrchestrator {
  private sessionId?: string;

  constructor(private readonly sessionManager: SessionManager) {}

  async start(clientId: number, questions: FileNode[]) {
    this.sessionId = await this.sessionManager.startSession(
      clientId,
      questions,
    );
  }

  async next(): Promise<FileNode | null> {
    if (!this.sessionId) return null;
    return this.sessionManager.nextQuestion(this.sessionId);
  }

  async end(): Promise<void> {
    if (!this.sessionId) return;
    await this.sessionManager.endSession(this.sessionId);
  }
}
