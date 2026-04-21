import { GameEngineAction, GameEngineEffect } from '@engine';
import { ManagerRegistry } from '@engine/managers';

export class BasePhase {

  /**
   * Cancels the active selection, returning the session to IDLE phase.
   * Triggered by an explicit cancel action or a right pointer down.
   */
  handleCancel(managers: ManagerRegistry): GameEngineEffect[] {
    managers.session.setPhase('IDLE');

    return [
      { type: 'SELECTION_CANCELED' },
    ];
  }

  /**
   * Cancels the active selection and forwards the interrupting action to IDLE
   * so it can be handled without any intermediate state changes.
   */
  handleInterrupt(managers: ManagerRegistry, action: GameEngineAction): GameEngineEffect[] {
    managers.session.setPhase('IDLE');

    return [
      { type: 'SELECTION_CANCELED' },
      { type: 'DISPATCH', action },
    ];
  }
}
