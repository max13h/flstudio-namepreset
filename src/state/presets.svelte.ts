import type { Preset } from '../types';
import { parse, serialize, isValidPresetText } from '../utils/parser';

class PresetsState {
  presets: Preset[] = $state([]);
  error: string = $state('');
  copied: boolean = $state(false);

  draggingIndex: number | null = $state(null);
  dragOverIndex: number | null = $state(null);
  dragOverPosition: 'before' | 'after' | null = $state(null);

  private copyTimer: ReturnType<typeof setTimeout> | null = null;

  async paste() {
    this.error = '';
    let text: string;
    try {
      text = await navigator.clipboard.readText();
    } catch {
      this.error = 'Could not read clipboard. Make sure the page has clipboard permission.';
      return;
    }
    if (!isValidPresetText(text)) {
      this.error = 'Clipboard content does not look like a valid NamePreset file.';
      return;
    }
    this.presets = parse(text);
  }

  async copy() {
    const text = serialize(this.presets);
    try {
      await navigator.clipboard.writeText(text);
      this.copied = true;
      if (this.copyTimer) clearTimeout(this.copyTimer);
      this.copyTimer = setTimeout(() => (this.copied = false), 2000);
    } catch {
      this.error = 'Could not write to clipboard.';
    }
  }

  addLine() {
    this.presets = [...this.presets, { name: '', color: 0x555555, icon: 0, isCategory: false }];
  }

  updatePreset(index: number, updated: Preset) {
    this.presets = this.presets.map((p, i) => (i === index ? updated : p));
  }

  deletePreset(index: number) {
    this.presets = this.presets.filter((_, i) => i !== index);
  }

  dragStart(i: number, e: DragEvent) {
    this.draggingIndex = i;
    e.dataTransfer!.effectAllowed = 'move';
    e.dataTransfer!.setData('text/plain', String(i));
    const row = (e.currentTarget as HTMLElement).querySelector<HTMLElement>('[data-testid="preset-row"]');
    if (row) {
      const rect = row.getBoundingClientRect();
      e.dataTransfer!.setDragImage(row, e.clientX - rect.left, e.clientY - rect.top);
    }
  }

  dragOver(i: number, e: DragEvent) {
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'move';
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    this.dragOverPosition = e.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
    this.dragOverIndex = i;
  }

  drop(i: number, e: DragEvent) {
    e.preventDefault();
    const from = parseInt(e.dataTransfer!.getData('text/plain'), 10);
    if (!isNaN(from)) {
      const rawInsert = this.dragOverPosition === 'before' ? i : i + 1;
      const next = [...this.presets];
      const [item] = next.splice(from, 1);
      next.splice(from < rawInsert ? rawInsert - 1 : rawInsert, 0, item);
      this.presets = next;
    }
    this.draggingIndex = null;
    this.dragOverIndex = null;
    this.dragOverPosition = null;
  }

  dragEnd() {
    this.draggingIndex = null;
    this.dragOverIndex = null;
    this.dragOverPosition = null;
  }
}

export const presetsState = new PresetsState();
