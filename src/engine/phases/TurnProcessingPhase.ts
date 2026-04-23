import { GameEngineAction, GameEngineEffect } from '@engine';
import { PlayerModel } from '@engine/models';
import { ManagerRegistry } from '@engine/managers';
import { SystemRegistry } from '@engine/systems';

/**
 * Active during automated turn cycling. Advances the player sequence, runs
 * bot turns, and emits TURN_COMPLETED when the human turn begins.
 */
export class TurnProcessingPhase {
  /**
   * Routes incoming actions to the appropriate handler. Currently only
   * processes TURN_NEXT_PLAYER, which advances the player sequence.
   * @param managers - The manager registry.
   * @param systems - The system registry.
   * @param action - The action to handle.
   * @returns The resulting effects.
   */
  handle(managers: ManagerRegistry, systems: SystemRegistry, action: GameEngineAction): GameEngineEffect[] {
    switch (action.type) {
      case 'TURN_NEXT_PLAYER': return this.#handleNextPlayer(managers, systems);
      default: return [];
    }
  }

  /**
   * Advances to the next player in the sequence and delegates to the appropriate
   * turn handler. Bot turns chain back via DISPATCH; human turns increment the
   * turn counter and emit TURN_COMPLETED.
   *
   * If there is more than one human then some kind of starting player
   * logic may be needed to track for the incrementTurn, however for now
   * it's kept simple and just updated on the human turn automatically.
   * @param managers - The manager registry.
   * @param systems - The system registry.
   * @returns The resulting effects.
   */
  #handleNextPlayer(managers: ManagerRegistry, systems: SystemRegistry): GameEngineEffect[] {
    managers.session.incrementPlayer();

    const player = managers.session.getCurrentPlayer();

    if (!player) { return []; }

    for (const unit of managers.entity.getUnits(player.id)) {
      unit.resetAp();
      unit.resetAttacks();
    }

    if (player.type === 'BOT') return this.#handleBot(managers, systems, player);

    if (player.type === 'HUMAN') {
      const turn = managers.session.incrementTurn();

      return [
        ...this.#handleHuman(managers, systems, player),
        { type: 'TURN_UPDATED', turn },
        { type: 'TURN_COMPLETED' },
      ];
    }

    return [{ type: 'DISPATCH', action: { type: 'TURN_NEXT_PLAYER' } }];
  }

  /**
   * Processes a bot player's turn via BotSystem, then chains TURN_NEXT_PLAYER.
   * Emits GAME_OVER if no human units remain after the bot acts.
   * @param managers - The manager registry.
   * @param systems - The system registry.
   * @param player - The bot player whose turn is being processed.
   * @returns The resulting effects.
   */
  #handleBot(managers: ManagerRegistry, systems: SystemRegistry, player: PlayerModel): GameEngineEffect[] {
    const effects: GameEngineEffect[] = systems.bot.processTurn(managers, player);

    if (systems.session.isGameOver(managers)) {
      effects.push({ type: 'GAME_OVER' });
    }

    effects.push({ type: 'DISPATCH', action: { type: 'TURN_NEXT_PLAYER' } });

    return effects;
  }

  /**
   * Processes a human player's turn. Transitions to IDLE, runs HumanSystem
   * for status and regen effects, highlights actionable units, and auto-selects.
   * @param managers - The manager registry.
   * @param systems - The system registry.
   * @param player - The human player whose turn is being processed.
   * @returns The resulting effects.
   */
  #handleHuman(managers: ManagerRegistry, systems: SystemRegistry, player: PlayerModel): GameEngineEffect[] {
    // NOTE: May need to put this into a separate dispatch at some point
    //       but for now we're just running a few update/regen commands
    //       that don't need any await so it should all run fast enough.
    managers.session.setPhase('IDLE');

    const actionableTiles = systems.entityCommand.getActionableTiles(managers, player);

    return [
      ...systems.human.processTurn(managers, player),
      { type: 'HIGHLIGHT_TILES', highlight: 'COMMAND_AVAILABLE', tiles: actionableTiles },
      { type: 'DISPATCH', action: { type: 'ENTITY_AUTO_SELECT' } },
    ];
  }
}
