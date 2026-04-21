/**
 * Returns a random element from an array, or null if empty.
 */
export function sample<T>(array: T[]): T | null {
  if (array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Euclidean distance between two points.
 */
export function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/**
 * Converts a hex color number (e.g. 0xff0000) to a hex string (e.g. '#ff0000').
 */
export function toHex(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`;
}

/**
 * Adds amount to each R, G, B channel of a hex color number. Clamps to 0-255.
 * Pass a negative amount to darken.
 */
export function adjustColor(color: number, amount: number): number {
  const r = Math.min(255, Math.max(0, (color >> 16 & 0xff) + amount));
  const g = Math.min(255, Math.max(0, (color >> 8  & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (color        & 0xff) + amount));
  return (r << 16) | (g << 8) | b;
}

export const lighten = (color: number, amount: number) => adjustColor(color,  amount);
export const darken  = (color: number, amount: number) => adjustColor(color, -amount);

/**
 * Resolves after the given number of milliseconds.
 */
export const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));


export function toColumns(list: unknown[], columns: number): unknown[] {
  const newList = [];

  for (let i = 0; i < list.length; i += columns) {
      newList.push(list.slice(i, i + columns));
  }

  return newList;
}
