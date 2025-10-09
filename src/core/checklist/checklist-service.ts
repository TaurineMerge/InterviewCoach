import { TreeNode } from '@/types/node.js';
import { Checklist } from '@/bot/components/checklist.js';
import { Checkbox } from '@/bot/components/checkbox.js';

export class ChecklistService {
  private general?: Checklist;
  private specific?: Checklist;

  initFromTree(fsTree: TreeNode) {
    if (fsTree.type !== 'folder') throw new Error('Root must be folder');
    const generalTopics = fsTree.children
      .filter((c) => c.type === 'folder')
      .map((f) => new Checkbox(f.name));

    this.general = new Checklist(generalTopics);
  }

  updateSpecific(fsTree: TreeNode) {
    if (!this.general || fsTree.type !== 'folder') return;

    const selectedGeneral = new Set(
      this.general.getSelectedItems().map((item) => item.label),
    );

    const specific: Checkbox[] = [];

    for (const folder of fsTree.children) {
      if (folder.type === 'folder' && selectedGeneral.has(folder.name)) {
        for (const child of folder.children) {
          if (child.type === 'folder') {
            specific.push(new Checkbox(child.name, false, folder.id));
          }
        }
      }
    }

    this.specific = new Checklist(specific);
  }

  getSelected() {
    return {
      general: this.general?.getSelectedItems() ?? [],
      specific: this.specific?.getSelectedItems() ?? [],
    };
  }

  getGeneralChecklist(): Checklist | undefined {
    return this.general;
  }

  getSpecificChecklist(): Checklist | undefined {
    return this.specific;
  }

  setGeneralTopics(topics: string[]) {
    if (!this.general) return;
    this.general.getSelectedItems().forEach((item) => {
      item.checked = topics.includes(item.label);
    });
  }

  setSpecificTopics(topics: string[]) {
    if (!this.specific) return;
    this.specific.getSelectedItems().forEach((item) => {
      item.checked = topics.includes(item.label);
    });
  }
}
