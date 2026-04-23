/**
 * Handles regen calculation for entities. If AP is fully unspent at the start
 * of the turn, the regen amount is doubled as a bonus for holding back.
 */
export class RegenSystem {

  /**
   * Calculates the regen amount for a given entity. Applies a 1.5x bonus if
   * all AP was unspent this turn, rewarding a held turn.
   * @param apRemaining - The entity's remaining AP at end of turn.
   * @param apMax - The entity's maximum AP.
   * @param amount - The entity's base regen stat.
   * @returns The calculated regen amount.
   */
  calculate(apRemaining: number, apMax: number, amount: number): number {
    const multiplier = apRemaining === apMax ? 1.5 : 1;
    return apRemaining * amount * multiplier;
  }
}
