import { useEffect, useMemo, useState } from "react";
import { CIRCUITS, raceTitle } from "@/lib/f1/circuits";
import { materialize } from "@/lib/f1/grid";
import { assignNumbers, chronicle, constructorStandings, driverStandings } from "@/lib/f1/simulate";
import { rated } from "@/lib/f1/people";
import { describeDrop, historicalRules, pointsLabel } from "@/lib/f1/rules";
import { FIRST_YEAR, LAST_HISTORY } from "@/lib/f1/seasons";
import { DEFAULT_OPTIONS, useCronica } from "@/lib/f1/store";
import type { ClassifiedRow, Options, SeasonDraft, SimulatedSeason } from "@/lib/f1/types";

const PRESETS: [number, string][] = [
  [1950, "El arranque"],
  [1967, "El DFV"],
  [1976, "Lauda y Hunt"],
  [1988, "McLaren-Honda"],
  [1994, "Tras Imola"],
  [2000, "Ferrari"],
  [2009, "Brawn"],
  [2014, "El híbrido"],
  [2021, "El duelo"],
  [2026, "Once equipos"],
];

type Tab = "pilotos" | "constructores" | "carreras" | "parrilla";

function optionLine(options: Options): string {
  return [
    options.regs === "historico" ? "Reglamento de archivo" : "Reglamento alternativo",
    options.teams === "historico" ? "Escuderías de archivo" : "Mercado de escuderías",
    options.drivers === "historico" ? "Pilotos de archivo" : "Academia",
    options.signings === "historico" ? "Fichajes de archivo" : "Fichajes simulados",
    options.retirements === "historico" ? "Retiros de archivo" : "Retiros simulados",
    options.circuits === "real" ? "Circuitos de archivo" : "Calendario vivo",
  ].join(" · ");
}

