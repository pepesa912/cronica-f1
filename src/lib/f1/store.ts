import { buildNext } from "./evolve";
import { materialize } from "./grid";
import { makeRng, hashSeed } from "./rng";
import { simulateSeason } from "./simulate";
import type { Campaign, Options, SeasonDraft, SimulatedSeason } from "./types";
import { create } from "zustand";

const KEY = "cronica-f1-v1";

export const DEFAULT_OPTIONS: Options = {
  regs: "historico",
  teams: "historico",
  drivers: "historico",
  circuits: "real",
  signings: "historico",
  retirements: "historico",
};

type Store = {
  ready: boolean;
  campaign: Campaign | null;
  hydrate: () => void;
  start: (year: number, options: Options, seedText: string) => void;
  setOptions: (options: Options) => void;
  simulatePending: () => void;
  advance: () => void;
  runUntil: (year: number) => void;
  reroll: (year: number) => void;
  abandon: () => void;
};

function save(campaign: Campaign | null) {
  try {
    if (!campaign) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, JSON.stringify(campaign));
  } catch {
    /* la crónica sigue en memoria si el archivo no entra */
  }
}

function opening(year: number, options: Options, seed: number): Campaign {
  const pending = materialize(year);
  pending.changelog = [
    "Año de partida con equipos, pilotos, circuitos y reglamento reales. Los resultados son de esta crónica, no el archivo.",
  ];
  return {
    seed,
    startYear: year,
    options,
    nonce: 1,
    pool: pending.drivers.map((driver) => ({ ...driver })),
    retired: [],
    seasons: [],
    pending,
  };
}

function sim(campaign: Campaign, draft: SeasonDraft): SimulatedSeason {
  return simulateSeason(draft, (campaign.seed + draft.year * 10007 + campaign.nonce * 17) >>> 0);
}

export const useCronica = create<Store>((set, get) => ({
  ready: false,
  campaign: null,
  hydrate: () => {
    if (get().ready) return;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const campaign = JSON.parse(raw) as Campaign;
        if (campaign?.pending || campaign?.seasons?.length) {
          campaign.options = { ...DEFAULT_OPTIONS, ...campaign.options };
          campaign.pending = campaign.pending ?? null;
          campaign.retired = campaign.retired ?? [];
          set({ campaign, ready: true });
          return;
        }
      }
    } catch {
      /* sigue en la portada */
    }
    set({ ready: true });
  },
  start: (year, options, seedText) => {
    const trimmed = seedText.trim();
    const numeric = /^\d+$/.test(trimmed) ? Number(trimmed) >>> 0 : null;
    const seed = numeric !== null ? numeric : trimmed ? hashSeed(trimmed) : makeRng(Date.now() % 100000).int(999983);
    const campaign = opening(year, options, seed);
    save(campaign);
    set({ campaign });
  },
  setOptions: (options) => {
    const campaign = get().campaign;
    if (!campaign) return;
    const next = { ...campaign, options };
    save(next);
    set({ campaign: next });
  },
  simulatePending: () => {
    const campaign = get().campaign;
    if (!campaign?.pending) return;
    const done = sim(campaign, campaign.pending);
    const next = { ...campaign, pending: null, seasons: [...campaign.seasons, done] };
    save(next);
    set({ campaign: next });
  },
  advance: () => {
    const campaign = get().campaign;
    if (!campaign || campaign.pending) return;
    const prev = campaign.seasons[campaign.seasons.length - 1];
    if (!prev) return;
    const built = buildNext({
      seed: campaign.seed,
      nonce: campaign.nonce,
      options: campaign.options,
      pool: campaign.pool,
      retired: campaign.retired,
      prev,
    });
    const next = {
      ...campaign,
      pending: built.pending,
      pool: built.pool,
      retired: built.retired,
    };
    save(next);
    set({ campaign: next });
  },
  runUntil: (year) => {
    let campaign = get().campaign;
    if (!campaign) return;
    let guard = 0;
    while (guard < 48) {
      guard += 1;
      const last = campaign.seasons[campaign.seasons.length - 1]?.year ?? 0;
      if (!campaign.pending && last >= year) break;
      if (!campaign.pending) {
        const prev = campaign.seasons[campaign.seasons.length - 1];
        if (!prev) break;
        const built = buildNext({
          seed: campaign.seed,
          nonce: campaign.nonce,
          options: campaign.options,
          pool: campaign.pool,
          retired: campaign.retired,
          prev,
        });
        campaign = { ...campaign, pending: built.pending, pool: built.pool, retired: built.retired };
      }
      if (!campaign.pending || campaign.pending.year > year) break;
      const done = sim(campaign, campaign.pending);
      campaign = { ...campaign, pending: null, seasons: [...campaign.seasons, done] };
    }
    save(campaign);
    set({ campaign });
  },
  reroll: (year) => {
    const campaign = get().campaign;
    if (!campaign) return;
    const index = campaign.seasons.findIndex((season) => season.year === year);
    if (index < 0) return;
    const kept = campaign.seasons.slice(0, index);
    const draft = campaign.seasons[index];
    const nonce = campaign.nonce + 1;
    const done = simulateSeason(
      {
        year: draft.year,
        rules: draft.rules,
        teams: draft.teams,
        drivers: draft.drivers,
        races: draft.races,
        changelog: draft.changelog,
      },
      (campaign.seed + draft.year * 10007 + nonce * 17) >>> 0,
    );
    const next: Campaign = {
      ...campaign,
      nonce,
      seasons: [...kept, done],
      pending: null,
      pool: done.drivers.map((driver) => ({ ...driver })),
      retired: [],
    };
    save(next);
    set({ campaign: next });
  },
  abandon: () => {
    save(null);
    set({ campaign: null });
  },
}));
