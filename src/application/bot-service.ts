import { BotClient } from '@/application/client/bot-client.js';
import { FileNode } from '@/types/node.js';
import { ProgressStatus } from '@/types/progress-repository.js';

export class BotService {
  constructor(private readonly client: BotClient) {}

  async start(): Promise<void> {
    await this.client.initialize();
  }

  async beginSession(): Promise<void> {
    await this.client.startSession();
  }

  async nextQuestion(): Promise<FileNode | null> {
    return this.client.nextQuestion();
  }

  getCurrentQuestion(): FileNode | null {
    return this.client.getCurrentQuestion();
  }

  async markQuestion(path: string, status: ProgressStatus) {
    return this.client.markQuestion(path, status);
  }

  async getLongAnswer(path: string): Promise<string | null> {
    return this.client.getLongAnswer(path);
  }

  getGeneralChecklist() {
    return this.client.getGeneralChecklist();
  }

  getSpecificChecklist() {
    return this.client.getSpecificChecklist();
  }

  setGeneralTopics(topics: string[]) {
    this.client.setGeneralTopics(topics);
  }

  setSpecificTopics(topics: string[]) {
    this.client.setSpecificTopics(topics);
  }

  updateSpecificChecklist() {
    this.client.updateSpecificChecklist();
  }

  async stop(): Promise<void> {
    await this.client.stop();
  }
}
