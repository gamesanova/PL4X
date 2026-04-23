import { GameEngineAction, GameEngineEffect } from '@engine';
import { ManagerRegistry } from '@engine/managers';

/**
 * Shared base for phases that support cancel and interrupt. Provides
 * handleCancel and handleInterrupt as common implementations.
 */
export class BasePhase {

  /**
   * Cancels the active selection and returns the session to IDLE phase.
   * Triggered by an explicit cancel action or right pointer down.
   * @param managers - The manager registry for session state access.
   * @returns A SELECTION_CANCELED effect.
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
   * @param managers - The manager registry for session state access.
   * @param action - The interrupting action to forward to IDLE.
   * @returns A SELECTION_CANCELED effect followed by a DISPATCH to IDLE.
   */
  handleInterrupt(managers: ManagerRegistry, action: GameEngineAction): GameEngineEffect[] {
    managers.session.setPhase('IDLE');

    return [
      { type: 'SELECTION_CANCELED' },
      { type: 'DISPATCH', action },
    ];
  }
}
