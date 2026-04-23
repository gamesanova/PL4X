import { GameEngineAction, GameEngineEffect } from '@engine';
import { TileData } from '@engine/maps';
import { ManagerRegistry } from '@engine/managers';
import { EntityModel, PlayerModel } from '@engine/models';
import { SystemRegistry } from '@engine/systems';
import { BasePhase } from '@engine/phases';

export class EntityCommandPhase extends BasePhase {
  handle(managers: ManagerRegistry, systems: SystemRegistry, action: GameEngineAction): GameEngineEffect[] {
    switch (action.type) {
      case 'POINTER_LEFT_DOWN': return this.#handlePointerLeftDown(managers, systems, action.x, action.y);
      case 'POINTER_RIGHT_DOWN':
      case 'SELECTION_CANCEL': return this.#handleCancel(managers, systems);
      case 'TURN_END': return this.handleInterrupt(managers, action);
      default: return [];
    }
  }

  /**
   * Resolves a left click as either a move or an attack. If the tile is empty
   * and reachable, delegates to #handleMove. Otherwise checks if the tile is a
   * valid attack target and delegates to #handleAttack.
   * @param managers - The manager registry.
   * @param systems - The system registry.
   * @param x - Tile x coordinate of the click.
   * @param y - Tile y coordinate of the click.
   * @returns The resulting effects.
   */
  #handlePointerLeftDown(managers: ManagerRegistry, systems: SystemRegistry, x: number, y: number): GameEngineEffect[] {
    const attacker = managers.session.getActiveEntity();
    if (!attacker) return [];

    const player = managers.session.getCurrentPlayer();
    if (!player) return [];

    const clickedTile = managers.map.getTileAt(x, y);
    if (!clickedTile) return [];

    const target = managers.entity.getEntityAt(x, y);

    if (!target) {
      if (!attacker.hasMoveApAvailable()) return [];
      const moveCost = systems.movement.getMoveCost(managers, attacker, clickedTile, attacker.apCurrent);
      if (moveCost < 0) return [];
      return [
        ...this.#handleMove(managers, systems, attacker, clickedTile, moveCost),
        ...this.#handlePostMove(managers, systems, player, attacker, clickedTile),
      ];
    }

    if (!attacker.hasAttackApAvailable()) return [];

    const attackTargetTiles = systems.combat.getAttackTargetTiles(managers, attacker);
    if (!attackTargetTiles.has(clickedTile)) return [];

    return [
      ...this.#handleAttack(managers, systems, attacker, target),
      ...this.#handlePostAction(managers, systems, player, attacker),
    ];
  }

  /**
   * Executes the attack via CombatSystem and appends GAME_WIN if no bot units remain.
   * @param managers - The manager registry.
   * @param systems - The system registry.
   * @param attacker - The attacking entity.
   * @param target - The entity being attacked.
   * @returns The resulting effects including GAME_WIN if applicable.
   */
  #handleAttack(managers: ManagerRegistry, systems: SystemRegistry, attacker: EntityModel, target: EntityModel): GameEngineEffect[] {
    const effects = systems.combat.executeAttack(managers, attacker, target);

    if (systems.session.isGameWin(managers)) {
      effects.push({ type: 'GAME_WIN' });
    }

    return effects;
  }

  /**
   * Executes a unit move: mutates position, spends AP, and returns ENTITY_MOVED.
   * @param managers - The manager registry.
   * @param systems - The system registry.
   * @param unit - The entity to move.
   * @param target - The destination tile.
   * @param moveCost - The AP cost to reach the target.
   * @returns The resulting effects.
   */
  #handleMove(managers: ManagerRegistry, systems: SystemRegistry, unit: EntityModel, target: TileData, moveCost: number): GameEngineEffect[] {
    return [systems.movement.executeMove(managers, unit, target, moveCost)];
  }

  /**
   * After a move, updates the active entity highlight to the new tile. If the
   * unit can no longer act, transitions to ENTITY_SELECT. Otherwise emits
   * HIGHLIGHT_ENTITY_COMMAND, GHOST_TARGET_ATTACK if attacks remain, and
   * ENTITY_PATHFINDER_ACTIVATE if movement remains.
   * @param managers - The manager registry.
   * @param systems - The system registry.
   * @param player - The current player.
   * @param unit - The entity that just moved.
   * @param target - The tile the entity moved to.
   * @returns The resulting effects.
   */
  #handlePostMove(managers: ManagerRegistry, systems: SystemRegistry, player: PlayerModel, unit: EntityModel, target: TileData): GameEngineEffect[] {
    return [
      { type: 'HIGHLIGHT_TILES', highlight: 'ACTIVE_ENTITY', tiles: new Set([target]) },
      ...this.#handlePostAction(managers, systems, player, unit),
    ];
  }

  /**
   * Shared post-action handler for both attack and move. Checks remaining AP
   * and available attacks to determine if the entity can still act. If exhausted,
   * auto-selects the next actionable entity or falls back to ENTITY_SELECT if none remain.
   * @param managers - The manager registry.
   * @param systems - The system registry.
   * @param player - The current player.
   * @param attacker - The entity that just acted.
   * @returns The resulting effects.
   */
  #handlePostAction(managers: ManagerRegistry, systems: SystemRegistry, player: PlayerModel, attacker: EntityModel): GameEngineEffect[] {
    const canAttack       = attacker.hasAttackApAvailable();
    const canMove         = attacker.hasMoveApAvailable();
    const actionableTiles = systems.entityCommand.getActionableTiles(managers, player);
    const attackTiles     = canAttack ? systems.combat.getAttackTargetTiles(managers, attacker) : new Set<TileData>();

    const effects: GameEngineEffect[] = [
      { type: 'HIGHLIGHT_TILES', highlight: 'COMMAND_AVAILABLE', tiles: actionableTiles },
      { type: 'HIGHLIGHT_TILES', highlight: 'TARGET_ENTITY',     tiles: attackTiles     },
    ];

    if (!canAttack && !canMove) {
      effects.push(
        { type: 'ENTITY_PATHFINDER_DEACTIVATE' },
        { type: 'GHOST_HOVER' },
      );

      if (actionableTiles.size) {
        managers.session.setPhase('IDLE');
        effects.push({ type: 'DISPATCH', action: { type: 'ENTITY_AUTO_SELECT' } });
      } else {
        managers.session.setPhase('ENTITY_SELECT');
      }

      return effects;
    }

    effects.push({ type: 'GHOST_TARGET_ATTACK', attackTiles, aoe: attacker.aoe ?? undefined });

    if (canMove) {
      effects.push({ type: 'ENTITY_PATHFINDER_ACTIVATE', entity: attacker, distance: attacker.apCurrent });
    }

    return effects;
  }

  /**
   * Cancels the active unit command. Clears the active entity, returns to IDLE,
   * and restores HIGHLIGHT_ENTITY_COMMAND for any units that still have actions
   * available this turn.
   * @param managers - The manager registry.
   * @param systems - The system registry.
   * @returns The resulting effects.
   */
  #handleCancel(managers: ManagerRegistry, systems: SystemRegistry): GameEngineEffect[] {
    const player = managers.session.getCurrentPlayer();
    managers.session.setActiveEntity(null);
    managers.session.setPhase('IDLE');

    const actionableTiles = player
      ? systems.entityCommand.getActionableTiles(managers, player)
      : new Set<TileData>();

    return [
      { type: 'SELECTION_CANCELED' },
      { type: 'HIGHLIGHT_TILES', highlight: 'COMMAND_AVAILABLE', tiles: actionableTiles },
    ];
  }
}
