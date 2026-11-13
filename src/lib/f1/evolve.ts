import { CIRCUITS, raceTitle } from "./circuits";
import { materialize } from "./grid";
import { personName, pickNat, teamName } from "./names";
import {
  DRIVERS,
  engineName,
  fictionalColor,
  makeDriver,
  rated,
  TEAMS,
} from "./people";
import { clamp, makeRng, type Rng } from "./rng";
import { describeDrop, pointsLabel } from "./rules";
import { constructorStandings } from "./simulate";
import type { DriverState, Options, RaceSlot, RuleSet, SeasonDraft, SimulatedSeason, TeamState } from "./types";

const WORKS_ENGINE: Record<string, string> = {
  ferrari: "ferrari",
  mercedes: "mercedes",
  renault: "renault",
  honda: "honda",
  hondaf1: "honda",
  toyota: "toyota",
  bmw: "bmw",
  audi: "audi",
  alfa: "alfa",
  maserati: "maserati",
  brm: "brm",
  alpine: "renault",
  redbull: "rbpt",
  porsche: "porsche",
};

export function buildNext(input: {
  seed: number;
  nonce: number;
  options: Options;
  pool: DriverState[];
  retired: string[];
  prev: SimulatedSeason;
}): { pending: SeasonDraft; pool: DriverState[]; retired: string[] } {
  const year = input.prev.year + 1;
  const rng = makeRng((input.seed + year * 9176 + input.nonce * 41) >>> 0);
  const real = year <= 2026 ? materialize(year) : null;
  const pastArchive = year > 2026;
  const followRegs = input.options.regs === "historico" && Boolean(real);
  const followTeams = input.options.teams === "historico" && Boolean(real);
  const followDrivers = input.options.drivers === "historico" && Boolean(real);
  const followCircuits = input.options.circuits === "real" && Boolean(real);

  const log: string[] = [];
  if (pastArchive) {
    log.push("No hay más archivo: desde este año la parrilla, el calendario y el reglamento siguen con las reglas de la crónica.");
  }

  const rulesResult = followRegs
    ? { rules: real!.rules, lines: ruleLines(input.prev.rules, real!.rules) }
    : mutateRules(input.prev.rules, year, rng, input.options.regs === "historico");
  log.push(...rulesResult.lines);

  let teams: TeamState[];
  if (followTeams) {
    teams = real!.teams.map((team) => ({ ...team, drivers: [...team.drivers] }));
    log.push(...teamLines(input.prev.teams, teams));
  } else {
    const market = marketTeams(input.prev, rulesResult.rules, rng);
    teams = market.teams;
    log.push(...market.lines);
  }

  let pool = input.pool.map((driver) => ({ ...driver }));
  let retired = [...input.retired];
  let drivers: DriverState[];

  if (followDrivers && followTeams) {
    drivers = real!.drivers.map((driver) => ({ ...driver }));
    pool = mergePool(pool, drivers);
    log.push(...driverLines(input.prev, drivers, teams));
  } else if (followDrivers && real) {
    const placed = seatHistorical(real, teams, pool, year, rng);
    teams = placed.teams;
    drivers = placed.drivers;
    pool = placed.pool;
    log.push(...placed.lines);
  } else {
    const placed = marketDrivers({
      prev: input.prev,
      teams,
      pool,
      retired,
      year,
      rng,
      realDrivers: followDrivers ? real : null,
    });
    teams = placed.teams;
    drivers = placed.drivers;
    pool = placed.pool;
    retired = placed.retired;
    log.push(...placed.lines);
  }

  let races: RaceSlot[];
  if (followCircuits) {
    races = real!.races.map((race) => ({
      ...race,
      sprint: Boolean(rulesResult.rules.sprintPoints) && race.sprint,
    }));
    log.push(...calendarLines(input.prev.races, races));
  } else {
    const calendar = evolveCalendar(input.prev.races, year, rulesResult.rules, rng);
    races = calendar.races;
    log.push(...calendar.lines);
  }

  const seen = new Set<string>();
  for (const team of teams) {
    team.drivers = team.drivers.filter((id) => {
      if (seen.has(id)) return false;
      seen.add(id);
      return drivers.some((driver) => driver.id === id);
    });
  }

  return {
    pending: {
      year,
      rules: rulesResult.rules,
      teams,
      drivers,
      races,
      changelog: log.filter(Boolean).slice(0, 16),
    },
    pool,
    retired,
  };
}

