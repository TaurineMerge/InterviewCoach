import { FileNode } from './node.js';

export interface ISessionStore {
  set(sessionId: string, state: ISessionState): Promise<void>;
  get(sessionId: string): Promise<ISessionState | null>;
  delete(sessionId: string): Promise<void>;
}

export interface ISessionState {
  userId: number;
  questions: FileNode[];
  currentIndex: number;
}
