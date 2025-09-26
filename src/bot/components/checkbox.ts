export class Checkbox {
  constructor(
    public label: string,
    public checked = false,
  ) {}

  toggle() {
    this.checked = !this.checked;
  }

  getText() {
    return `${this.checked ? '✅' : '⬜'} ${this.label}`;
  }
}
