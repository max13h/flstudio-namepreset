export function bgrToHex(bgr: number): string {
  const r = bgr & 0xff;
  const g = (bgr >> 8) & 0xff;
  const b = (bgr >> 16) & 0xff;
  return '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('');
}

export function hexToBgr(hex: string): number {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) & 0xff;
  const g = (n >> 8) & 0xff;
  const b = n & 0xff;
  return r | (g << 8) | (b << 16);
}
