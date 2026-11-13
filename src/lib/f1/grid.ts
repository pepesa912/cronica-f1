import { CIRCUITS } from "./circuits";
import { engineName, makeDriver, teamInfo } from "./people";
import { historicalRules } from "./rules";
import { rawSeason } from "./seasons";
import type { DriverState, RaceSlot, SeasonDraft, TeamState } from "./types";

export function budgetFrom(pace: number, works: boolean): number {
  return Math.max(18, Math.min(96, 40 + (pace - 74) * 1.35 + (works ? 12 : 0)));
}

export function materialize(year: number): SeasonDraft {
  const raw = rawSeason(year);
  if (!raw) throw new Error(`No hay archivo histórico para ${year}.`);
  const drivers: DriverState[] = [];
  const seen = new Set<string>();
  const teams: TeamState[] = raw.entries.map((entry) => {
    const info = teamInfo(entry.team);
    for (const id of entry.drivers) {
      if (seen.has(id)) throw new Error(`Piloto repetido en ${year}: ${id}`);
      seen.add(id);
      drivers.push(makeDriver(id));
    }
    return {
      id: entry.team,
      name: entry.name ?? info.name,
      nat: info.nat,
      color: info.color,
      engine: entry.engine,
      engineName: engineName(entry.engine),
      works: info.works,
      pace: entry.pace,
      rel: entry.rel,
      budget: budgetFrom(entry.pace, info.works),
      generated: false,
      drivers: [...entry.drivers],
      streakBottom: 0,
    };
  });
  const races: RaceSlot[] = raw.races.map((race) => {
    const circuit = CIRCUITS[race.id];
    if (!circuit) throw new Error(`Circuito desconocido en ${year}: ${race.id}`);
    return {
      circuitId: race.id,
      gp: race.gp ?? circuit.gp,
      sprint: raw.sprints.includes(race.id),
    };
  });
  return {
    year,
    rules: historicalRules(year),
    teams,
    drivers,
    races,
    changelog: [],
  };
}

export function byId<T extends { id: string }>(rows: T[]): Map<string, T> {
  return new Map(rows.map((row) => [row.id, row]));
}
