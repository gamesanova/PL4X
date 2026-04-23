/**
 * Returns a random element from an array, or null if empty.
 * @param array - The array to sample from.
 * @returns A random element, or null if the array is empty.
 */
export function sample<T>(array: T[]): T | null {
  if (array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Euclidean distance between two points.
 * @param a - First point.
 * @param a.x - X coordinate of the first point.
 * @param a.y - Y coordinate of the first point.
 * @param b - Second point.
 * @param b.x - X coordinate of the second point.
 * @param b.y - Y coordinate of the second point.
 * @returns The Euclidean distance between the two points.
 */
export function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/**
 * Converts a hex color number (e.g. 0xff0000) to a hex string (e.g. '#ff0000').
 * @param color - The hex color number to convert.
 * @returns The CSS hex color string.
 */
export function toHex(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`;
}

/**
 * Adds amount to each R, G, B channel of a hex color number. Clamps to 0-255.
 * Pass a negative amount to darken.
 * @param color - The hex color number to adjust.
 * @param amount - The amount to add to each channel. Negative values darken.
 * @returns The adjusted hex color number.
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
 * @param ms - Duration to wait in milliseconds.
 * @returns A promise that resolves after the delay.
 */
export const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));


/**
 * Splits a flat array into nested arrays of the given column count for rexUI grid layout.
 * @param list - The flat array to chunk.
 * @param columns - Number of items per column chunk.
 * @returns The array split into nested column arrays.
 */
export function toColumns(list: unknown[], columns: number): unknown[] {
  const newList = [];

  for (let i = 0; i < list.length; i += columns) {
      newList.push(list.slice(i, i + columns));
  }

  return newList;
}
