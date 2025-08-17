// Simple Strategy pattern for economy delta generation.
// The strategy can be swapped for deterministic/testing or more sophisticated models later.

export class RandomWalkStrategy {
  /**
   * Returns a delta in [-10, 10] with 2 decimals, ignoring previous value for now.
   * @param {number} _previousPercent
   */
  nextDelta(_previousPercent) {
    const delta = Math.random() * 20 - 10; // [-10, 10)
    return parseFloat(delta.toFixed(2));
  }
}