function mergePool(pool: DriverState[], seated: DriverState[]): DriverState[] {
  const map = new Map(pool.map((driver) => [driver.id, driver]));
  for (const driver of seated) {
    const prev = map.get(driver.id);
    map.set(driver.id, prev ? { ...driver, form: prev.form, contract: prev.contract } : driver);
  }
  return [...map.values()];
}

function bounds(year: number): [number, number] {
  if (year < 1961) return [5, 8];
  if (year < 1970) return [6, 10];
  if (year < 1990) return [8, 12];
  if (year < 2010) return [10, 13];
  return [10, 12];
}

function marketTeams(prev: SimulatedSeason, rules: RuleSet, rng: Rng): { teams: TeamState[]; lines: string[] } {
  const lines: string[] = [];
  const table = constructorStandings(prev) ?? [];
  const rank = new Map(table.map((row, index) => [row.id, index + 1]));
  let teams = prev.teams.map((team) => ({ ...team, drivers: [] as string[] }));
  const total = Math.max(1, teams.length);

  for (const team of teams) {
    const pos = rank.get(team.id) ?? total;
    const prize = ((total - pos + 1) / total) * 30;
    const base = team.works ? 60 : 36;
    team.budget = clamp(team.budget * 0.58 + base * 0.3 + prize, 10, 100);
    if (rules.reset) {
      const hit = rng.gauss(0, 5.5) + (team.budget - 55) * 0.09 + (team.works ? 1.6 : 0);
      team.pace = clamp(78 + (team.pace - 78) * 0.34 + hit, 58, 99);
      team.rel = clamp(team.rel * 0.72 + rng.range(-0.06, 0.04), 0.4, 0.93);
    } else {
      team.pace = clamp(team.pace + (team.budget - 58) * 0.05 + rng.gauss(0, 1.25) + (team.works ? 0.3 : 0), 56, 99);
      team.rel = clamp(team.rel + (team.budget - 62) * 0.0012 + rng.gauss(0, 0.018), 0.42, 0.96);
    }
    if (pos >= total - 1) team.streakBottom += 1;
    else if (pos < total - 3) team.streakBottom = 0;
  }

  const [minTeams, maxTeams] = bounds(prev.year + 1);
  const exit = new Set<string>();
  for (const team of teams) {
    const broke = !team.works && team.budget < 32;
    const poor = !team.works && team.streakBottom >= 2 && team.budget < 50;
    const tiredWorks = team.works && team.streakBottom >= 4 && team.budget < 42;
    if ((broke && rng.chance(0.7)) || (poor && rng.chance(0.48)) || (tiredWorks && rng.chance(0.3))) {
      exit.add(team.id);
    }
  }
  if (teams.length - exit.size < minTeams) {
    const ranked = teams
      .filter((team) => exit.has(team.id))
      .sort((a, b) => b.budget - a.budget);
    while (teams.length - exit.size < minTeams && ranked.length) {
      const keep = ranked.shift();
      if (keep) exit.delete(keep.id);
    }
  }
  for (const team of teams) {
    if (!exit.has(team.id)) continue;
    const reason = team.budget < 34 ? "se queda sin dinero" : "cierra tras demasiados malos años";
    lines.push(`${team.name} ${reason} y deja la parrilla.`);
  }
  teams = teams.filter((team) => !exit.has(team.id));

  while (teams.length > maxTeams) {
    const victim = teams
      .filter((team) => !team.works)
      .sort((a, b) => a.budget - b.budget)[0] ?? teams[teams.length - 1];
    teams = teams.filter((team) => team.id !== victim.id);
    lines.push(`${victim.name} pierde la entrada: la parrilla no da para todos.`);
  }

  const existing = new Set(teams.map((team) => team.id));
  while (teams.length < minTeams || (teams.length < maxTeams && rng.chance(0.34))) {
    const born = spawnTeam(existing, teams, rng, prev.year + 1);
    teams.push(born);
    existing.add(born.id);
    lines.push(
      born.generated
        ? `Debuta ${born.name}, escudería nueva, todavía verde.`
        : `Entra ${born.name}${born.works ? ", proyecto oficial" : ""}, en un año que la historia no le tenía guardado.`,
    );
    if (teams.length >= maxTeams) break;
  }

  return { teams, lines };
}

