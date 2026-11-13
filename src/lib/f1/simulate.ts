import { CIRCUITS, circuitLaps, raceTitle } from "./circuits";
import { NUMBERS, rated } from "./people";
import { clamp, makeRng, type Rng } from "./rng";
import type {
  ClassifiedRow,
  DriverState,
  DropRule,
  RaceOutcome,
  RuleSet,
  SeasonDraft,
  SimulatedSeason,
  TeamState,
} from "./types";

const REASONS = [
  "Motor",
  "Caja",
  "Hidráulico",
  "Eléctrico",
  "Frenos",
  "Suspensión",
  "Pinchazo",
  "Sobrecalentamiento",
  "Embrague",
  "Fuga",
  "Combustible",
];

export type StandingRow = {
  id: string;
  name: string;
  nat?: string;
  teamId: string;
  teamName: string;
  color: string;
  points: number;
  gross: number;
  wins: number;
  podiums: number;
  poles: number;
  fastest: number;
  dnfs: number;
  counts: number[];
  rounds: { pos: number | null; fl: boolean; pole: boolean; points: number; status: string }[];
};

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function top(values: number[], count: number): number {
  return sum(
    values
      .slice()
      .sort((a, b) => b - a)
      .slice(0, Math.min(count, values.length)),
  );
}

export function netPoints(scores: number[], drop: DropRule): number {
  if (drop.mode === "all" || scores.length === 0) return sum(scores);
  if (drop.mode === "best") return top(scores, drop.n);
  const mid = Math.ceil(scores.length / 2);
  return top(scores.slice(0, mid), drop.first) + top(scores.slice(mid), drop.second);
}

