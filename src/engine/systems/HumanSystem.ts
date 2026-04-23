import { GameEngineEffect } from '@engine';
import { PlayerModel } from '@engine/models';
import { ManagerRegistry } from '@engine/managers';
import { RegenSystem } from '@engine/systems';

/**
 * Stateless orchestrator for the human player turn. Returns entity state
 * effects only. Orchestration effects such as highlights and auto-select
 * are the responsibility of the calling phase.
 */
export class HumanSystem {
  #regen: RegenSystem;

  constructor(regen: RegenSystem) {
    this.#regen = regen;
  }

  /**
   * Processes the human player turn. Decrements daze counters, removes the dazed
   * status when it clears, and applies health regen to undazed units below max health.
   * @param managers - The manager registry.
   * @param player - The human player whose turn is being processed.
   * @returns All entity state effects produced this turn.
   */
  processTurn(managers: ManagerRegistry, player: PlayerModel): GameEngineEffect[] {
    const effects: GameEngineEffect[] = [];
    const units = managers.entity.getUnits(player.id);

    for (const unit of units) {
      if (unit.isDazed) {
        unit.decrementDaze();

        if (!unit.isDazed) {
          effects.push({ type: 'ENTITY_STATUS_REMOVED', entity: unit, status: 'DAZED' });
        }
      }

      const healthCurrent = unit.healthCurrent || 0;
      const healthMax = unit.healthMax || 0;

      if (!unit.isDazed && healthCurrent < healthMax) {
        const regen = this.#regen.calculate(unit.apCurrent, unit.apMax, unit.regen);

        if (regen > 0) {
          unit.regenHealth(regen);
          effects.push({ type: 'ENTITY_HEALTH_UPDATED', entity: unit, amount: regen, cause: 'REGEN' });
        }
      }
    }

    return effects;
  }
}
