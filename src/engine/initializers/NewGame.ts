import { GameSettingsColorKey, SETTINGS } from '@constants';
import { GameSettings } from '@engine';
import { TileData } from '@engine/maps';
import { PlayerModel } from '@engine/models';
import { ManagerRegistry } from '@engine/managers';
import { sample } from '@utils';

type Side = 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT';

/**
 * Bootstraps a fresh game from settings. Generates the map, places the home
 * building, and spawns the hero.
 */
export class NewGame {

  /**
   * Bootstraps a fresh game from settings. Generates the tile map, assigns each
   * player a random board side, and spawns two starter units per player centered
   * along that side.
   * @param settings - The game settings for this session.
   * @param managers - The manager registry to initialize state into.
   */
  static run(settings: GameSettings, managers: ManagerRegistry) {
    const colors = (Object.keys(SETTINGS.COLOR.OPTIONS) as GameSettingsColorKey[]).filter(c => c !== settings.color);

    const players = settings.players.map(p => {
      let color: GameSettingsColorKey;

      if (p.type === 'HUMAN') {
        color = settings.color;
      } else {
        color = sample(colors)!;
        colors.splice(colors.indexOf(color), 1);
      }

      return new PlayerModel({
        id: p.id,
        type: p.type,
        color,
        score: 0,
      });
    });

    managers.session.init(settings, players);
    managers.map.generate(settings);
    managers.map.initCaches();

    const edges = managers.map.edgeTiles;
    const sides: Side[] = ['TOP', 'BOTTOM', 'LEFT', 'RIGHT'];

    for (const player of players) {
      const side = sample(sides)!;
      sides.splice(sides.indexOf(side), 1);

      const tiles = NewGame.#randomSideTiles(edges, side, settings.width, settings.height, 2);

      for (const tile of tiles) {
        managers.entity.addUnit({ playerId: player.id, tileX: tile.x, tileY: tile.y, variant: 'ARCHER' });
      }
    }
  }

  /**
   * Returns `count` distinct random tiles from the given board side, drawn
   * from the cached edge tiles (which excludes corner cells).
   * @param edges - The full set of edge tiles for the board.
   * @param side - Which board side to draw tiles from.
   * @param width - Board width in tiles.
   * @param height - Board height in tiles.
   * @param count - Number of tiles to return.
   * @returns An array of randomly selected tiles from the specified side.
   */
  static #randomSideTiles(edges: Set<TileData>, side: Side, width: number, height: number, count: number): TileData[] {
    const filter = (t: TileData) => {
      switch (side) {
        case 'TOP':    return t.y === 0;
        case 'BOTTOM': return t.y === height - 1;
        case 'LEFT':   return t.x === 0;
        case 'RIGHT':  return t.x === width - 1;
      }
    };

    const sortBy = side === 'TOP' || side === 'BOTTOM' ? 'x' : 'y';
    const pool = [...edges].filter(filter).sort((a, b) => a[sortBy] - b[sortBy]).slice(2, -2);
    const results: TileData[] = [];

    for (let i = 0; i < count && pool.length > 0; i++) {
      const tile = sample(pool)!;
      pool.splice(pool.indexOf(tile), 1);
      results.push(tile);
    }

    return results;
  }
}
