export type Rng = {
  next: () => number;
  int: (n: number) => number;
  range: (min: number, max: number) => number;
  chance: (p: number) => boolean;
  pick: <T>(arr: readonly T[]) => T;
  gauss: (mu?: number, sigma?: number) => number;
  fork: (salt: number) => Rng;
};

export function makeRng(seed: number): Rng {
  let a = seed >>> 0 || 1;
  const api: Rng = {
    next() {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    int(n) {
      return Math.floor(api.next() * n);
    },
    range(min, max) {
      return min + api.next() * (max - min);
    },
    chance(p) {
      return api.next() < p;
    },
    pick(arr) {
      return arr[Math.max(0, Math.min(arr.length - 1, api.int(arr.length)))];
    },
    gauss(mu = 0, sigma = 1) {
      const u = Math.max(api.next(), 1e-9);
      const v = api.next();
      return mu + sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(Math.PI * 2 * v);
    },
    fork(salt) {
      return makeRng((a + Math.imul(salt, 997)) >>> 0);
    },
  };
  return api;
}

export function hashSeed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
