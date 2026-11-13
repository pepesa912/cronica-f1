import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  CalendarDays,
  Flag,
  Gauge,
  History,
  Play,
  RotateCcw,
  Settings2,
  ShieldCheck,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { FIRST_YEAR, LAST_HISTORY, SEASONS } from "@/lib/f1/seasons";
import { useCronica, DEFAULT_OPTIONS } from "@/lib/f1/store";
import { constructorStandings, driverStandings } from "@/lib/f1/simulate";
import type { Options, SimulatedSeason } from "@/lib/f1/types";

const YEARS = Array.from({ length: LAST_HISTORY - FIRST_YEAR + 1 }, (_, i) => LAST_HISTORY - i)
  .filter((year) => Boolean(SEASONS[year]));

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-white/10 bg-[#1b1a18] ${className}`}>{children}</section>;
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#a59b8e]">{children}</p>;
}

function Stat({ label, value, icon: Icon }: { label: string; value: string | number; icon: typeof Trophy }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/[0.025] p-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#e10600]/12 text-[#ff514b]"><Icon size={17} /></span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.14em] text-[#8e867b]">{label}</p>
        <p className="truncate text-lg font-semibold text-[#f4efe6]">{value}</p>
      </div>
    </div>
  );
}

function StandingTable({ season, constructors = false }: { season: SimulatedSeason; constructors?: boolean }) {
  const rows = constructors ? constructorStandings(season) ?? [] : driverStandings(season);
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[490px] text-left text-sm">
        <thead className="border-b border-white/10 text-[10px] uppercase tracking-[0.14em] text-[#91887d]">
          <tr>
            <th className="px-3 py-3 font-semibold">Pos.</th>
            <th className="px-3 py-3 font-semibold">{constructors ? "Equipo" : "Piloto"}</th>
            <th className="px-3 py-3 text-center font-semibold">Victorias</th>
            <th className="px-3 py-3 text-center font-semibold">Podios</th>
            <th className="px-3 py-3 text-right font-semibold">Puntos</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.025]">
              <td className="w-12 px-3 py-3 font-mono text-[#958b7f]">{String(index + 1).padStart(2, "0")}</td>
              <td className="px-3 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="h-7 w-1 rounded-full" style={{ backgroundColor: row.color }} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#f3ede3]">{row.name}</p>
                    <p className="truncate text-xs text-[#8e867b]">{constructors ? row.teamName : row.teamName}</p>
                  </div>
                </div>
              </td>
              <td className="px-3 py-3 text-center tabular-nums text-[#c2b8ab]">{row.wins}</td>
              <td className="px-3 py-3 text-center tabular-nums text-[#c2b8ab]">{row.podiums}</td>
              <td className="px-3 py-3 text-right font-mono font-bold tabular-nums text-white">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CronicaApp() {
  const ready = useCronica((state) => state.ready);
  const campaign = useCronica((state) => state.campaign);
  const hydrate = useCronica((state) => state.hydrate);
  const start = useCronica((state) => state.start);
  const simulatePending = useCronica((state) => state.simulatePending);
  const advance = useCronica((state) => state.advance);
  const reroll = useCronica((state) => state.reroll);
  const abandon = useCronica((state) => state.abandon);

  const [year, setYear] = useState(LAST_HISTORY);
  const [options, setOptions] = useState<Options>(DEFAULT_OPTIONS);
  const [seed, setSeed] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => hydrate(), [hydrate]);

  const seasons = campaign?.seasons ?? [];
  const latest = seasons[seasons.length - 1] ?? null;
  const pending = campaign?.pending ?? null;
  const activeSeason = useMemo(
    () => seasons.find((item) => item.year === (selectedYear ?? latest?.year)) ?? latest,
    [seasons, selectedYear, latest],
  );
  const standings = useMemo(() => activeSeason ? driverStandings(activeSeason) : [], [activeSeason]);
  const constructors = useMemo(() => activeSeason ? constructorStandings(activeSeason) : null, [activeSeason]);
  const winner = standings[0];

  if (!ready) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#12110e] text-[#f4efe6]">
        <div className="text-center"><div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-[#e10600]" /><Eyebrow>CRÓNICA · ARCHIVO HISTÓRICO</Eyebrow><p className="mt-2 text-sm text-[#a59b8e]">Cargando tu temporada…</p></div>
      </main>
    );
  }

  const updateOption = <K extends keyof Options>(key: K, value: Options[K]) => {
    setOptions((current) => ({ ...current, [key]: value }));
  };

  return (
    <main className="min-h-screen bg-[#12110e] text-[#f4efe6]">
      <header className="border-b border-white/10 bg-[#171613]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-lg bg-[#e10600] text-white"><Flag size={21} fill="currentColor" /></div>
            <div><p className="font-display text-2xl leading-none tracking-wide">CRÓNICA</p><p className="mt-1 text-[9px] uppercase tracking-[0.24em] text-[#8e867b]">Simulador histórico de Fórmula 1</p></div>
          </div>
          <div className="hidden items-center gap-5 text-[10px] uppercase tracking-[0.15em] text-[#a59b8e] sm:flex"><span>1950—2026</span><span className="h-1 w-1 rounded-full bg-[#e10600]"/><span>Tu historia, tus resultados</span></div>
          {campaign && <button onClick={() => setConfirmReset(true)} className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-[#b9afa2] transition hover:border-[#e10600]/60 hover:text-white"><RotateCcw size={14}/><span className="hidden sm:inline">Nueva crónica</span></button>}
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {!campaign ? (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:gap-10">
            <div className="flex flex-col justify-center py-4 lg:py-12">
              <Eyebrow>Una temporada puede cambiarlo todo</Eyebrow>
              <h1 className="mt-4 max-w-2xl font-display text-5xl leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">Reescribe la<br/><span className="text-[#e10600]">historia</span> de la F1.</h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-[#b7aea2]">Desde los primeros campeonatos de 1950 hasta la nueva era de 2026. Elige un punto de partida, simula cada carrera y descubre cómo habría sido tu propia línea temporal del automovilismo.</p>
              <div className="mt-8 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-3">
                <Stat label="Temporadas" value="77" icon={CalendarDays}/>
                <Stat label="Equipos históricos" value="60+" icon={Users}/>
                <Stat label="Simulación" value="Carrera a carrera" icon={Gauge}/>
              </div>
            </div>
            <Panel className="p-5 sm:p-7">
              <div className="flex items-start justify-between gap-3"><div><Eyebrow>Comenzar una crónica</Eyebrow><h2 className="mt-2 font-display text-3xl">Elige tu temporada</h2></div><span className="rounded-md border border-[#e10600]/30 bg-[#e10600]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#ff716b]">Nueva partida</span></div>
              <label className="mt-7 block text-xs font-semibold uppercase tracking-[0.13em] text-[#a59b8e]" htmlFor="start-year">Año de inicio</label>
              <div className="mt-2 flex gap-2">
                <select id="start-year" value={year} onChange={(event) => setYear(Number(event.target.value))} className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#12110e] px-4 py-3 text-lg font-semibold text-white outline-none focus:border-[#e10600]">
                  {YEARS.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                <button onClick={() => setShowSettings((value) => !value)} aria-expanded={showSettings} className={`grid w-12 place-items-center rounded-lg border transition ${showSettings ? "border-[#e10600] bg-[#e10600]/10 text-[#ff716b]" : "border-white/10 text-[#a59b8e] hover:text-white"}`}><Settings2 size={18}/></button>
              </div>
              {showSettings && <div className="mt-4 space-y-3 rounded-lg border border-white/10 bg-black/15 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#91887d]">Reglas de la crónica</p>
                <OptionSelect label="Reglamentos" value={options.regs} values={[["historico", "Históricos"], ["alternativo", "Alternativos"]]} onChange={(value) => updateOption("regs", value as Options["regs"])}/>
                <OptionSelect label="Equipos" value={options.teams} values={[["historico", "Históricos"], ["mercado", "Mercado dinámico"]]} onChange={(value) => updateOption("teams", value as Options["teams"])}/>
                <OptionSelect label="Pilotos" value={options.drivers} values={[["historico", "Históricos"], ["academia", "Academia y jóvenes"]]} onChange={(value) => updateOption("drivers", value as Options["drivers"])}/>
                <OptionSelect label="Calendario" value={options.circuits} values={[["real", "Circuitos reales"], ["vivo", "Calendario vivo"]]} onChange={(value) => updateOption("circuits", value as Options["circuits"])}/>
              </div>}
              <label className="mt-5 block text-xs font-semibold uppercase tracking-[0.13em] text-[#a59b8e]" htmlFor="seed">Semilla (opcional)</label>
              <input id="seed" value={seed} onChange={(event) => setSeed(event.target.value)} placeholder="Una palabra o número para fijar resultados" className="mt-2 w-full rounded-lg border border-white/10 bg-[#12110e] px-4 py-3 text-sm text-white outline-none placeholder:text-[#625c54] focus:border-[#e10600]" />
              <button onClick={() => { setSelectedYear(null); start(year, options, seed); }} className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#e10600] px-5 py-4 text-sm font-bold uppercase tracking-[0.13em] text-white transition hover:bg-[#c90000]"><Play size={16} fill="currentColor"/> Crear crónica <ArrowRight size={16}/></button>
              <p className="mt-4 text-center text-[11px] leading-5 text-[#7f776d]">Tu partida se guarda automáticamente en este navegador. No necesitas crear una cuenta.</p>
            </Panel>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div><Eyebrow>Tu línea temporal · Inicio {campaign.startYear}</Eyebrow><h1 className="mt-2 font-display text-4xl sm:text-5xl">Temporada {pending?.year ?? latest?.year ?? campaign.startYear}</h1><p className="mt-2 text-sm text-[#a59b8e]">Semilla {campaign.seed} · {campaign.options.regs === "historico" ? "Reglamentos históricos" : "Reglamentos alternativos"}</p></div>
              <div className="flex flex-wrap gap-2"><button onClick={() => setShowSettings((value) => !value)} className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-[#b9afa2] hover:text-white"><Settings2 size={14}/> Opciones</button></div>
            </div>
            {showSettings && <Panel className="grid gap-3 p-4 sm:grid-cols-2"><OptionSelect label="Reglamentos" value={campaign.options.regs} values={[["historico", "Históricos"], ["alternativo", "Alternativos"]]} onChange={(value) => useCronica.getState().setOptions({ ...campaign.options, regs: value as Options["regs"] })}/><OptionSelect label="Equipos" value={campaign.options.teams} values={[["historico", "Históricos"], ["mercado", "Mercado dinámico"]]} onChange={(value) => useCronica.getState().setOptions({ ...campaign.options, teams: value as Options["teams"] })}/></Panel>}
            {pending ? (
              <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                <Panel className="overflow-hidden">
                  <div className="border-b border-white/10 p-5 sm:p-6"><Eyebrow>Parrilla y calendario</Eyebrow><div className="mt-2 flex flex-wrap items-end justify-between gap-3"><div><h2 className="font-display text-3xl">{pending.year}</h2><p className="mt-1 text-sm text-[#a59b8e]">{pending.rules.name} · {pending.teams.length} equipos · {pending.drivers.length} pilotos · {pending.races.length} carreras</p></div><span className="rounded-md bg-[#d6ad5d]/10 px-3 py-1.5 text-xs font-semibold text-[#e5c47e]">Pendiente de simular</span></div></div>
                  <div className="grid gap-0 md:grid-cols-2">
                    <div className="p-5"><Eyebrow>Equipos participantes</Eyebrow><div className="mt-4 space-y-3">{pending.teams.map((team) => <div key={team.id} className="flex items-center gap-3"><span className="h-8 w-1 rounded-full" style={{ backgroundColor: team.color }}/><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{team.name}</p><p className="truncate text-xs text-[#8e867b]">{team.engineName} · ritmo {team.pace}</p></div><span className="font-mono text-xs text-[#a59b8e]">{team.drivers.length} P</span></div>)}</div></div>
                    <div className="border-t border-white/10 p-5 md:border-l md:border-t-0"><Eyebrow>Calendario</Eyebrow><div className="mt-4 grid grid-cols-2 gap-2">{pending.races.map((race, index) => <div key={`${race.circuitId}-${index}`} className="rounded-md bg-white/[0.035] px-3 py-2"><p className="text-[10px] text-[#837b70]">R{String(index + 1).padStart(2, "0")}{race.sprint ? " · SPRINT" : ""}</p><p className="mt-0.5 truncate text-xs font-semibold">{race.gp}</p></div>)}</div></div>
                  </div>
                  <div className="border-t border-white/10 bg-black/15 p-5 sm:p-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><Eyebrow>Todo listo</Eyebrow><p className="mt-1 text-sm text-[#b7aea2]">La simulación es determinista: la misma semilla y temporada producen el mismo resultado.</p></div><button onClick={simulatePending} className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#e10600] px-5 py-3 text-sm font-bold uppercase tracking-wider text-white hover:bg-[#c90000]"><Play size={15} fill="currentColor"/> Simular temporada</button></div></div>
                </Panel>
                <div className="space-y-4"><Panel className="p-5"><Eyebrow>Reglamento técnico</Eyebrow><h3 className="mt-2 font-display text-2xl">{pending.rules.name}</h3><p className="mt-3 text-sm leading-6 text-[#b7aea2]">{pending.rules.formula}</p><div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-xs text-[#a59b8e]"><p className="flex justify-between gap-3"><span>Neumáticos</span><strong className="text-white">{pending.rules.tyres}</strong></p><p className="flex justify-between gap-3"><span>Repostajes</span><strong className="text-white">{pending.rules.refuel ? "Permitidos" : "Prohibidos"}</strong></p><p className="flex justify-between gap-3"><span>Safety Car</span><strong className="text-white">{pending.rules.safetyCar ? "Sí" : "No"}</strong></p></div></Panel><Panel className="p-5"><Eyebrow>Notas de temporada</Eyebrow><p className="mt-3 text-sm leading-6 text-[#b7aea2]">{pending.rules.note}</p></Panel></div>
              </div>
            ) : activeSeason ? (
              <div className="space-y-6">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Campeón del mundo" value={winner?.name ?? "—"} icon={Trophy}/><Stat label="Equipo campeón" value={constructors?.[0]?.name ?? "—"} icon={ShieldCheck}/><Stat label="Grandes premios" value={activeSeason.results.length} icon={Flag}/><Stat label="Pilotos clasificados" value={standings.length} icon={Users}/></div>
                <Panel className="overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5"><div><Eyebrow>Resumen de temporada</Eyebrow><h2 className="mt-1 font-display text-3xl">{activeSeason.year} · Resultados</h2></div><div className="flex flex-wrap items-center gap-2">{seasons.length > 1 && <select aria-label="Consultar temporada" value={activeSeason.year} onChange={(event) => setSelectedYear(Number(event.target.value))} className="rounded-md border border-white/10 bg-[#12110e] px-3 py-2 text-xs text-white">{seasons.slice().reverse().map((item) => <option key={item.year} value={item.year}>{item.year}</option>)}</select>}<button onClick={() => reroll(activeSeason.year)} className="flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-xs text-[#b9afa2] hover:text-white"><RotateCcw size={13}/> Repetir año</button></div></div>
                  <div className="grid gap-5 p-5 lg:grid-cols-[1fr_280px]">
                    <div><Eyebrow>Clasificación de pilotos</Eyebrow><div className="mt-3"><StandingTable season={activeSeason}/></div></div>
                    <div className="space-y-4"><div className="rounded-lg border border-[#e10600]/25 bg-[#e10600]/[0.07] p-4"><Eyebrow>El campeón</Eyebrow><p className="mt-2 font-display text-3xl">{winner?.name ?? "Sin campeón"}</p><p className="mt-1 text-sm text-[#c0b6a9]">{winner?.teamName ?? ""}</p><div className="mt-4 flex items-end justify-between"><span className="text-xs text-[#a59b8e]">Puntos</span><span className="font-mono text-3xl font-bold">{winner?.points ?? 0}</span></div></div><div className="rounded-lg border border-white/10 bg-white/[0.025] p-4"><Eyebrow>Historia de la temporada</Eyebrow><p className="mt-2 text-sm leading-6 text-[#c0b6a9]">{winner ? `${winner.name} consiguió ${winner.wins} ${winner.wins === 1 ? "victoria" : "victorias"} y ${winner.podiums} podios.` : "No hay resultados disponibles."}</p></div>{constructors && <div><Eyebrow>Constructores</Eyebrow><div className="mt-2"><StandingTable season={activeSeason} constructors/></div></div>}</div>
                  </div>
                  <div className="border-t border-white/10 p-5"><Eyebrow>Resultados por carrera</Eyebrow><div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{activeSeason.results.map((race) => { const driver = activeSeason.drivers.find((item) => item.id === race.winnerId); const teamId = race.rows.find((row) => row.driverId === race.winnerId)?.teamId; const team = activeSeason.teams.find((item) => item.id === teamId); return <div key={`${race.round}-${race.circuitId}`} className="flex gap-3 rounded-lg border border-white/8 bg-white/[0.02] p-3"><span className="grid size-9 shrink-0 place-items-center rounded-md bg-white/5 font-mono text-xs text-[#a59b8e]">{String(race.round).padStart(2, "0")}</span><div className="min-w-0 flex-1"><p className="truncate text-[10px] uppercase tracking-wider text-[#81796f]">{race.country} · {race.weather}</p><p className="truncate text-sm font-semibold">{race.gp}</p><p className="mt-1 truncate text-xs text-[#b7aea2]">{driver?.name ?? "Sin ganador"}{team ? ` · ${team.name}` : ""}</p></div><span className="mt-1 h-6 w-1 shrink-0 rounded-full" style={{ backgroundColor: team?.color ?? "#777" }}/></div>; })}</div></div>
                </Panel>
                {activeSeason.year === latest?.year && <div className="flex flex-col justify-between gap-4 rounded-xl border border-white/10 bg-[#1b1a18] p-5 sm:flex-row sm:items-center"><div><Eyebrow>El siguiente capítulo</Eyebrow><p className="mt-1 font-display text-2xl">La historia continúa</p><p className="mt-1 text-sm text-[#a59b8e]">Avanza a {activeSeason.year + 1} y deja que evolucione la parrilla.</p></div><button onClick={advance} disabled={activeSeason.year >= LAST_HISTORY + 48} className="flex items-center justify-center gap-2 rounded-lg bg-[#e10600] px-5 py-3 text-sm font-bold uppercase tracking-wider text-white hover:bg-[#c90000] disabled:cursor-not-allowed disabled:opacity-40">Siguiente temporada <ArrowRight size={16}/></button></div>}
                {seasons.length > 1 && <Panel className="p-4"><div className="flex items-center gap-2"><History size={15} className="text-[#e10600]"/><Eyebrow>Archivo de temporadas</Eyebrow></div><div className="mt-3 flex flex-wrap gap-2">{seasons.map((item) => <button key={item.year} onClick={() => setSelectedYear(item.year)} className={`rounded-md border px-3 py-2 text-xs font-semibold ${activeSeason.year === item.year ? "border-[#e10600] bg-[#e10600]/10 text-white" : "border-white/10 text-[#a59b8e] hover:text-white"}`}>{item.year}</button>)}</div></Panel>}
              </div>
            ) : null}
          </div>
        )}
      </div>

      <footer className="mt-10 border-t border-white/8"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-5 text-[10px] uppercase tracking-[0.13em] text-[#70695f] sm:px-6 lg:px-8"><span>CRÓNICA · Simulador histórico de F1</span><span>Los resultados simulados son una línea temporal alternativa</span></div></footer>

      {confirmReset && <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirmReset(false); }}><div role="dialog" aria-modal="true" aria-labelledby="reset-title" className="w-full max-w-md rounded-xl border border-white/10 bg-[#1b1a18] p-6 shadow-2xl"><div className="flex items-start justify-between"><div><Eyebrow>Reiniciar partida</Eyebrow><h2 id="reset-title" className="mt-2 font-display text-3xl">¿Nueva crónica?</h2></div><button aria-label="Cerrar" onClick={() => setConfirmReset(false)} className="rounded-md p-2 text-[#a59b8e] hover:bg-white/5 hover:text-white"><X size={18}/></button></div><p className="mt-4 text-sm leading-6 text-[#b7aea2]">Se borrará la partida actual guardada en este navegador y podrás empezar en otro año.</p><div className="mt-6 flex justify-end gap-2"><button onClick={() => setConfirmReset(false)} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-[#b9afa2]">Cancelar</button><button onClick={() => { abandon(); setConfirmReset(false); setSelectedYear(null); setShowSettings(false); }} className="rounded-lg bg-[#e10600] px-4 py-2 text-sm font-semibold text-white">Borrar partida</button></div></div></div>}
    </main>
  );
}

function OptionSelect({ label, value, values, onChange }: { label: string; value: string; values: string[][]; onChange: (value: string) => void }) {
  return <label className="flex flex-col gap-1.5"><span className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#a59b8e]">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-md border border-white/10 bg-[#12110e] px-3 py-2 text-xs text-white outline-none focus:border-[#e10600]">{values.map(([key, text]) => <option key={key} value={key}>{text}</option>)}</select></label>;
}
