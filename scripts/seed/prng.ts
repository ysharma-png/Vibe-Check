/**
 * Deterministic Pseudo-Random Number Generator (PRNG)
 * Uses SplitMix32 / Mulberry32 algorithms initialized from SEED env var.
 */

export class SeededPRNG {
  private state: number;

  constructor(seedStr: string = process.env.SEED || "cacheflow-2026") {
    // Hash seed string to 32-bit integer
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      const char = seedStr.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    this.state = hash === 0 ? 0x6d2b79f5 : hash;
  }

  /**
   * Returns a float in [0, 1)
   */
  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Returns random integer between min and max (inclusive)
   */
  randInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Returns a random float between min and max
   */
  randFloat(min: number, max: number, decimals: number = 2): number {
    const val = min + this.next() * (max - min);
    const factor = Math.pow(10, decimals);
    return Math.round(val * factor) / factor;
  }

  /**
   * Returns boolean with specified probability of true
   */
  chance(probability: number): boolean {
    return this.next() < probability;
  }

  /**
   * Picks a random element from an array
   */
  pick<T>(array: readonly T[]): T {
    if (array.length === 0) {
      throw new Error("Cannot pick from empty array");
    }
    const idx = Math.floor(this.next() * array.length);
    return array[idx]!;
  }

  /**
   * Picks N distinct random elements from an array
   */
  sample<T>(array: readonly T[], count: number): T[] {
    const copy = [...array];
    this.shuffle(copy);
    return copy.slice(0, Math.min(count, array.length));
  }

  /**
   * In-place Fisher-Yates shuffle
   */
  shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      const tmp = array[i]!;
      array[i] = array[j]!;
      array[j] = tmp;
    }
    return array;
  }
}

// Global default deterministic instance
export const prng = new SeededPRNG();
