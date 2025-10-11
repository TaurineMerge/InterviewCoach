import { TreeNode } from '@/types/node.js';

export class ClientContext {
  constructor(
    public readonly clientId: number,
    public fsTree: TreeNode,
  ) {}

  public selectedGeneralTopics: string[] = [];
  public selectedSpecificTopics: string[] = [];
}