function clock(total: number): string {
  const safe = Math.max(0, total);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = (safe - hours * 3600 - minutes * 60).toFixed(3).padStart(6, "0");
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, "0")}:${seconds}`;
  return `${minutes}:${seconds}`;
}

export function assignNumbers(drivers: DriverState[], teams: TeamState[]): Map<string, number> {
  const used = new Set<number>();
  const numbers = new Map<string, number>();
  const order = teams.flatMap((team) => team.drivers);
  for (const id of order) {
    const preferred = NUMBERS[id];
    if (preferred && preferred > 0 && !used.has(preferred)) {
      used.add(preferred);
      numbers.set(id, preferred);
      continue;
    }
    let n = 2;
    while (used.has(n)) n += 1;
    used.add(n);
    numbers.set(id, n);
  }
  for (const driver of drivers) {
    if (!numbers.has(driver.id)) {
      let n = 2;
      while (used.has(n)) n += 1;
      used.add(n);
      numbers.set(driver.id, n);
    }
  }
  return numbers;
}

type Car = {
  driver: DriverState;
  team: TeamState;
  number: number;
  race: number;
  qualiSkill: number;
  wet: number;
  consistency: number;
  car: number;
};

function runSession(
  cars: Car[],
  circuit: (typeof CIRCUITS)[string],
  rules: RuleSet,
  year: number,
  rng: Rng,
  kind: "feature" | "sprint",
  weather: RaceOutcome["weather"],
): { rows: ClassifiedRow[]; safetyCar: boolean; winnerId: string | null; poleId: string; fastestId: string | null } {
  const totalLaps =
    kind === "sprint" ? Math.max(12, Math.round(circuitLaps(circuit) / 3)) : circuitLaps(circuit);
  const wet = weather === "Lluvia" ? 1 : weather === "Húmedo" ? 0.45 : 0;
  const grid = cars
    .map((car) => ({
      car,
      score:
        car.car * 0.58 +
        car.qualiSkill * 0.42 +
        rng.gauss(0, 1.15 + (1 - circuit.overtake) * 0.55),
    }))
    .sort((a, b) => b.score - a.score);

  const n = grid.length;
  const carWeight = clamp(0.6 - circuit.street * 0.14 + (circuit.speed - 1) * 0.2, 0.4, 0.74);
  const noise = 1.25 + (wet > 0 ? 1.5 : 0) + (kind === "sprint" ? -0.2 : 0);

  type Running = {
    car: Car;
    grid: number;
    score: number;
    laps: number;
    status: string;
    finished: boolean;
  };

  const running: Running[] = grid.map((entry, index) => {
    const driverPart = entry.car.race * (1 - wet) + entry.car.wet * wet;
    const retention = ((n - index) / n) * (1.15 - circuit.overtake) * 5.5;
    const score =
      entry.car.car * carWeight +
      driverPart * (1 - carWeight) +
      rng.gauss(0, rules.strategy * 2.1) +
      rng.gauss(0, noise) +
      retention * 0.42;
    return { car: entry.car, grid: index + 1, score, laps: totalLaps, status: "Meta", finished: true };
  });

  let safetyCar = false;
  for (const row of running) {
    const lap1 =
      rng.chance(
        circuit.danger * (0.045 + circuit.street * 0.05) * (1.25 - row.car.consistency / 140) *
          (kind === "sprint" ? 0.7 : 1),
      );
    if (lap1) {
      row.finished = false;
      row.status = rng.chance(0.55) ? "Choque" : "Accidente";
      row.laps = rng.int(3);
      row.score = -40 - rng.next() * 20;
      if (rules.safetyCar) safetyCar = true;
      continue;
    }
    const dnfP = clamp(
      (1 - row.car.team.rel) * rules.dnf * (kind === "sprint" ? 0.45 : 0.82) +
        (1 - row.car.consistency / 100) * 0.07 +
        (wet > 0 ? 0.035 : 0) +
        circuit.danger * 0.02,
      0.015,
      0.62,
    );
    if (rng.chance(dnfP)) {
      row.finished = false;
      row.status = rng.chance(0.22) ? (rng.chance(0.5) ? "Accidente" : "Salida") : rng.pick(REASONS);
      const fail = 1 + Math.floor(Math.pow(rng.next(), 0.85) * (totalLaps - 1));
      row.laps = fail;
      row.score = -10 - (totalLaps - fail);
    }
  }

  if (rules.safetyCar && (weather !== "Seco" || rng.chance(circuit.street * 0.35 + 0.08))) safetyCar = true;

  const finishers = running.filter((row) => row.finished);
  const leader = finishers.slice().sort((a, b) => b.score - a.score)[0];
  const leaderScore = leader?.score ?? Math.max(...running.map((row) => row.score));
  const compress = safetyCar ? 0.72 : 1;
  const baseHours = (totalLaps * circuit.len) / (rules.avgKmh * circuit.speed);
  const winnerTime = baseHours * 3600;
  const lapTime = winnerTime / totalLaps;

  if (leader) {
    const delta = (leaderScore - leader.score) * totalLaps * 0.16 * compress;
    leader.laps = totalLaps;
    void delta;
  }
  for (const row of finishers) {
    const gapSec = Math.max(0, (leaderScore - row.score) * totalLaps * 0.16 * compress);
    const down = Math.floor(gapSec / lapTime);
    row.laps = Math.max(1, totalLaps - down);
  }

  const winnerLaps = leader ? totalLaps : Math.max(...running.map((row) => row.laps));
  const ordered = running.slice().sort((a, b) => {
    if (b.laps !== a.laps) return b.laps - a.laps;
    return b.score - a.score;
  });

  let fastestId: string | null = null;
  if (kind === "feature") {
    const classifiedPool = ordered.filter((row) => row.laps >= winnerLaps * 0.9);
    let best = -Infinity;
    for (const row of classifiedPool) {
      const score = row.car.qualiSkill * 0.5 + row.car.car * 0.35 + rng.gauss(0, 4);
      if (score > best) {
        best = score;
        fastestId = row.car.driver.id;
      }
    }
    if (leader && rng.chance(0.38)) fastestId = leader.car.driver.id;
  }

  const poleId = grid[0].car.driver.id;
  const rows: ClassifiedRow[] = ordered.map((row) => {
    const classified = row.laps >= winnerLaps * 0.9 && winnerLaps > 0;
    const position = classified ? ordered.filter((other) => other.laps >= winnerLaps * 0.9).indexOf(row) + 1 : null;
    let points = 0;
    if (position) {
      const table = kind === "sprint" ? rules.sprintPoints : rules.points;
      if (table && position <= table.length) points = table[position - 1];
    }
    const isWinner = row.car.driver.id === leader?.car.driver.id && row.finished && row.laps === totalLaps;
    let gap = row.status;
    if (row.finished && row.laps === totalLaps) {
      if (isWinner) gap = clock(winnerTime);
      else {
        const gapSec = Math.max(0.08, (leaderScore - row.score) * totalLaps * 0.16 * compress);
        const down = totalLaps - row.laps;
        gap = down > 0 ? `+${down} ${down === 1 ? "vuelta" : "vueltas"}` : `+${gapSec.toFixed(3)}`;
      }
    } else if (row.finished && row.laps < totalLaps) {
      const down = totalLaps - row.laps;
      gap = `+${down} ${down === 1 ? "vuelta" : "vueltas"}`;
    }
    const fastest = row.car.driver.id === fastestId && classified;
    if (kind === "feature" && fastest && rules.flPoint && position && (!rules.flTop10Only || position <= 10)) {
      points += 1;
    }
    return {
      driverId: row.car.driver.id,
      teamId: row.car.team.id,
      grid: row.grid,
      position,
      classified,
      laps: row.laps,
      gap,
      status: row.finished && row.laps === totalLaps ? "Meta" : row.status,
      points,
      fastestLap: fastest,
      pole: row.car.driver.id === poleId,
    };
  });

  // Fix lapped finishers' gap already set. Recompute position order is insertion order of classified.
  // `ordered.filter().indexOf` is correct.
  const winnerId = rows.find((row) => row.position === 1)?.driverId ?? null;
  return { rows, safetyCar, winnerId, poleId, fastestId };
}

function weatherOf(circuit: (typeof CIRCUITS)[string], rng: Rng): RaceOutcome["weather"] {
  const roll = rng.next();
  if (roll < circuit.rain * 0.45) return "Lluvia";
  if (roll < circuit.rain * 0.9) return "Húmedo";
  return "Seco";
}

function headline(gp: string, winner: DriverState | undefined, team: TeamState | undefined, weather: string, grid: number, fieldRank: number): string {
  if (!winner || !team) return `${raceTitle(gp)} no tiene ganador.`;
  const wet = weather === "Seco" ? "" : " en mojado";
  if (fieldRank > 4) return `Sorpresa en ${gp}: gana ${winner.name} (${team.name})${wet}.`;
  if (grid > 6) return `${winner.name} remonta en ${gp} y gana desde la ${grid}.ª${wet}.`;
  return `${winner.name} gana en ${gp}${wet}.`;
}

export function simulateSeason(draft: SeasonDraft, seed: number): SimulatedSeason {
  const rng = makeRng(seed || 1);
  const drivers = new Map(draft.drivers.map((driver) => [driver.id, driver]));
  const teams = new Map(draft.teams.map((team) => [team.id, team]));
  const numbers = assignNumbers(draft.drivers, draft.teams);
  const paceRank = new Map(
    draft.teams
      .slice()
      .sort((a, b) => b.pace - a.pace)
      .map((team, index) => [team.id, index + 1]),
  );

  const cars: Car[] = draft.teams.flatMap((team) =>
    team.drivers.map((id) => {
      const driver = drivers.get(id);
      if (!driver) throw new Error(`Falta la ficha de ${id}`);
      const skill = rated(driver, draft.year);
      return {
        driver,
        team,
        number: numbers.get(id) ?? 0,
        race: skill.race,
        qualiSkill: skill.quali,
        wet: skill.wet,
        consistency: driver.consistency,
        car: team.pace + rng.gauss(0, 0.55),
      };
    }),
  );

  const results: RaceOutcome[] = draft.races.map((slot, index) => {
    const circuit = CIRCUITS[slot.circuitId];
    const raceRng = rng.fork(index + 1);
    const weather = weatherOf(circuit, raceRng);
    const sprint =
      slot.sprint && draft.rules.sprintPoints
        ? runSession(cars, circuit, draft.rules, draft.year, raceRng.fork(3), "sprint", weather)
        : null;
    const feature = runSession(cars, circuit, draft.rules, draft.year, raceRng.fork(9), "feature", weather);
    const winner = feature.winnerId ? drivers.get(feature.winnerId) : undefined;
    const winnerTeam = feature.winnerId
      ? teams.get(feature.rows.find((row) => row.driverId === feature.winnerId)?.teamId ?? "")
      : undefined;
    const grid = feature.rows.find((row) => row.driverId === feature.winnerId)?.grid ?? 1;
    return {
      round: index + 1,
      gp: slot.gp,
      circuitId: slot.circuitId,
      circuit: circuit.name,
      country: circuit.country,
      weather,
      sprint: Boolean(sprint),
      laps: circuitLaps(circuit),
      safetyCar: feature.safetyCar,
      sprintRows: sprint?.rows,
      rows: feature.rows,
      headline: headline(slot.gp, winner, winnerTeam, weather, grid, winnerTeam ? paceRank.get(winnerTeam.id) ?? 9 : 9),
      poleId: feature.poleId,
      winnerId: feature.winnerId,
      fastestId: feature.fastestId,
    };
  });

  return { ...draft, results, seed };
}

function roundScore(race: RaceOutcome, driverId: string): { points: number; pos: number | null; fl: boolean; pole: boolean; status: string } {
  const feature = race.rows.find((row) => row.driverId === driverId);
  const sprint = race.sprintRows?.find((row) => row.driverId === driverId);
  return {
    points: (feature?.points ?? 0) + (sprint?.points ?? 0),
    pos: feature?.position ?? null,
    fl: Boolean(feature?.fastestLap),
    pole: Boolean(feature?.pole),
    status: feature?.status ?? "",
  };
}

export function driverStandings(season: SimulatedSeason): StandingRow[] {
  const drivers = new Map(season.drivers.map((driver) => [driver.id, driver]));
  const teams = new Map(season.teams.map((team) => [team.id, team]));
  const rows: StandingRow[] = season.drivers.map((driver) => {
    const scores = season.results.map((race) => roundScore(race, driver.id));
    const teamId = season.results[0]?.rows.find((row) => row.driverId === driver.id)?.teamId
      ?? season.teams.find((team) => team.drivers.includes(driver.id))?.id
      ?? "";
    const team = teams.get(teamId);
    const counts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let wins = 0;
    let podiums = 0;
    let poles = 0;
    let fastest = 0;
    let dnfs = 0;
    for (const score of scores) {
      if (score.pos) {
        counts[score.pos - 1] = (counts[score.pos - 1] ?? 0) + 1;
        if (score.pos === 1) wins += 1;
        if (score.pos <= 3) podiums += 1;
      }
      if (score.pole) poles += 1;
      if (score.fl) fastest += 1;
      if (score.status && score.status !== "Meta") dnfs += 1;
    }
    const gross = sum(scores.map((score) => score.points));
    return {
      id: driver.id,
      name: drivers.get(driver.id)?.name ?? driver.id,
      nat: driver.nat,
      teamId,
      teamName: team?.name ?? "—",
      color: team?.color ?? "#8a8f98",
      points: netPoints(scores.map((score) => score.points), season.rules.drop),
      gross,
      wins,
      podiums,
      poles,
      fastest,
      dnfs,
      counts,
      rounds: scores,
    };
  });
  rows.sort(compareStanding);
  return rows;
}

export function constructorStandings(season: SimulatedSeason): StandingRow[] | null {
  if (!season.rules.constructors) return null;
  const rows: StandingRow[] = season.teams.map((team) => {
    const scores = season.results.map((race) => {
      const mine = race.rows.filter((row) => row.teamId === team.id);
      const sprint = (race.sprintRows ?? []).filter((row) => row.teamId === team.id);
      const perCar = new Map<string, number>();
      for (const row of mine) perCar.set(row.driverId, (perCar.get(row.driverId) ?? 0) + row.points);
      for (const row of sprint) perCar.set(row.driverId, (perCar.get(row.driverId) ?? 0) + row.points);
      const values = [...perCar.values()];
      const points = season.rules.bestCarOnly ? Math.max(0, ...values, 0) : sum(values);
      const best = mine.slice().sort((a, b) => (a.position ?? 99) - (b.position ?? 99))[0];
      return {
        points,
        pos: best?.position ?? null,
        fl: mine.some((row) => row.fastestLap),
        pole: mine.some((row) => row.pole),
        status: best?.status ?? "",
      };
    });
    const counts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let wins = 0;
    let podiums = 0;
    let poles = 0;
    let fastest = 0;
    let dnfs = 0;
    for (const race of season.results) {
      const mine = race.rows.filter((row) => row.teamId === team.id);
      if (mine.some((row) => row.position === 1)) wins += 1;
      for (const row of mine) {
        if (row.position && row.position <= 3) podiums += 1;
        if (row.position) counts[row.position - 1] = (counts[row.position - 1] ?? 0) + 1;
        if (row.status !== "Meta") dnfs += 1;
      }
      if (mine.some((row) => row.pole)) poles += 1;
      if (mine.some((row) => row.fastestLap)) fastest += 1;
    }
    const gross = sum(scores.map((score) => score.points));
    return {
      id: team.id,
      name: team.name,
      teamId: team.id,
      teamName: team.engineName,
      color: team.color,
      points: netPoints(scores.map((score) => score.points), season.rules.drop),
      gross,
      wins,
      podiums,
      poles,
      fastest,
      dnfs,
      counts,
      rounds: scores.map(({ points, pos, fl, pole, status }) => ({ points, pos, fl, pole, status })),
    };
  });
  rows.sort(compareStanding);
  return rows;
}

function compareStanding(a: StandingRow, b: StandingRow): number {
  if (b.points !== a.points) return b.points - a.points;
  const length = Math.max(a.counts.length, b.counts.length);
  for (let i = 0; i < length; i++) {
    const delta = (b.counts[i] ?? 0) - (a.counts[i] ?? 0);
    if (delta) return delta;
  }
  return a.name.localeCompare(b.name, "es");
}

export function chronicle(season: SimulatedSeason): string {
  const drivers = driverStandings(season);
  const teams = constructorStandings(season);
  const champ = drivers[0];
  const second = drivers[1];
  if (!champ) return "La temporada no produjo clasificación.";
  const gap = second ? champ.points - second.points : champ.points;
  const title = `${champ.name} se queda con el mundial de ${season.year} con ${teamNameOf(season, champ.teamId)}, ${champ.points} puntos y ${champ.wins} ${champ.wins === 1 ? "victoria" : "victorias"}.`;
  const chase = second
    ? gap === 0
      ? ` Empata a puntos con ${second.name} y el desempate lo deja delante.`
      : ` ${second.name} es segundo, a ${gap} ${gap === 1 ? "punto" : "puntos"}.`
    : "";
  const makers =
    teams && teams[0]
      ? ` En constructores manda ${teams[0].name}${teams[1] ? `, por delante de ${teams[1].name}` : ""}.`
      : " Todavía no existe el campeonato de constructores.";
  return title + chase + makers;
}

function teamNameOf(season: SimulatedSeason, id: string): string {
  return season.teams.find((team) => team.id === id)?.name ?? "su equipo";
}
