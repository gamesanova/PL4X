import { BALANCE, I18N } from '@constants';
import { UI } from './Ui';

/**
 * SETTINGS
 *
 * Configuration options for a game session. Covers things like difficulty,
 * board size, and other player selections. These are the knobs a player
 * turns before a game begins, and the values the engine reads to initialize itself.
 */
export const SETTINGS = Object.freeze({
  BOARD: {
    WIDTH: 19,
    HEIGHT: 19,
  },
  COLOR: {
    OPTIONS: {
      RED:    { color: UI.PALETTE.RED_90    },
      GREEN:  { color: UI.PALETTE.GREEN_90  },
      BLUE:   { color: UI.PALETTE.BLUE_90   },
      YELLOW: { color: UI.PALETTE.YELLOW_90 },
      WHITE:  { color: UI.PALETTE.WHITE     },
    },
    DEFAULT: 'RED' as const,
  },
  DIFFICULTY: {
    OPTIONS: {
      EASY:   { lbl: I18N.EN.LBL.easy   },
      NORMAL: { lbl: I18N.EN.LBL.normal },
      HARD:   { lbl: I18N.EN.LBL.hard   },
    },
    DEFAULT: 'NORMAL' as const,
  },
});

export type GameSettingsColorKey = keyof typeof SETTINGS.COLOR.OPTIONS;
export type GameSettingsDifficultyKey = keyof typeof SETTINGS.DIFFICULTY.OPTIONS;