function spawnTeam(existing: Set<string>, grid: TeamState[], rng: Rng, year: number): TeamState {
  const absent = Object.values(TEAMS).filter((team) => !existing.has(team.id));
  const useReal = absent.length > 0 && rng.chance(0.6);
  const donor = grid.length ? rng.pick(grid) : null;
  if (useReal) {
    const bag = absent.flatMap((team) => Array.from({ length: team.works ? 3 : 1 }, () => team));
    const info = rng.pick(bag);
    const token = WORKS_ENGINE[info.id] ?? donor?.engine ?? "ford";
    const pace = clamp((info.works ? 78 : 66) + rng.range(-3, 7), 60, 88);
    return {
      id: info.id,
      name: info.name,
      nat: info.nat,
      color: info.color,
      engine: token,
      engineName: engineName(token),
      works: info.works,
      pace,
      rel: clamp(0.58 + rng.range(0, 0.12), 0.5, 0.8),
      budget: info.works ? 74 : 44,
      generated: false,
      drivers: [],
      streakBottom: 0,
    };
  }
  const name = teamName(rng);
  const token = donor?.engine ?? "ford";
  const idBase = `gen${year}`;
  let id = `${idBase}${rng.int(1000)}`;
  while (existing.has(id)) id = `${idBase}${rng.int(100000)}`;
  return {
    id,
    name,
    nat: pickNat(rng),
    color: fictionalColor(rng.int(12)),
    engine: token,
    engineName: `${engineName(token)} cliente`,
    works: false,
    pace: clamp(62 + rng.range(0, 10), 60, 76),
    rel: clamp(0.55 + rng.range(0, 0.1), 0.5, 0.75),
    budget: 36 + rng.int(18),
    generated: true,
    drivers: [],
    streakBottom: 0,
  };
}

