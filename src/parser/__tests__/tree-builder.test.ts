import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdir, writeFile, rm } from 'fs/promises';
import { join } from 'path';
import { buildTree } from '../tree-builder';
import type { TreeNode, FileNode, FolderNode } from '@models/node';

async function setupTestDir(root: string) {
  await mkdir(root, { recursive: true });

  await writeFile(
    join(root, 'test1.md'),
    '# Короткий ответ\nshort1\n# Длинный ответ\nlong1',
  );
  await writeFile(join(root, 'test2.md'), '# Короткий ответ\nshort2');
  await writeFile(join(root, 'empty.md'), 'Just some text');

  const subdir = join(root, 'subdir');
  await mkdir(subdir, { recursive: true });
  await writeFile(
    join(subdir, 'test3.md'),
    '# Короткий ответ\nshort3\n# Длинный ответ\nlong3',
  );
}

function isFileNode(node: TreeNode): node is FileNode {
  return node.type === 'file';
}

function isFolderNode(node: TreeNode): node is FolderNode {
  return node.type === 'folder';
}

describe('buildTree', () => {
  const testRoot = join(__dirname, 'test-env');

  beforeAll(async () => {
    await setupTestDir(testRoot);
  });

  afterAll(async () => {
    // Cleanup: remove test folder recursively
    await rm(testRoot, { recursive: true, force: true });
  });

  it('builds a tree with files and folders', async () => {
    const tree = await buildTree(testRoot);

    expect(tree.type).toBe('folder');
    expect(tree.children.length).toBeGreaterThan(0);

    const files = tree.children.filter(isFileNode);
    const fileNames = files.map((f) => f.question);

    expect(fileNames).toContain('test1');
    expect(fileNames).toContain('test2');
    expect(fileNames).toContain('empty');
  });

  it('detects short and long answers correctly', async () => {
    const tree = await buildTree(testRoot);
    const files = tree.children.filter(isFileNode);

    const test1 = files.find((f) => f.question === 'test1');
    const test2 = files.find((f) => f.question === 'test2');
    const empty = files.find((f) => f.question === 'empty');

    expect(test1?.shortAnswer).toBe('short1');
    expect(test1?.hasLongAnswer).toBe(true);

    expect(test2?.shortAnswer).toBe('short2');
    expect(test2?.hasLongAnswer).toBe(false);

    expect(empty?.shortAnswer).toBeUndefined();
    expect(empty?.hasLongAnswer).toBe(false);
  });

  it('recursively parses subfolders', async () => {
    const tree = await buildTree(testRoot);
    const subfolder = tree.children.find(isFolderNode);

    expect(subfolder).toBeDefined();
    if (subfolder) {
      expect(subfolder.name).toBe('subdir');

      const test3 = subfolder.children.find(
        (node): node is FileNode =>
          isFileNode(node) && node.question === 'test3',
      );

      expect(test3?.shortAnswer).toBe('short3');
      expect(test3?.hasLongAnswer).toBe(true);
    }
  });

  it('returns empty children for empty directories', async () => {
    const emptyDir = join(testRoot, 'empty-folder');
    await mkdir(emptyDir);

    const tree = await buildTree(emptyDir);
    expect(tree.type).toBe('folder');
    expect(tree.children).toEqual([]);
  });

  it('ignores non-markdown files', async () => {
    await writeFile(join(testRoot, 'not-md.txt'), 'hello');

    const tree = await buildTree(testRoot);
    const files = tree.children.filter(isFileNode);
    const fileNames = files.map((f) => f.question);

    expect(fileNames).not.toContain('not-md');
  });
});
