export type DropRule =
  | { mode: "all" }
  | { mode: "best"; n: number }
  | { mode: "halves"; first: number; second: number };

export type RuleSet = {
  year: number;
  name: string;
  formula: string;
  tyres: string;
  points: number[];
  flPoint: boolean;
  flTop10Only: boolean;
  sprintPoints: number[] | null;
  drop: DropRule;
  constructors: boolean;
  bestCarOnly: boolean;
  refuel: boolean;
  strategy: number;
  dnf: number;
  overtakeAid: number;
  avgKmh: number;
  safetyCar: boolean;
  reset: boolean;
  note: string;
  invented?: boolean;
};

export type Options = {
  regs: "historico" | "alternativo";
  teams: "historico" | "mercado";
  drivers: "historico" | "academia";
  circuits: "real" | "vivo";
  signings: "historico" | "simulado";
  retirements: "historico" | "simulado";
};

export type DriverState = {
  id: string;
  name: string;
  nat: string;
  born: number;
  peak: number;
  peakAge: number;
  consistency: number;
  wet: number;
  quali: number;
  generated: boolean;
  form: number;
  contract: number;
  retired: boolean;
};

export type TeamState = {
  id: string;
  name: string;
  nat: string;
  color: string;
  engine: string;
  engineName: string;
  works: boolean;
  pace: number;
  rel: number;
  budget: number;
  generated: boolean;
  drivers: string[];
  streakBottom: number;
};

export type RaceSlot = {
  circuitId: string;
  gp: string;
  sprint: boolean;
};

export type ClassifiedRow = {
  driverId: string;
  teamId: string;
  grid: number;
  position: number | null;
  classified: boolean;
  laps: number;
  gap: string;
  status: string;
  points: number;
  fastestLap: boolean;
  pole: boolean;
};

export type RaceOutcome = {
  round: number;
  gp: string;
  circuitId: string;
  circuit: string;
  country: string;
  weather: "Seco" | "Húmedo" | "Lluvia";
  sprint: boolean;
  laps: number;
  safetyCar: boolean;
  sprintRows?: ClassifiedRow[];
  rows: ClassifiedRow[];
  headline: string;
  poleId: string;
  winnerId: string | null;
  fastestId: string | null;
};

export type SeasonDraft = {
  year: number;
  rules: RuleSet;
  teams: TeamState[];
  drivers: DriverState[];
  races: RaceSlot[];
  changelog: string[];
};

export type SimulatedSeason = SeasonDraft & {
  results: RaceOutcome[];
  seed: number;
};

export type Campaign = {
  seed: number;
  startYear: number;
  options: Options;
  nonce: number;
  pool: DriverState[];
  retired: string[];
  pending: SeasonDraft | null;
  seasons: SimulatedSeason[];
};