function marketDrivers(input: {
  prev: SimulatedSeason;
  teams: TeamState[];
  pool: DriverState[];
  retired: string[];
  year: number;
  rng: Rng;
  realDrivers: SeasonDraft | null;
}): { teams: TeamState[]; drivers: DriverState[]; pool: DriverState[]; retired: string[]; lines: string[] } {
  const lines: string[] = [];
  const retired = new Set(input.retired);
  const poolMap = new Map(input.pool.map((driver) => [driver.id, { ...driver }]));
  const aliveTeams = new Set(input.teams.map((team) => team.id));

  for (const driver of poolMap.values()) {
    if (driver.retired || retired.has(driver.id)) continue;
    const age = input.year - driver.born;
    const star = driver.peak >= 95;
    if (age >= 45 || (age >= 42 && input.rng.chance(star ? 0.35 : 0.62)) || (age >= 38 && !star && input.rng.chance(0.22))) {
      driver.retired = true;
      retired.add(driver.id);
      lines.push(`${driver.name} cuelga el casco.`);
    } else {
      driver.contract = Math.max(0, driver.contract - 1);
      driver.form = clamp(driver.form * 0.35 + input.rng.gauss(0, 1.15), -3.5, 3.5);
    }
  }

  for (const driver of Object.values(DRIVERS)) {
    const age = input.year - driver.born;
    if (age < 19 || age > 21 || poolMap.has(driver.id) || retired.has(driver.id)) continue;
    poolMap.set(driver.id, makeDriver(driver.id));
  }
  for (let i = 0; i < 2; i++) {
    const rookie = fictionalDriver(input.year, input.rng, poolMap);
    poolMap.set(rookie.id, rookie);
  }

  const previous = new Map<string, string>();
  for (const team of input.prev.teams) {
    for (const id of team.drivers) previous.set(id, team.id);
  }

  const locked = new Map<string, string>();
  for (const [id, teamId] of previous) {
    const driver = poolMap.get(id);
    if (!driver || driver.retired || !aliveTeams.has(teamId)) continue;
    if (driver.contract > 0 && input.rng.chance(0.72)) locked.set(id, teamId);
  }

  for (const team of input.teams) {
    team.drivers = [...locked.entries()].filter(([, teamId]) => teamId === team.id).map(([id]) => id);
  }

  const cap = 2;
  const open: string[] = [];
  for (const team of prestigeOrder(input.teams)) {
    while (team.drivers.length < cap) open.push(team.id);
  }

  const free = [...poolMap.values()].filter(
    (driver) => !driver.retired && !locked.has(driver.id) && input.year - driver.born >= 18 && input.year - driver.born <= 44,
  );
  free.sort((a, b) => scout(b, input.year, input.rng) - scout(a, input.year, input.rng));

  const prestige = new Map(input.teams.map((team) => [team.id, team.pace * 0.65 + team.budget * 0.35]));
  const openSeats = [...open].sort((a, b) => (prestige.get(b) ?? 0) - (prestige.get(a) ?? 0));
  for (const driver of free) {
    if (!openSeats.length) break;
    if (scout(driver, input.year, input.rng) < 60 && input.rng.chance(0.35)) continue;
    const teamId = openSeats.shift();
    if (!teamId) break;
    const team = input.teams.find((item) => item.id === teamId);
    if (!team) continue;
    team.drivers.push(driver.id);
    driver.contract = driver.peak > 92 ? 3 : driver.peak > 82 ? 2 : 1;
    const before = previous.get(driver.id);
    if (!before && (driver.generated || input.year - driver.born <= 22)) {
      lines.push(`Debuta ${driver.name} (${driver.nat}) en ${team.name}.`);
    } else if (before && before !== team.id && driver.peak >= 86) {
      const oldName = input.prev.teams.find((item) => item.id === before)?.name ?? "su equipo";
      lines.push(`${driver.name} deja ${oldName} y ficha por ${team.name}.`);
    }
  }

  for (const team of input.teams) {
    while (team.drivers.length < cap) {
      const rookie = fictionalDriver(input.year, input.rng, poolMap);
      poolMap.set(rookie.id, rookie);
      team.drivers.push(rookie.id);
      rookie.contract = 1;
      lines.push(`La academia cubre un asiento: ${rookie.name} (${rookie.nat}) ficha por ${team.name}.`);
    }
  }

  const seatedIds = new Set(input.teams.flatMap((team) => team.drivers));
  const drivers = [...poolMap.values()].filter((driver) => seatedIds.has(driver.id));
  return {
    teams: input.teams,
    drivers,
    pool: [...poolMap.values()].filter((driver) => !driver.retired || seatedIds.has(driver.id)).slice(-160),
    retired: [...retired],
    lines,
  };
}

function scout(driver: DriverState, year: number, rng: Rng): number {
  const now = rated(driver, year).race;
  return now * 0.62 + driver.peak * 0.38 + rng.gauss(0, 2.4);
}

function fictionalDriver(year: number, rng: Rng, pool: Map<string, DriverState>): DriverState {
  const nat = pickNat(rng);
  const used = new Set([...pool.values()].map((driver) => driver.name));
  const star = rng.chance(0.08);
  const peak = star ? 88 + rng.int(9) : 68 + rng.int(16);
  let id = `ac${year}${rng.int(100000)}`;
  while (pool.has(id)) id = `ac${year}${rng.int(100000)}`;
  return {
    id,
    name: personName(nat, rng, used),
    nat,
    born: year - (18 + rng.int(4)),
    peak,
    peakAge: 26 + rng.int(6),
    consistency: clamp(peak - 8 + rng.int(14), 55, 96),
    wet: clamp(peak - 10 + rng.int(18), 55, 99),
    quali: clamp(peak - 6 + rng.int(12), 55, 99),
    generated: true,
    form: 0,
    contract: 0,
    retired: false,
  };
}

