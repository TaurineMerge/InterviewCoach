import { BotClient } from './bot-client.js';
import { SessionOrchestrator } from '../session/session-orchestrator.js';
import { QuestionFlowService } from '../question/question-flow-service.js';
import { ChecklistService } from '../checklist/checklist-service.js';
import { TreeNode } from '@/types/node.js';
import { IBotClientFactory } from '@/types/bot-client-factory.js';
import { ClientContext } from '../session/session-context.js';

export class BotClientFactory implements IBotClientFactory {
  constructor(
    private readonly sessionOrchestrator: SessionOrchestrator,
    private readonly flowService: QuestionFlowService,
    private readonly checklist: ChecklistService,
    private readonly fsTree: TreeNode,
  ) {}

  createClient(userId: number): BotClient {
    const context = new ClientContext(userId, this.fsTree);

    const client = new BotClient(
      context,
      this.sessionOrchestrator,
      this.checklist,
      this.flowService,
    );

    return client;
  }
}
