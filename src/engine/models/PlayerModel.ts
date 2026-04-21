import { GameSettingsColorKey } from '@constants';
import { PlayerType } from '@engine';

type PlayerData = {
  id: string;
  type: PlayerType;
  color: GameSettingsColorKey;
  score: number;
}

/**
 * Runtime state for a single player in the session. Holds all mutable
 * player-owned data — resources and score. Constructed by NewGame from
 * settings seed data and accessed exclusively through SessionManager.
 */
export class PlayerModel {
  id: string;
  type: PlayerType;
  color: GameSettingsColorKey;
  score: number;

  constructor(data: PlayerData) {
    this.id = data.id;
    this.type = data.type;
    this.color = data.color;
    this.score = data.score;
  }
}