function seatHistorical(
  real: SeasonDraft,
  teams: TeamState[],
  pool: DriverState[],
  year: number,
  rng: Rng,
): { teams: TeamState[]; drivers: DriverState[]; pool: DriverState[]; lines: string[] } {
  const lines: string[] = [];
  const poolMap = new Map(pool.map((driver) => [driver.id, driver]));
  for (const team of teams) team.drivers = [];
  const wanted = real.teams.flatMap((team) =>
    team.drivers.map((id) => ({ id, teamId: team.id, skill: rated(makeDriver(id), year).race })),
  );
  const alive = new Set(teams.map((team) => team.id));
  const seated = new Set<string>();
  for (const seat of wanted) {
    if (!alive.has(seat.teamId) || seated.has(seat.id)) continue;
    const team = teams.find((item) => item.id === seat.teamId);
    if (!team || team.drivers.length >= 2) continue;
    team.drivers.push(seat.id);
    seated.add(seat.id);
    ensure(poolMap, seat.id);
  }
  const leftovers = wanted.filter((seat) => !seated.has(seat.id)).sort((a, b) => b.skill - a.skill);
  const prestige = prestigeOrder(teams);
  for (const seat of leftovers) {
    const team = prestige.find((item) => item.drivers.length < 2);
    if (!team) {
      const profile = DRIVERS[seat.id];
      lines.push(`${profile?.name ?? seat.id} se queda sin butaca.`);
      continue;
    }
    team.drivers.push(seat.id);
    seated.add(seat.id);
    ensure(poolMap, seat.id);
    if (seat.teamId !== team.id) {
      lines.push(`${DRIVERS[seat.id]?.name ?? seat.id} no encuentra a su equipo y ficha por ${team.name}.`);
    }
  }
  for (const team of teams) {
    while (team.drivers.length < 2) {
      const rookie = fictionalDriver(year, rng, poolMap);
      poolMap.set(rookie.id, rookie);
      team.drivers.push(rookie.id);
      lines.push(`Asiento libre en ${team.name}: debuta ${rookie.name}.`);
    }
  }
  const ids = new Set(teams.flatMap((team) => team.drivers));
  return {
    teams,
    drivers: [...poolMap.values()].filter((driver) => ids.has(driver.id)),
    pool: [...poolMap.values()],
    lines,
  };
}

function ensure(pool: Map<string, DriverState>, id: string) {
  if (!pool.has(id)) pool.set(id, makeDriver(id));
}

function prestigeOrder(teams: TeamState[]): TeamState[] {
  return teams.slice().sort((a, b) => b.pace + b.budget * 0.2 - (a.pace + a.budget * 0.2));
}

function evolveCalendar(prev: RaceSlot[], year: number, rules: RuleSet, rng: Rng): { races: RaceSlot[]; lines: string[] } {
  const [minR, maxR] = year < 1961 ? [7, 12] : year < 1980 ? [12, 17] : year < 2000 ? [15, 18] : year < 2016 ? [17, 21] : [20, 24];
  let target = clamp(prev.length + rng.int(3) - 1, minR, maxR);
  const kept: RaceSlot[] = [];
  for (const race of prev) {
    const classic = ["monaco", "monza", "silverstone", "spa"].includes(race.circuitId);
    const stay = rng.chance(classic ? 0.94 : 0.8);
    if (stay) kept.push({ ...race, sprint: false });
  }
  const used = new Set(kept.map((race) => race.circuitId));
  const catalog = Object.values(CIRCUITS);
  while (kept.length < target) {
    const fictional = rng.chance(0.16);
    const options = catalog.filter((circuit) => !used.has(circuit.id) && Boolean(circuit.fictional) === fictional);
    const bag = options.length ? options : catalog.filter((circuit) => !used.has(circuit.id));
    if (!bag.length) break;
    const circuit = rng.pick(bag);
    used.add(circuit.id);
    kept.push({ circuitId: circuit.id, gp: circuit.gp, sprint: false });
  }
  while (kept.length > target) {
    const index = rng.int(kept.length);
    if (["monaco", "monza"].includes(kept[index].circuitId) && rng.chance(0.7)) continue;
    kept.splice(index, 1);
  }
  kept.sort((a, b) => (CIRCUITS[a.circuitId]?.tour ?? 50) - (CIRCUITS[b.circuitId]?.tour ?? 50));
  if (rules.sprintPoints) {
    const bag = kept
      .slice()
      .sort((a, b) => (CIRCUITS[b.circuitId]?.overtake ?? 0) - (CIRCUITS[a.circuitId]?.overtake ?? 0));
    const count = clamp(Math.round(kept.length * 0.22), 2, 6);
    for (const race of bag.slice(0, count)) race.sprint = true;
  }
  return { races: kept, lines: calendarLines(prev, kept) };
}

