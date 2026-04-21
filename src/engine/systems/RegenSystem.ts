/**
 * Handles regen calculation for entities. If AP is fully unspent at the start
 * of the turn, the regen amount is doubled as a bonus for holding back.
 */
export class RegenSystem {

  /**
   * Calculates the regen amount for a given entity. Doubles the amount if the
   * player's AP is at maximum, rewarding an unspent turn.
   */
  calculate(apRemaining: number, apMax: number, amount: number): number {
    const multiplier = apRemaining === apMax ? 1.5 : 1;
    return apRemaining * amount * multiplier;
  }
}
