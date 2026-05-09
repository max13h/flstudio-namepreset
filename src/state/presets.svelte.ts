import type { Preset } from '../types';
import { serialize } from '../utils/parser';

const STORAGE_KEY = 'flstudio-namepreset';

function isValidPreset(p: unknown): p is Preset {
  return (
    typeof p === 'object' &&
    p !== null &&
    typeof (p as Preset).name === 'string' &&
    typeof (p as Preset).color === 'number' &&
    typeof (p as Preset).icon === 'number' &&
    typeof (p as Preset).isCategory === 'boolean'
  );
}

function loadFromStorage(): Preset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidPreset);
  } catch {
    return [];
  }
}


class PresetsState {
  presets: Preset[] = $state(loadFromStorage());
  // Index of the most recently edited row — drives the "last edited" indicator.
  lastEditedIndex: number | null = $state(null);
  copied: boolean = $state(false);

  draggingIndex: number | null = $state(null);
  dragOverIndex: number | null = $state(null);
  dragOverPosition: 'before' | 'after' | null = $state(null);

  private copyTimer: ReturnType<typeof setTimeout> | null = null;

  load(presets: Preset[]) {
    this.presets = presets;
    this.lastEditedIndex = null;
  }

  async copy() {
    const text = serialize(this.presets);
    try {
      await navigator.clipboard.writeText(text);
      this.copied = true;
      if (this.copyTimer) clearTimeout(this.copyTimer);
      this.copyTimer = setTimeout(() => (this.copied = false), 2000);
    } catch {
      // clipboard write failed silently; Copy output button stays as-is
    }
  }

  addLine() {
    this.presets = [...this.presets, { name: '', color: 0x555555, icon: 0, isCategory: false }];
  }

  updatePreset(index: number, updated: Preset) {
    this.presets = this.presets.map((p, i) => (i === index ? updated : p));
    this.lastEditedIndex = index;
  }

  deletePreset(index: number) {
    this.presets = this.presets.filter((_, i) => i !== index);
    if (this.lastEditedIndex === index) {
      this.lastEditedIndex = null;
    } else if (this.lastEditedIndex !== null && this.lastEditedIndex > index) {
      this.lastEditedIndex -= 1;
    }
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
      const insertAt = from < rawInsert ? rawInsert - 1 : rawInsert;
      const next = [...this.presets];
      const [item] = next.splice(from, 1);
      next.splice(insertAt, 0, item);
      this.presets = next;
      this.lastEditedIndex = insertAt;
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

// Reactively persist to localStorage whenever presets change.
// $effect.root keeps this alive for the entire app lifetime.
$effect.root(() => {
  $effect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presetsState.presets));
  });
});