function teamLines(prev: TeamState[], next: TeamState[]): string[] {
  const a = new Map(prev.map((team) => [team.id, team.name]));
  const b = new Map(next.map((team) => [team.id, team.name]));
  const lines: string[] = [];
  for (const [id, name] of b) if (!a.has(id)) lines.push(`Entra ${name}.`);
  for (const [id, name] of a) if (!b.has(id)) lines.push(`Sale ${name}.`);
  return lines;
}

function driverLines(prev: SimulatedSeason, drivers: DriverState[], teams: TeamState[]): string[] {
  const before = new Map<string, string>();
  for (const team of prev.teams) for (const id of team.drivers) before.set(id, team.name);
  const after = new Map<string, string>();
  for (const team of teams) for (const id of team.drivers) after.set(id, team.name);
  const names = new Map(drivers.map((driver) => [driver.id, driver.name]));
  for (const driver of prev.drivers) names.set(driver.id, driver.name);
  const lines: string[] = [];
  for (const [id, team] of after) {
    if (!before.has(id)) lines.push(`Entra ${names.get(id) ?? id} (${team}).`);
    else if (before.get(id) !== team) lines.push(`${names.get(id) ?? id} pasa de ${before.get(id)} a ${team}.`);
  }
  for (const [id] of before) {
    if (!after.has(id)) lines.push(`${names.get(id) ?? id} sale de la parrilla.`);
  }
  if (lines.length > 8) return [...lines.slice(0, 7), `Y ${lines.length - 7} movimientos más de pilotos.`];
  return lines;
}

function calendarLines(prev: RaceSlot[], next: RaceSlot[]): string[] {
  const prevIds = new Set(prev.map((race) => race.circuitId + race.gp));
  const nextIds = new Set(next.map((race) => race.circuitId + race.gp));
  const added = next.filter((race) => !prevIds.has(race.circuitId + race.gp)).map((race) => raceTitle(race.gp));
  const gone = prev.filter((race) => !nextIds.has(race.circuitId + race.gp)).map((race) => raceTitle(race.gp));
  const lines: string[] = [];
  if (added.length) lines.push(`Entran al calendario ${list(added)}.`);
  if (gone.length) lines.push(`Salen del calendario ${list(gone)}.`);
  return lines;
}

function list(items: string[]): string {
  const shown = items.slice(0, 4);
  const extra = items.length - shown.length;
  const body = shown.join(", ");
  return extra > 0 ? `${body} y ${extra} más` : body;
}

function ruleLines(prev: RuleSet, next: RuleSet): string[] {
  const lines: string[] = [];
  if (next.reset || prev.name !== next.name) lines.push(`Reglamento: ${next.name}. ${next.note.split(". ")[0]}.`);
  if (pointsLabel(prev.points) !== pointsLabel(next.points)) lines.push(`Nuevo baremo de puntos: ${pointsLabel(next.points)}.`);
  if (JSON.stringify(prev.drop) !== JSON.stringify(next.drop)) lines.push(describeDrop(next.drop, 99).replace(" de 99", ""));
  if (!prev.constructors && next.constructors) lines.push("Nace el campeonato de constructores.");
  if (prev.bestCarOnly && !next.bestCarOnly) lines.push("A partir de ahora puntúan los dos coches.");
  if (prev.refuel !== next.refuel) lines.push(next.refuel ? "Vuelve el repostaje." : "Se prohíbe el repostaje.");
  if (prev.flPoint !== next.flPoint) lines.push(next.flPoint ? "La vuelta rápida vuelve a puntuar." : "La vuelta rápida deja de puntuar.");
  if (Boolean(prev.sprintPoints) !== Boolean(next.sprintPoints)) {
    lines.push(next.sprintPoints ? "Algunos fines de semana suman una carrera al sprint." : "Se cancelan los sprints.");
  }
  return lines;
}

