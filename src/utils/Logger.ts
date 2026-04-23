/**
 * Debug logging utility. Reads VITE_LOG from the environment at startup.
 *
 * VITE_LOG is a comma-separated list of levels and/or categories.
 * Levels:     all | warn | error
 * Categories: engine | combat | ai | init | movement | spawn | (any string)
 *
 * A message is shown if its level OR its category appears in VITE_LOG,
 * or if "all" is present.
 *
 * Configure in .env or .env.local (local overrides are gitignored):
 *   VITE_LOG=warn,error
 *   VITE_LOG=warn,engine,combat
 *   VITE_LOG=all
 */

const debug = import.meta.env.VITE_DEBUG as string | undefined;
const debugLevel = new Set<string>((debug || '').split(',').map(t => t.trim().toLowerCase()));

/**
 * Returns true if the given type or category is enabled via VITE_LOG.
 * @param type - The log type or category to check.
 * @returns True if logging is enabled for that type.
 */
function isEnabled(type: string): boolean {
  if (debugLevel.has('all')) {
    return true;
  }

  return debugLevel.has(type.toLowerCase());
}

export const Logger = {
  log(type: string, msg: string) {
    if (!isEnabled(type)) {
      return;
    }

    console.log(`[${type}]`, msg);
},
};
