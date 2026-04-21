import { GameEngineAction, GameEngineEffect } from '@engine';
import { ManagerRegistry } from '@engine/managers';
import { SystemRegistry } from '@engine/systems';
import { BasePhase } from '@engine/phases';

/**
 * Active while a non-commandable entity is selected. Placeholder — no
 * actions are handled yet.
 */
export class EntitySelectPhase extends BasePhase {
  handle(managers: ManagerRegistry, _systems: SystemRegistry, action: GameEngineAction): GameEngineEffect[] {
    switch (action.type) {
      case 'POINTER_RIGHT_DOWN':
      case 'SELECTION_CANCEL': return this.handleCancel(managers);
      case 'POINTER_LEFT_DOWN':
      case 'TURN_END': return this.handleInterrupt(managers, action);
      default: return [];
    }
  }
}