function mutateRules(prev: RuleSet, year: number, rng: Rng, anchored: boolean): { rules: RuleSet; lines: string[] } {
  const rules: RuleSet = {
    ...prev,
    year,
    points: [...prev.points],
    sprintPoints: prev.sprintPoints ? [...prev.sprintPoints] : null,
    drop: { ...prev.drop },
    invented: true,
    reset: false,
  };
  const lines: string[] = [];
  if (anchored) {
    rules.dnf = clamp(rules.dnf * 0.97 + 0.01, 0.38, 0.8);
    if (year % 8 === 2 && rng.chance(0.7)) {
      rules.reset = true;
      rules.name = "Paquete nuevo sobre la base de 2026";
      rules.note = "Sin archivo por delante, la FIA mueve el desarrollo justo lo bastante para que el pelotón no se quede congelado.";
      lines.push(rules.note);
    } else {
      lines.push("El reglamento técnico de 2026 se mantiene, con el desarrollo de cada equipo.");
    }
    return { rules, lines };
  }

  if (rng.chance(0.22)) {
    rules.reset = true;
    const titles = [
      "Techo de desarrollo",
      "Motores nuevos",
      "Neumático más blando",
      "Chasis más corto",
      "Combustible distinto",
      "Vuelve el efecto suelo",
    ];
    rules.name = rng.pick(titles);
    rules.formula = rules.name;
    rules.dnf = clamp(rules.dnf + 0.18, 0.35, 1.6);
    rules.note = `La FIA estrena un paquete — ${rules.name.toLowerCase()} — y el que acierta el concepto parte delante. El primer año la fiabilidad sufre.`;
    lines.push(rules.note);
  }
  if (rng.chance(0.2)) {
    const books = [
      [10, 8, 6, 5, 4, 3, 2, 1],
      [9, 6, 4, 3, 2, 1],
      [25, 18, 15, 12, 10, 8, 6, 4, 2, 1],
      [8, 6, 4, 3, 2],
    ];
    rules.points = rng.pick(books);
    lines.push(`Baremo nuevo: ${pointsLabel(rules.points)}.`);
  }
  if (rng.chance(0.16)) {
    rules.flPoint = !rules.flPoint;
    rules.flTop10Only = rules.flPoint && year > 1990 && rng.chance(0.6);
    lines.push(rules.flPoint ? "Se otorga un punto por la vuelta rápida." : "Desaparece el punto por la vuelta rápida.");
  }
  if (year > 1975 && rng.chance(0.14)) {
    rules.refuel = !rules.refuel;
    rules.strategy = rules.refuel ? 0.86 : 0.55;
    lines.push(rules.refuel ? "Se permite repostar. La estrategia pesa más." : "Se prohíbe repostar. Hay que cuidar la goma.");
  }
  if (year > 1990 && rng.chance(0.18)) {
    rules.sprintPoints = rules.sprintPoints ? null : [8, 7, 6, 5, 4, 3, 2, 1];
    lines.push(rules.sprintPoints ? "Llegan las carreras al sprint." : "Los sprints salen del calendario.");
  }
  if (!rules.constructors && year >= 1954 && rng.chance(0.2)) {
    rules.constructors = true;
    rules.bestCarOnly = year < 1970 && rng.chance(0.5);
    lines.push("Esta crónica adelanta el campeonato de constructores.");
  }
  rules.dnf = clamp(rules.dnf + rng.gauss(0, 0.04), 0.32, 1.7);
  rules.overtakeAid = clamp(rules.overtakeAid + rng.gauss(0, 0.04), 0.1, 0.7);
  if (!lines.length) lines.push("El reglamento apenas se mueve. Manda el desarrollo de cada equipo.");
  return { rules, lines };
}
