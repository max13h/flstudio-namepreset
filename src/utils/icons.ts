export function iconToChar(n: number): string {
  return String.fromCharCode(0xF400 + n);
}

export const CATEGORIES: { label: string; icons: number[] }[] = [
  { label: 'Content',     icons: [70, 71, 72, 73, 74, 75, 116] },
  { label: 'Instruments', icons: [1, 2, 3, 90, 8, 120, 4, 5, 7, 128, 129, 111, 123, 6, 80, 79, 78, 121, 89, 81, 12, 9, 10, 91, 112, 11] },
  { label: 'Solfège',     icons: [13, 14, 15, 109, 19, 20, 21, 22, 23, 83, 84, 85, 86, 87, 127] },
  { label: 'Synth',       icons: [16, 17, 18, 122, 115, 114, 117, 119, 25, 24, 88] },
  { label: 'Effect',      icons: [26, 82, 28, 29, 30, 31, 32, 124, 36, 35] },
  { label: 'Gear',        icons: [27, 96, 95, 103, 102, 105, 107, 92, 110, 93, 106, 113, 94, 99, 125, 126, 45] },
  { label: 'Misc',        icons: [104, 100, 41, 42, 43, 44, 108, 97, 98, 101, 38, 76, 77] },
  { label: 'Info',        icons: [37, 59, 60, 61, 62, 63, 64, 65, 66, 67] },
  { label: 'Routing',     icons: [39, 40, 68, 69, 118, 33, 34, 46, 47, 48, 49, 50, 51, 52] },
  { label: 'Channel',     icons: [55, 56, 57, 58, 53, 54] },
];
