import type { Preset } from '../types';

const NORMAL_LINE = /^([^,]+),\$([0-9A-Fa-f]+),(\d+)$/;
const CATEGORY_LINE = /^([^,]+),,$/;

export function parseLine(line: string): Preset | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const normalMatch = trimmed.match(NORMAL_LINE);
  if (normalMatch) {
    return {
      name: normalMatch[1],
      color: parseInt(normalMatch[2], 16),
      icon: Math.min(255, parseInt(normalMatch[3], 10)),
      isCategory: false,
    };
  }

  const catMatch = trimmed.match(CATEGORY_LINE);
  if (catMatch) {
    return { name: catMatch[1], color: 0, icon: 0, isCategory: true };
  }

  return null;
}

export function parse(text: string): Preset[] {
  return text
    .split(/\r?\n/)
    .map(parseLine)
    .filter((p): p is Preset => p !== null);
}

export function isValidPresetText(text: string): boolean {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return false;
  return lines.some((l) => parseLine(l) !== null);
}

export function serialize(presets: Preset[]): string {
  return presets
    .map((p) => {
      if (p.isCategory) return `${p.name},,`;
      const bgrHex = (p.color & 0xffffff).toString(16).toUpperCase().padStart(6, '0');
      return `${p.name},$${bgrHex},${p.icon}`;
    })
    .join('\n');
}
