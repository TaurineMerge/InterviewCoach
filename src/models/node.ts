export interface FileNode {
  id: string;
  type: 'file';
  question: string;
  path: string;
  shortAnswer?: string;
  hasLongAnswer: boolean;
}

export interface FolderNode {
  id: string;
  type: 'folder';
  name: string;
  children: Array<FolderNode | FileNode>;
}

export type TreeNode = FolderNode | FileNode;
