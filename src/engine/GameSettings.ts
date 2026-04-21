import { SETTINGS } from '@constants';
import type { GameSettingsColorKey, GameSettingsDifficultyKey } from '@constants';

// TODO: Deal with types here (i like the single source of types rather than in a million files).

export type PlayerType = 'HUMAN' | 'BOT';

export type PlayerConfig = {
  id: string;
  type: PlayerType;
}

export type GameSettings = {
  width: number;
  height: number;
  color: GameSettingsColorKey;
  difficulty: GameSettingsDifficultyKey;
  players: PlayerConfig[];
}

export function createSettings(data: Partial<GameSettings> = {}): GameSettings {
  return {
    width: data.width ?? SETTINGS.BOARD.WIDTH,
    height: data.height ?? SETTINGS.BOARD.HEIGHT,
    color: data.color ?? SETTINGS.COLOR.DEFAULT,
    difficulty: data.difficulty ?? SETTINGS.DIFFICULTY.DEFAULT,
    players: data.players ?? [
      { id: 'player_0', type: 'HUMAN' },
      { id: 'player_1', type: 'BOT'   },
      { id: 'player_2', type: 'BOT'   },
      { id: 'player_3', type: 'BOT'   },
    ],
  };
}