export function CronicaApp() {
  const ready = useCronica((state) => state.ready);
  const campaign = useCronica((state) => state.campaign);
  const hydrate = useCronica((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!ready) return <Splash />;
  if (!campaign) return <Cover />;
  return <Book />;
}

function Splash() {
  return (
    <main className="flex min-h-screen flex-col justify-end bg-bg px-6 py-16">
      <p className="text-sm uppercase tracking-widest text-muted">Anuario de Fórmula 1</p>
      <h1 className="font-display text-6xl leading-none">CRÓNICA</h1>
    </main>
  );
}

function Cover() {
  const start = useCronica((state) => state.start);
  const [year, setYear] = useState(2026);
  const [options, setOptions] = useState<Options>(DEFAULT_OPTIONS);
  const [seedText, setSeedText] = useState("");
  const draft = useMemo(() => materialize(year), [year]);
  const rules = historicalRules(year);
  const lead = [...draft.teams].sort((a, b) => b.pace - a.pace).slice(0, 4);

  function patch<K extends keyof Options>(key: K, value: Options[K]) {
    setOptions((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="border-b border-line px-4 py-4">
        <div className="mx-auto flex max-w-5xl items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-widest text-muted">Anuario de Fórmula 1</p>
            <h1 className="font-display text-4xl leading-none">CRÓNICA</h1>
          </div>
          <p className="text-sm text-muted">
            {FIRST_YEAR}–{LAST_HISTORY}
          </p>
        </div>
      </header>
      <main className="mx-auto grid max-w-5xl gap-8 px-4 py-8 lg:grid-cols-2">
        <section>
          <p className="text-sm uppercase tracking-widest text-muted">Año de partida</p>
          <p className="font-display text-6xl leading-none sm:text-8xl">{year}</p>
          <div className="mt-4 flex items-center gap-3">
            <button type="button" className="min-h-11 min-w-11 border border-line bg-surface px-3" onClick={() => setYear((value) => Math.max(FIRST_YEAR, value - 1))}>
              −
            </button>
            <input
              className="w-full accent-accent"
              type="range"
              min={FIRST_YEAR}
              max={LAST_HISTORY}
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
              aria-label="Año de partida"
            />
            <button type="button" className="min-h-11 min-w-11 border border-line bg-surface px-3" onClick={() => setYear((value) => Math.min(LAST_HISTORY, value + 1))}>
              +
            </button>
          </div>
          <h2 className="mt-6 font-display text-3xl leading-tight">{rules.name}</h2>
          <p className="mt-2 max-w-xl text-muted">{rules.note}</p>
          <p className="mt-4 text-sm uppercase tracking-widest text-muted">
            {draft.teams.length} escuderías · {draft.drivers.length} pilotos · {draft.races.length} carreras
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {lead.map((team) => (
              <li key={team.id} className="flex items-center gap-2 border border-line bg-surface px-3 py-2">
                <span className="h-4 w-1" style={{ background: team.color }} />
                {team.name}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-2">
            {PRESETS.map(([preset, label]) => {
              const on = preset === year;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setYear(preset)}
                  className={`min-h-11 border px-3 py-2 text-left ${on ? "border-fg bg-fg text-bg" : "border-line bg-surface text-fg"}`}
                >
                  <span className={`block text-sm ${on ? "text-bg" : "text-muted"}`}>{label}</span>
                  <span className="font-semibold">{preset}</span>
                </button>
              );
            })}
          </div>
        </section>
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="font-display text-3xl">Cómo sigue la crónica</h2>
            <p className="mt-2 text-muted">
              El primer año usa la parrilla, el calendario y el reglamento reales. Desde el invierno siguiente, cada interruptor puede seguir el archivo o inventar con criterio. Los resultados nunca se copian de la historia.
            </p>
          </div>
          <Toggle
            title="Reglamento"
            help="Puntos, descartes, repostaje, sprints y el paquete técnico."
            a="Histórico"
            b="Alternativo"
            on={options.regs === "historico"}
            pick={(archive) => patch("regs", archive ? "historico" : "alternativo")}
          />
          <Toggle
            title="Escuderías"
            help="Quién entra, quién cierra y con qué coche."
            a="Históricas"
            b="Mercado"
            on={options.teams === "historico"}
            pick={(archive) => patch("teams", archive ? "historico" : "mercado")}
          />
          <Toggle
            title="Pilotos"
            help="Los nombres de la parrilla: el archivo, o una academia que inventa debutantes."
            a="Históricos"
            b="Academia"
            on={options.drivers === "historico"}
            pick={(archive) => patch("drivers", archive ? "historico" : "academia")}
          />
          <Toggle
            title="Fichajes"
            help="De archivo: cada piloto va al equipo que le tocó, si ese equipo sigue. Simulados: deciden los contratos."
            a="De archivo"
            b="Simulados"
            on={options.signings === "historico"}
            pick={(archive) => patch("signings", archive ? "historico" : "simulado")}
          />
          <Toggle
            title="Retiros"
            help="De archivo: se van, vuelven o fallecen cuando ocurrió. Una muerte saca al piloto desde la temporada siguiente. Simulados: solo cuentan la edad y la forma."
            a="De archivo"
            b="Simulados"
            on={options.retirements === "historico"}
            pick={(archive) => patch("retirements", archive ? "historico" : "simulado")}
          />
          <Toggle
            title="Circuitos"
            help="El calendario publicado, o uno que conserva los clásicos y mueve el resto."
            a="Reales"
            b="Vivo"
            on={options.circuits === "real"}
            pick={(archive) => patch("circuits", archive ? "real" : "vivo")}
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" className="min-h-11 border border-line px-3" onClick={() => setOptions(DEFAULT_OPTIONS)}>
              Todo el archivo
            </button>
            <button
              type="button"
              className="min-h-11 border border-line px-3"
              onClick={() =>
                setOptions({
                  regs: "alternativo",
                  teams: "mercado",
                  drivers: "academia",
                  circuits: "vivo",
                  signings: "simulado",
                  retirements: "simulado",
                })
              }
            >
              Modo libre
            </button>
          </div>
          <label className="block text-sm text-muted">
            Semilla, por si hace falta repetir la misma suerte
            <input
              value={seedText}
              onChange={(event) => setSeedText(event.target.value)}
              placeholder="Vacío: una crónica nueva"
              className="mt-1 w-full border border-line bg-surface px-3 py-3 text-fg"
            />
          </label>
          <button type="button" className="min-h-11 bg-accent px-4 text-lg font-bold text-accent-ink" onClick={() => start(year, options, seedText)}>
            Comenzar en {year}
          </button>
        </section>
      </main>
    </div>
  );
}

function Toggle({
  title,
  help,
  a,
  b,
  on,
  pick,
}: {
  title: string;
  help: string;
  a: string;
  b: string;
  on: boolean;
  pick: (archive: boolean) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="mb-2 text-sm text-muted">{help}</p>
      <div className="grid grid-cols-2 overflow-hidden rounded-card border border-line">
        <button type="button" className={`min-h-11 px-3 ${on ? "bg-fg font-semibold text-bg" : "bg-surface text-muted"}`} onClick={() => pick(true)}>
          {a}
        </button>
        <button type="button" className={`min-h-11 px-3 ${!on ? "bg-fg font-semibold text-bg" : "bg-surface text-muted"}`} onClick={() => pick(false)}>
          {b}
        </button>
      </div>
    </div>
  );
}

function Book() {
  const campaign = useCronica((state) => state.campaign);
  const simulatePending = useCronica((state) => state.simulatePending);
  const advance = useCronica((state) => state.advance);
  const reroll = useCronica((state) => state.reroll);
  const abandon = useCronica((state) => state.abandon);
  const setOptions = useCronica((state) => state.setOptions);
  const [focus, setFocus] = useState<number | "pending" | null>(null);
  const [tab, setTab] = useState<Tab>("pilotos");
  const [round, setRound] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<null | "abandon" | "reroll">(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showMatrix, setShowMatrix] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const lastYear = campaign?.seasons.at(-1)?.year ?? campaign?.startYear ?? FIRST_YEAR;
  const [until, setUntil] = useState(lastYear + 3);

  if (!campaign) return null;

  const picked = typeof focus === "number" ? campaign.seasons.find((season) => season.year === focus) : undefined;
  const pending = !picked && campaign.pending && (focus === "pending" || focus === null) ? campaign.pending : null;
  const season = picked ?? (!campaign.pending && focus === null ? campaign.seasons.at(-1) : undefined);
  const viewYear = pending?.year ?? season?.year ?? lastYear;

  async function playUntil(target: number) {
    setBusy(true);
    setError("");
    try {
      for (let step = 0; step < 40; step++) {
        const live = useCronica.getState().campaign;
        if (!live) break;
        const done = live.seasons.at(-1)?.year ?? 0;
        if (!live.pending && done >= target) break;
        if (live.pending) {
          if (live.pending.year > target) break;
          const year = live.pending.year;
          useCronica.getState().simulatePending();
          setFocus(year);
        } else {
          useCronica.getState().advance();
          setFocus("pending");
        }
        await new Promise((resolve) => setTimeout(resolve, 16));
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo simular.");
    } finally {
      setBusy(false);
    }
  }

  function openRace(next: number) {
    setTab("carreras");
    setRound(next);
  }

  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="sticky top-0 z-10 border-b border-line bg-bg">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-sm uppercase tracking-widest text-muted">Crónica {campaign.seed}</p>
            <h1 className="font-display text-3xl leading-none">CRÓNICA</h1>
          </div>
          <label className="text-sm text-muted">
            Temporada
            <select
              className="ml-2 min-h-11 border border-line bg-bg px-3 text-fg"
              value={pending ? "pending" : String(season?.year ?? "")}
              onChange={(event) => {
                const value = event.target.value;
                setRound(null);
                setConfirm(null);
                setFocus(value === "pending" ? "pending" : Number(value));
              }}
            >
              {campaign.seasons.map((item) => (
                <option key={item.year} value={item.year}>
                  {item.year}
                </option>
              ))}
              {campaign.pending ? <option value="pending">{campaign.pending.year} · sin correr</option> : null}
            </select>
          </label>
        </div>
      </header>
      <main className="mx-auto flex min-w-0 max-w-5xl flex-col gap-6 px-4 py-6">
        <p className="text-sm text-muted">{optionLine(campaign.options)}</p>
        {viewYear > LAST_HISTORY ? (
          <p className="border border-line bg-surface px-4 py-3">
            Desde 2027 no hay archivo. Aunque los interruptores digan histórico, la parrilla sigue con las reglas de esta crónica.
          </p>
        ) : null}
        {pending ? (
          <DraftView draft={pending} />
        ) : season ? (
          <SeasonView
            season={season}
            tab={tab}
            setTab={setTab}
            round={round}
            setRound={setRound}
            showMatrix={showMatrix}
            setShowMatrix={setShowMatrix}
            openRace={openRace}
          />
        ) : (
          <p>No hay temporada para mostrar.</p>
        )}

        <section className="flex flex-col gap-3 border-t border-line pt-4">
          {campaign.pending ? (
            <button
              type="button"
              disabled={busy}
              className="min-h-11 bg-accent px-4 text-lg font-bold text-accent-ink disabled:opacity-40"
              onClick={() => {
                const year = campaign.pending?.year;
                setBusy(true);
                setError("");
                window.setTimeout(() => {
                  try {
                    simulatePending();
                    if (year) setFocus(year);
                    setTab("pilotos");
                    setRound(null);
                  } catch (caught) {
                    setError(caught instanceof Error ? caught.message : "No se pudo simular.");
                  } finally {
                    setBusy(false);
                  }
                }, 30);
              }}
            >
              {busy ? "Simulando…" : `Simular las ${campaign.pending.races.length} carreras de ${campaign.pending.year}`}
            </button>
          ) : (
            <button
              type="button"
              disabled={busy}
              className="min-h-11 bg-accent px-4 text-lg font-bold text-accent-ink disabled:opacity-40"
              onClick={() => {
                setBusy(true);
                setError("");
                window.setTimeout(() => {
                  try {
                    advance();
                    setFocus("pending");
                    setRound(null);
                  } catch (caught) {
                    setError(caught instanceof Error ? caught.message : "No se pudo armar el año.");
                  } finally {
                    setBusy(false);
                  }
                }, 30);
              }}
            >
              {busy ? "Armando…" : `Armar ${lastYear + 1}`}
            </button>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm text-muted">
              Simular hasta
              <input
                type="number"
                className="ml-2 w-24 border border-line bg-surface px-3 py-2 text-fg"
                min={viewYear}
                max={viewYear + 40}
                value={until}
                onChange={(event) => setUntil(Number(event.target.value))}
              />
            </label>
            <button type="button" disabled={busy || until < viewYear} className="min-h-11 border border-line px-4 disabled:opacity-40" onClick={() => void playUntil(until)}>
              Correr los años
            </button>
          </div>
          {error ? <p className="border border-line bg-surface px-3 py-2">{error}</p> : null}
          <div className="flex flex-wrap gap-2">
            {season ? (
              <button type="button" className="min-h-11 border border-line px-4" onClick={() => setConfirm("reroll")}>
                Otra historia de {season.year}
              </button>
            ) : null}
            <button type="button" className="min-h-11 border border-line px-4" onClick={() => setShowNext((value) => !value)}>
              Interruptores
            </button>
            <button type="button" className="min-h-11 border border-line px-4" onClick={() => setConfirm("abandon")}>
              Nueva crónica
            </button>
          </div>
          {showNext ? (
            <OptionsEditor
              options={campaign.options}
              onChange={(options) => {
                setOptions(options);
              }}
            />
          ) : null}
          {confirm === "reroll" && season ? (
            <Confirm
              text={
                campaign.seasons.some((item) => item.year > season.year)
                  ? `Volver a correr ${season.year} borra las temporadas posteriores. La parrilla se mantiene; cambian los resultados.`
                  : `Se vuelve a simular ${season.year} con otra suerte. La parrilla no cambia.`
              }
              confirmLabel="Correr otra vez"
              onCancel={() => setConfirm(null)}
              onConfirm={() => {
                reroll(season.year);
                setFocus(season.year);
                setConfirm(null);
                setRound(null);
              }}
            />
          ) : null}
          {confirm === "abandon" ? (
            <Confirm
              text="Esta crónica se borra de este navegador. No se puede deshacer."
              confirmLabel="Borrar"
              onCancel={() => setConfirm(null)}
              onConfirm={() => {
                abandon();
                setConfirm(null);
              }}
            />
          ) : null}
        </section>
        <p className="text-sm text-muted">
          Los resultados son de esta crónica, no el archivo. Las alineaciones son las de inicio de temporada: no hay sustitutos a mitad de año. Las 500 Millas de Indianápolis, aunque puntuaron hasta 1960, no se corren.
        </p>
      </main>
    </div>
  );
}

function Confirm({
  text,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  text: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="border border-line bg-surface p-4">
      <p>{text}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="min-h-11 border border-line px-4" onClick={onCancel}>
          Cancelar
        </button>
        <button type="button" className="min-h-11 bg-accent px-4 font-bold text-accent-ink" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}

function OptionsEditor({ options, onChange }: { options: Options; onChange: (options: Options) => void }) {
  function patch<K extends keyof Options>(key: K, value: Options[K]) {
    onChange({ ...options, [key]: value });
  }
  return (
    <div className="grid gap-3 border border-line bg-surface p-4">
      <p className="text-sm text-muted">Valen para la próxima temporada que se arme, no para la que ya está en pista.</p>
      <MiniToggle label="Reglamento" a="Histórico" b="Alternativo" on={options.regs === "historico"} pick={(archive) => patch("regs", archive ? "historico" : "alternativo")} />
      <MiniToggle label="Escuderías" a="Históricas" b="Mercado" on={options.teams === "historico"} pick={(archive) => patch("teams", archive ? "historico" : "mercado")} />
      <MiniToggle label="Pilotos" a="Históricos" b="Academia" on={options.drivers === "historico"} pick={(archive) => patch("drivers", archive ? "historico" : "academia")} />
      <MiniToggle label="Fichajes" a="De archivo" b="Simulados" on={options.signings === "historico"} pick={(archive) => patch("signings", archive ? "historico" : "simulado")} />
      <MiniToggle label="Retiros" a="De archivo" b="Simulados" on={options.retirements === "historico"} pick={(archive) => patch("retirements", archive ? "historico" : "simulado")} />
      <MiniToggle label="Circuitos" a="Reales" b="Vivo" on={options.circuits === "real"} pick={(archive) => patch("circuits", archive ? "real" : "vivo")} />
    </div>
  );
}

function MiniToggle({
  label,
  a,
  b,
  on,
  pick,
}: {
  label: string;
  a: string;
  b: string;
  on: boolean;
  pick: (archive: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <span className="text-sm text-muted sm:w-28">{label}</span>
      <div className="grid flex-1 grid-cols-2 gap-2">
        <button type="button" className={`min-h-11 px-2 ${on ? "bg-fg font-semibold text-bg" : "border border-line"}`} onClick={() => pick(true)}>
          {a}
        </button>
        <button type="button" className={`min-h-11 px-2 ${!on ? "bg-fg font-semibold text-bg" : "border border-line"}`} onClick={() => pick(false)}>
          {b}
        </button>
      </div>
    </div>
  );
}

function DraftView({ draft }: { draft: SeasonDraft }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm uppercase tracking-widest text-muted">Por simular</p>
        <h2 className="font-display text-5xl leading-none">{draft.year}</h2>
        <p className="mt-3 max-w-2xl font-display text-xl text-muted">{draft.rules.note}</p>
      </div>
      <RulesCard draft={draft} />
      {draft.changelog.length ? (
        <ul className="list-disc space-y-1 pl-5 text-muted">
          {draft.changelog.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}
      <GridList year={draft.year} teams={draft.teams} drivers={draft.drivers} />
      <CalendarList races={draft.races} />
    </div>
  );
}

function RulesCard({ draft }: { draft: SeasonDraft }) {
  const rules = draft.rules;
  return (
    <div className="grid gap-4 border border-line bg-surface p-4 sm:grid-cols-2">
      <div>
        <p className="text-sm uppercase tracking-widest text-muted">Fórmula</p>
        <p>{rules.formula}</p>
      </div>
      <div>
        <p className="text-sm uppercase tracking-widest text-muted">Neumáticos</p>
        <p>{rules.tyres}</p>
      </div>
      <div className="sm:col-span-2">
        <p className="text-sm uppercase tracking-widest text-muted">Puntos</p>
        <p>{pointsLabel(rules.points)}</p>
        <p className="text-muted">{describeDrop(rules.drop, draft.races.length)}</p>
        {rules.flPoint ? <p className="text-muted">La vuelta rápida suma un punto{rules.flTop10Only ? " si se termina entre los diez" : ""}.</p> : null}
        {rules.bestCarOnly ? <p className="text-muted">En constructores solo suma el mejor coche de cada carrera.</p> : null}
        {!rules.constructors ? <p className="text-muted">Todavía no hay campeonato de constructores.</p> : null}
      </div>
    </div>
  );
}

function GridList({
  year,
  teams,
  drivers,
}: {
  year: number;
  teams: SeasonDraft["teams"];
  drivers: SeasonDraft["drivers"];
}) {
  const byId = new Map(drivers.map((driver) => [driver.id, driver]));
  return (
    <section>
      <h3 className="font-display text-2xl">Parrilla</h3>
      <p className="mb-3 text-sm text-muted">Alineación de inicio. El número es el ritmo del piloto este año, no un resultado.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {teams.map((team) => (
          <article key={team.id} className="flex overflow-hidden border border-line bg-surface">
            <div className="w-1 shrink-0" style={{ background: team.color }} />
            <div className="min-w-0 flex-1 p-3">
              <div className="flex items-baseline justify-between gap-3">
                <h4 className="truncate font-semibold">{team.name}</h4>
                <span className="shrink-0 text-sm text-muted">{team.engineName}</span>
              </div>
              <div className="mt-2 h-1.5 bg-surface-2">
                <div className="h-1.5 bg-fg" style={{ width: `${Math.max(8, Math.min(100, team.pace))}%` }} />
              </div>
              <p className="mt-1 text-sm text-muted">
                Ritmo {Math.round(team.pace)} · Fiabilidad {Math.round(team.rel * 100)}
              </p>
              <ul className="mt-2 space-y-1">
                {team.drivers.map((id) => {
                  const driver = byId.get(id);
                  if (!driver) return null;
                  const skill = rated(driver, year);
                  return (
                    <li key={id} className="flex items-baseline justify-between gap-3">
                      <span className="truncate">
                        {driver.name} <span className="text-muted">{driver.nat}</span>
                      </span>
                      <span className="tabular-nums text-muted">{Math.round(skill.race)}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CalendarList({ races }: { races: SeasonDraft["races"] }) {
  return (
    <section>
      <h3 className="font-display text-2xl">Calendario</h3>
      <ol className="mt-3 grid gap-2 sm:grid-cols-2">
        {races.map((race, index) => {
          const circuit = CIRCUITS[race.circuitId];
          return (
            <li key={`${race.circuitId}-${race.gp}-${index}`} className="flex items-baseline gap-3 border border-line px-3 py-2">
              <span className="w-6 tabular-nums text-muted">{index + 1}</span>
              <span className="min-w-0">
                <span className="block truncate">{raceTitle(race.gp)}</span>
                <span className="text-sm text-muted">
                  {circuit?.name ?? race.circuitId}
                  {circuit ? ` · ${circuit.country}` : ""}
                  {race.sprint ? " · Sprint" : ""}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function SeasonView({
  season,
  tab,
  setTab,
  round,
  setRound,
  showMatrix,
  setShowMatrix,
  openRace,
}: {
  season: SimulatedSeason;
  tab: Tab;
  setTab: (tab: Tab) => void;
  round: number | null;
  setRound: (round: number | null) => void;
  showMatrix: boolean;
  setShowMatrix: (value: boolean) => void;
  openRace: (round: number) => void;
}) {
  const drivers = useMemo(() => driverStandings(season), [season]);
  const makers = useMemo(() => constructorStandings(season), [season]);
  const numbers = useMemo(() => assignNumbers(season.drivers, season.teams), [season]);
  const champ = drivers[0];
  const maker = makers?.[0];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm uppercase tracking-widest text-muted">Campeón {season.year}</p>
        <h2 className="font-display text-5xl leading-none">{champ?.name ?? "Sin campeón"}</h2>
        {champ ? (
          <p className="mt-2 text-muted">
            {champ.teamName} · {champ.points} pts · {champ.wins} {champ.wins === 1 ? "victoria" : "victorias"}
          </p>
        ) : null}
        {maker ? (
          <p className="text-muted">
            Constructores: {maker.name}, {maker.points} pts
          </p>
        ) : null}
        <p className="mt-3 max-w-2xl font-display text-xl">{chronicle(season)}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["pilotos", "Pilotos"],
            ["constructores", "Constructores"],
            ["carreras", "Carreras"],
            ["parrilla", "Parrilla"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`min-h-11 border px-4 ${tab === id ? "border-fg bg-fg font-semibold text-bg" : "border-line"}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "pilotos" ? (
        <div className="flex flex-col gap-4">
          <StandingsTable rows={drivers} kind="driver" />
          <p className="text-sm text-muted">{describeDrop(season.rules.drop, season.results.length)}</p>
          <button type="button" className="min-h-11 self-start border border-line px-4" onClick={() => setShowMatrix(!showMatrix)}>
            {showMatrix ? "Ocultar carrera a carrera" : "Ver carrera a carrera"}
          </button>
          {showMatrix ? <Matrix rows={drivers} season={season} openRace={openRace} /> : null}
        </div>
      ) : null}
      {tab === "constructores" ? (
        makers ? (
          <div className="flex flex-col gap-3">
            <StandingsTable rows={makers} kind="team" />
            {season.rules.bestCarOnly ? <p className="text-sm text-muted">Solo puntúa el mejor coche de cada escudería.</p> : null}
            <p className="text-sm text-muted">{describeDrop(season.rules.drop, season.results.length)}</p>
          </div>
        ) : (
          <p className="border border-line bg-surface p-4">El campeonato de constructores empieza en 1958.</p>
        )
      ) : null}
      {tab === "carreras" ? <RaceBrowser season={season} numbers={numbers} round={round} setRound={setRound} /> : null}
      {tab === "parrilla" ? (
        <div className="flex flex-col gap-6">
          <RulesCard draft={season} />
          {season.changelog.length ? (
            <ul className="list-disc space-y-1 pl-5 text-muted">
              {season.changelog.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : null}
          <GridList year={season.year} teams={season.teams} drivers={season.drivers} />
        </div>
      ) : null}
    </div>
  );
}

function StandingsTable({
  rows,
  kind,
}: {
  rows: ReturnType<typeof driverStandings>;
  kind: "driver" | "team";
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="text-sm uppercase tracking-wide text-muted">
          <tr>
            <th className="py-2 pr-2">Pos</th>
            <th className="py-2 pr-2">{kind === "driver" ? "Piloto" : "Escudería"}</th>
            <th className="py-2 pr-2 text-right">Pts</th>
            <th className="hidden py-2 pr-2 text-right sm:table-cell">V</th>
            <th className="hidden py-2 pr-2 text-right sm:table-cell">Pod</th>
            <th className="hidden py-2 pr-2 text-right md:table-cell">Poles</th>
            <th className="hidden py-2 text-right md:table-cell">VR</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id} className="border-t border-line">
              <td className="py-2 pr-2 tabular-nums">{index + 1}</td>
              <td className="py-2 pr-2">
                <span className="flex items-start gap-2">
                  <span className="mt-1 h-4 w-1 shrink-0" style={{ background: row.color }} />
                  <span>
                    <span className="block font-semibold">{row.name}</span>
                    <span className="text-sm text-muted">{kind === "driver" ? row.teamName : row.teamName}</span>
                  </span>
                </span>
              </td>
              <td className="py-2 pr-2 text-right font-semibold tabular-nums" title={row.gross !== row.points ? `${row.gross} brutos` : undefined}>
                {row.points}
              </td>
              <td className="hidden py-2 pr-2 text-right tabular-nums sm:table-cell">{row.wins}</td>
              <td className="hidden py-2 pr-2 text-right tabular-nums sm:table-cell">{row.podiums}</td>
              <td className="hidden py-2 pr-2 text-right tabular-nums md:table-cell">{row.poles}</td>
              <td className="hidden py-2 text-right tabular-nums md:table-cell">{row.fastest}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Matrix({
  rows,
  season,
  openRace,
}: {
  rows: ReturnType<typeof driverStandings>;
  season: SimulatedSeason;
  openRace: (round: number) => void;
}) {
  return (
    <div className="overflow-x-auto border border-line">
      <table className="text-center text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 bg-surface px-2 py-2 text-left">Piloto</th>
            {season.results.map((race) => (
              <th key={race.round} className="px-1 py-2">
                <button type="button" className="min-h-11 min-w-11 px-1 text-muted" onClick={() => openRace(race.round)} title={raceTitle(race.gp)}>
                  {race.round}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-line">
              <th className="sticky left-0 bg-bg px-2 py-1 text-left font-medium">{row.name}</th>
              {row.rounds.map((score, index) => (
                <td key={season.results[index]?.round ?? index} className={`px-1 tabular-nums ${score.pos === 1 ? "bg-surface-2 font-bold" : ""} ${score.pole ? "underline decoration-accent" : ""}`}>
                  {score.pos ?? "R"}
                  {score.fl ? "*" : ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RaceBrowser({
  season,
  numbers,
  round,
  setRound,
}: {
  season: SimulatedSeason;
  numbers: Map<string, number>;
  round: number | null;
  setRound: (round: number | null) => void;
}) {
  const names = new Map(season.drivers.map((driver) => [driver.id, driver.name]));
  const teams = new Map(season.teams.map((team) => [team.id, team]));
  return (
    <div className="flex flex-col gap-2">
      {season.results.map((race) => {
        const open = round === race.round;
        const winner = race.winnerId ? names.get(race.winnerId) : null;
        return (
          <article key={race.round} className="border border-line bg-surface">
            <button type="button" className="flex min-h-11 w-full items-baseline gap-3 px-3 py-3 text-left" onClick={() => setRound(open ? null : race.round)}>
              <span className="w-8 tabular-nums text-muted">{race.round}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{raceTitle(race.gp)}</span>
                <span className="text-sm text-muted">
                  {race.circuit} · {race.country} · {race.weather}
                  {race.sprint ? " · Sprint" : ""}
                  {winner ? ` · ${winner}` : " · Sin ganador"}
                </span>
              </span>
            </button>
            {open ? (
              <div className="border-t border-line px-3 py-3">
                <p>{race.headline}</p>
                <p className="text-sm text-muted">
                  {race.laps} vueltas{race.safetyCar ? " · Coche de seguridad" : ""}
                </p>
                {race.sprintRows ? (
                  <div className="mt-4">
                    <h4 className="mb-2 font-semibold">Sprint</h4>
                    <ResultTable rows={race.sprintRows} names={names} teams={teams} numbers={numbers} />
                  </div>
                ) : null}
                <div className="mt-4">
                  <h4 className="mb-2 font-semibold">Carrera</h4>
                  <ResultTable rows={race.rows} names={names} teams={teams} numbers={numbers} />
                </div>
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

function ResultTable({
  rows,
  names,
  teams,
  numbers,
}: {
  rows: ClassifiedRow[];
  names: Map<string, string>;
  teams: Map<string, { name: string; color: string }>;
  numbers: Map<string, number>;
}) {
  const ordered = rows.slice().sort((a, b) => (a.position ?? 99) - (b.position ?? 99));
  return (
    <div className="overflow-x-auto">
      <table className="w-full whitespace-nowrap text-left">
        <thead className="text-sm uppercase tracking-wide text-muted">
          <tr>
            <th className="py-2 pr-3">Pos</th>
            <th className="py-2 pr-3">Nº</th>
            <th className="py-2 pr-3">Piloto</th>
            <th className="py-2 pr-3">Equipo</th>
            <th className="py-2 pr-3">Parrilla</th>
            <th className="py-2 pr-3">Vueltas</th>
            <th className="py-2 pr-3">Tiempo</th>
            <th className="py-2">Pts</th>
          </tr>
        </thead>
        <tbody>
          {ordered.map((row) => {
            const team = teams.get(row.teamId);
            return (
              <tr key={row.driverId} className="border-t border-line">
                <td className="py-2 pr-3 tabular-nums">{row.position ?? "Ret"}</td>
                <td className="py-2 pr-3 tabular-nums">{numbers.get(row.driverId) ?? "—"}</td>
                <td className={`py-2 pr-3 ${row.pole ? "font-semibold" : ""}`}>
                  {names.get(row.driverId) ?? row.driverId}
                  {row.fastestLap ? <span className="text-muted"> VR</span> : null}
                </td>
                <td className="py-2 pr-3">
                  <span className="mr-2 inline-block h-3 w-1 align-middle" style={{ background: team?.color ?? "transparent" }} />
                  {team?.name ?? row.teamId}
                </td>
                <td className="py-2 pr-3 tabular-nums">{row.grid}</td>
                <td className="py-2 pr-3 tabular-nums">{row.laps}</td>
                <td className="py-2 pr-3">{row.position ? row.gap : row.status}</td>
                <td className="py-2 tabular-nums">{row.points || ""}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
