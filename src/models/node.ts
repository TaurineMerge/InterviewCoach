export interface FileNode {
  id: string;
  type: 'file';
  question: string;
  shortAnswer: string;
  path: string;
}

export interface FolderNode {
  id: string;
  type: 'folder';
  name: string;
  children: Array<FolderNode | FileNode>;
}

export type TreeNode = FolderNode | FileNode;
