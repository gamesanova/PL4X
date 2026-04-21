import { GameEngineAction, GameEngineEffect } from '@engine';
import { TileData } from '@engine/maps';
import { ManagerRegistry } from '@engine/managers';
import { SystemRegistry } from '@engine/systems';

export class IdlePhase {
  handle(managers: ManagerRegistry, systems: SystemRegistry, action: GameEngineAction): GameEngineEffect[] {
    switch (action.type) {
      case 'ENTITY_AUTO_SELECT':  return this.#handleEntityAutoSelect(managers, systems);
      case 'POINTER_LEFT_DOWN':   return this.#handlePointerLeftDown(managers, systems, action.x, action.y);
      case 'TURN_END':            return this.#handleTurnEnd(managers);
      default: return [];
    }
  }

  /**
   * Auto-selects the first actionable unit for the current player. Called at
   * turn start via DISPATCH from HumanSystem. No-ops if no actionable units exist.
   */
  #handleEntityAutoSelect(managers: ManagerRegistry, systems: SystemRegistry): GameEngineEffect[] {
    if (managers.session.getTurn() <= 1) return [];

    const player = managers.session.getCurrentPlayer();
    if (!player) return [];

    const tile = systems.entityCommand.getActionableTiles(managers, player).values().next().value;
    if (!tile) return [];

    return this.#handlePointerLeftDown(managers, systems, tile.x, tile.y);
  }

  /**
   * Handles a left pointer click on the board. Entity presence is guaranteed
   * by GameBoardView before this action is dispatched. Emits an active entity
   * highlight and entity selected effect, then transitions to ENTITY_COMMAND if
   * the entity belongs to the current player and has an action available,
   * otherwise to ENTITY_SELECT.
   */
  #handlePointerLeftDown(managers: ManagerRegistry, systems: SystemRegistry, x: number, y: number): GameEngineEffect[] {
    const entity = managers.entity.getEntityAt(x, y);
    const tile = managers.map.getTileAt(x, y);

    if (!entity || !tile) return [];

    const player = managers.session.getCurrentPlayer();
    const isOwn = player && entity.playerId === player.id;
    const hasCommand = isOwn && !entity.isIncapacitated && entity.hasApAvailable();

    if (hasCommand) {
      const canAttack = entity.hasAttackApAvailable();
      const attackTargetTiles = canAttack
        ? systems.combat.getAttackTargetTiles(managers, entity)
        : new Set<TileData>();

      managers.session.setActiveEntity(entity);
      managers.session.setPhase('ENTITY_COMMAND');

      const effects: GameEngineEffect[] = [
        { type: 'HIGHLIGHT_TILES', highlight: 'ACTIVE_ENTITY', tiles: new Set([tile]) },
        { type: 'ENTITY_SELECTED', entity },
        { type: 'GHOST_TARGET_ATTACK', attackTiles: attackTargetTiles, aoe: entity.aoe ?? undefined },
        { type: 'HIGHLIGHT_TILES', highlight: 'TARGET_ENTITY', tiles: attackTargetTiles },
      ];

      if (entity.hasMoveApAvailable()) {
        effects.push({ type: 'ENTITY_PATHFINDER_ACTIVATE', entity, distance: entity.apCurrent });
      }

      return effects;
    }

    managers.session.setPhase('ENTITY_SELECT');

    return [
      { type: 'HIGHLIGHT_TILES', highlight: 'ACTIVE_ENTITY', tiles: new Set([tile]) },
      { type: 'ENTITY_SELECTED', entity },
    ];
  }

  /**
   * Advances to the next player's turn. HIGHLIGHT_SPAWN with an empty set is
   * picked up by diffHighlights on the view side to clear any existing spawn
   * highlights.
   */
  #handleTurnEnd(managers: ManagerRegistry): GameEngineEffect[] {
    managers.session.setPhase('TURN_PROCESSING');

    return [
      { type: 'TURN_PROCESSING' },
      { type: 'HIGHLIGHT_TILES', highlight: 'SPAWN', tiles: new Set<TileData>() },
      { type: 'DISPATCH', action: { type: 'TURN_NEXT_PLAYER' } },
    ];
  }
}
