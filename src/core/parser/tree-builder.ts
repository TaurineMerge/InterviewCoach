import { promises as fs } from 'fs';
import { join } from 'path';
import { FileNode, FolderNode, TreeNode } from '@/types/node.js';
import { createIdGenerator } from '@/utils/id-generator/id-generator.js';
import { MarkdownParser } from './md-parser.js';

export class TreeBuilder {
  constructor(private parser: MarkdownParser) {}
  async buildTree(rootPath: string): Promise<FolderNode> {
    // Create a new ID generator for this subtree
    const genId = createIdGenerator();
    // Recursive function that walks through a directory and builds a tree structure
    const walk = async (dir: string): Promise<FolderNode> => {
      // Read directory entries (files and folders)
      const entries = await fs.readdir(dir, { withFileTypes: true });
      const children: TreeNode[] = [];

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
          // Recursively walk subdirectories
          children.push(await walk(fullPath));
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          // If it's a Markdown file, extract the "question" from filename
          const question = entry.name.replace(/\.md$/, '');

          // Parse file to get short answer and long answer existence flag
          const parsedFile = await this.parser.parseShort(fullPath);

          // Build FileNode object
          const fileNode: FileNode = {
            id: genId(),
            type: 'file',
            question,
            path: fullPath,
            shortAnswer: parsedFile?.short,
            hasLongAnswer: parsedFile?.hasLong || false,
          };
          children.push(fileNode);
        }
      }

      // Return FolderNode containing all children
      return {
        id: genId(),
        type: 'folder',
        name: dir.split('/').pop() || dir,
        children,
      };
    };

    // Start recursion from rootPath
    return await walk(rootPath);
  }
}
