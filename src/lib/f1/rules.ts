import type { DropRule, RuleSet } from "./types";

function dropRule(year: number): DropRule {
  if (year >= 1991) return { mode: "all" };
  if (year >= 1981) return { mode: "best", n: 11 };
  const halves: Record<number, [number, number]> = {
    1967: [5, 4],
    1968: [5, 5],
    1969: [5, 4],
    1970: [6, 5],
    1971: [5, 4],
    1972: [5, 5],
    1973: [7, 6],
    1974: [7, 6],
    1975: [7, 6],
    1976: [7, 7],
    1977: [8, 7],
    1978: [7, 7],
    1979: [4, 4],
    1980: [5, 5],
  };
  if (halves[year]) return { mode: "halves", first: halves[year][0], second: halves[year][1] };
  if (year <= 1953) return { mode: "best", n: 4 };
  if (year <= 1957 || year === 1959 || year === 1961 || year === 1962 || year === 1966) {
    return { mode: "best", n: 5 };
  }
  return { mode: "best", n: 6 };
}

function pointsFor(year: number): number[] {
  if (year <= 1959) return [8, 6, 4, 3, 2];
  if (year === 1960) return [8, 6, 4, 3, 2, 1];
  if (year <= 1990) return [9, 6, 4, 3, 2, 1];
  if (year <= 2002) return [10, 6, 4, 3, 2, 1];
  if (year <= 2009) return [10, 8, 6, 5, 4, 3, 2, 1];
  return [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
}

function eraCopy(year: number): Pick<RuleSet, "name" | "formula" | "tyres" | "note"> {
  const indy =
    year <= 1960
      ? " Las 500 Millas de Indianápolis puntuaban en el mundial, pero esta crónica no las incluye: se corrían con otro reglamento y otro pelotón."
      : "";
  if (year <= 1951) {
    return {
      name: "Alfetta y compresor",
      formula: "1.5 L sobrealimentado o 4.5 L atmosférico",
      tyres: "Pirelli, Englebert, Dunlop",
      note: "Alfa Romeo 158/159 domina el inicio del mundial. Puntúan los cinco primeros y la vuelta rápida reparte un punto." + indy,
    };
  }
  if (year <= 1953) {
    return {
      name: "Temporadas de Fórmula 2",
      formula: "2.0 L atmosférico",
      tyres: "Pirelli, Englebert, Dunlop",
      note: "El mundial se corre con coches de Fórmula 2. Ferrari y Ascari parten como medida de todas las cosas." + indy,
    };
  }
  if (year <= 1960) {
    return {
      name: "2.5 litros y motor delantero",
      formula: "2.5 L atmosférico",
      tyres: "Pirelli, Englebert, Dunlop, Continental",
      note: "Vuelven los 2.5 litros. Mercedes, Maserati, Ferrari, Vanwall y, al final, Cooper con motor trasero cambian el oficio." + indy,
    };
  }
  if (year <= 1965) {
    return {
      name: "1.5 litros",
      formula: "1.5 L atmosférico",
      tyres: "Dunlop",
      note: "Motores pequeños y chasis cada vez más ligeros. Lotus, BRM, Ferrari y Brabham se reparten la década corta.",
    };
  }
  if (year <= 1976) {
    return {
      name: "3 litros y el DFV",
      formula: "3.0 L atmosférico",
      tyres: "Firestone, Goodyear",
      note: "El Cosworth DFV pone un motor de campeonato al alcance de muchos. Tyrrell prueba las seis ruedas en 1976. El campeonato de constructores ya existe, y hasta 1978 solo puntúa el mejor coche.",
    };
  }
  if (year <= 1982) {
    return {
      name: "Efecto suelo",
      formula: "3.0 L atmosférico, primeros turbo",
      tyres: "Goodyear, Michelin",
      note: "El efecto suelo pega el coche al asfalto. Renault ya sopla con turbo. En 1979 los dos coches de una escudería empiezan a sumar.",
    };
  }
  if (year <= 1988) {
    return {
      name: "Era turbo",
      formula: "1.5 L turbo, tope de presión en baja",
      tyres: "Goodyear, Pirelli, Michelin",
      note: "BMW, Honda, TAG-Porsche y Ferrari turbo. La potencia manda y la fiabilidad también. El repostaje entra y sale según el año.",
    };
  }
  if (year <= 1993) {
    return {
      name: "Atmosféricos de 3.5",
      formula: "3.5 L atmosférico",
      tyres: "Goodyear, Pirelli",
      note: "Se apagan los turbo. Williams-Renault y la electrónica activa llevan la ventaja hasta que la FIA las prohíbe.",
    };
  }
  if (year <= 1995) {
    return {
      name: "Tras Imola",
      formula: "3.5 L y luego 3.0 L",
      tyres: "Goodyear",
      note: "Después de 1994 el coche pierde ayudas, el repostaje vuelve y la seguridad cambia el fin de semana. Benetton y Williams parten delante.",
    };
  }
  if (year <= 2005) {
    return {
      name: "V10",
      formula: "3.0 L V10",
      tyres: "Bridgestone, Michelin",
      note: "Guerra de neumáticos y repostaje. Ferrari cierra un ciclo y Renault y McLaren lo reabren.",
    };
  }
  if (year <= 2008) {
    return {
      name: "V8 congelado",
      formula: "2.4 L V8",
      tyres: "Bridgestone, Michelin",
      note: "Motores V8 con desarrollo casi congelado. Gana quien entiende la goma y el domingo.",
    };
  }
  if (year <= 2013) {
    return {
      name: "Doble difusor y soplado",
      formula: "2.4 L V8",
      tyres: "Bridgestone, luego Pirelli",
      note: "El reglamento de 2009 barre la parrilla. Después manda el difusor soplado de Red Bull hasta el híbrido.",
    };
  }
  if (year <= 2021) {
    return {
      name: "Híbrido",
      formula: "1.6 L V6 turbo híbrido",
      tyres: "Pirelli",
      note: "La unidad de potencia híbrida parte en dos a la parrilla. El DRS abre adelantamientos. Desde 2019 hay punto por vuelta rápida entre los diez primeros, y en 2021 llegan los sprints.",
    };
  }
  if (year <= 2025) {
    return {
      name: "Efecto suelo, otra vez",
      formula: "1.6 L V6 turbo híbrido",
      tyres: "Pirelli",
      note: "Coches con efecto suelo, menos estela sucia y sin punto por vuelta rápida desde 2025. El sprint, cuando se corre, reparte 8-7-6-5-4-3-2-1.",
    };
  }
  return {
    name: "Nueva unidad de potencia",
    formula: "V6 turbo y eléctrico casi a la par, sin MGU-H",
    tyres: "Pirelli",
    note: "Reglamento 2026: combustible sostenible, aerodinámica activa en lugar del DRS y coches más cortos. Once equipos. Cadillac debuta. Audi releva a Sauber. Motores de Mercedes, Ferrari, Red Bull Ford, Honda y Audi.",
  };
}

const RESETS = new Set([1952, 1961, 1966, 1989, 1994, 2009, 2014, 2022, 2026]);

export function historicalRules(year: number): RuleSet {
  const copy = eraCopy(year);
  const refuel = year === 1982 || year === 1983 || (year >= 1994 && year <= 2009);
  let strategy = 0.3;
  if (year >= 2022) strategy = 0.7;
  else if (year >= 2012) strategy = 0.78;
  else if (refuel) strategy = 0.84;
  else if (year >= 1998) strategy = 0.58;
  else if (year >= 1970) strategy = 0.4;

  let dnf = 1;
  if (year <= 1959) dnf = 1.55;
  else if (year <= 1969) dnf = 1.35;
  else if (year <= 1977) dnf = 1.18;
  else if (year <= 1982) dnf = 1.12;
  else if (year <= 1988) dnf = 1.38;
  else if (year <= 1993) dnf = 1.02;
  else if (year <= 1999) dnf = 0.92;
  else if (year <= 2006) dnf = 0.78;
  else if (year <= 2013) dnf = 0.6;
  else if (year <= 2021) dnf = 0.48;
  else if (year <= 2025) dnf = 0.4;
  else dnf = 0.72;

  let overtakeAid = 0.22;
  if (year <= 1960) overtakeAid = 0.2;
  else if (year <= 1977) overtakeAid = 0.3;
  else if (year <= 1982) overtakeAid = 0.16;
  else if (year <= 2010) overtakeAid = 0.34;
  else if (year <= 2021) overtakeAid = 0.55;
  else if (year <= 2025) overtakeAid = 0.48;
  else overtakeAid = 0.58;

  let avgKmh = 210;
  if (year < 1955) avgKmh = 168;
  else if (year < 1961) avgKmh = 180;
  else if (year < 1966) avgKmh = 190;
  else if (year < 1978) avgKmh = 200;
  else if (year < 1990) avgKmh = 208;
  else if (year < 2000) avgKmh = 214;
  else if (year < 2014) avgKmh = 222;
  else if (year < 2022) avgKmh = 230;
  else if (year < 2026) avgKmh = 234;
  else avgKmh = 228;

  const sprintPoints = year < 2021 ? null : year === 2021 ? [3, 2, 1] : [8, 7, 6, 5, 4, 3, 2, 1];

  return {
    year,
    ...copy,
    points: pointsFor(year),
    flPoint: year <= 1959 || (year >= 2019 && year <= 2024),
    flTop10Only: year >= 2019,
    sprintPoints,
    drop: dropRule(year),
    constructors: year >= 1958,
    bestCarOnly: year >= 1958 && year <= 1978,
    refuel,
    strategy,
    dnf,
    overtakeAid,
    avgKmh,
    safetyCar: year >= 1973,
    reset: RESETS.has(year),
  };
}

export function describeDrop(drop: DropRule, rounds: number): string {
  if (drop.mode === "all" || rounds === 0) return "Cuentan todas las carreras.";
  if (drop.mode === "best") {
    const n = Math.min(drop.n, rounds);
    if (n >= rounds) return "Cuentan todas las carreras.";
    return `Cuentan los mejores ${n} resultados de ${rounds}.`;
  }
  return `El año se parte en dos mitades: cuentan los mejores ${drop.first} de la primera y ${drop.second} de la segunda.`;
}

export function pointsLabel(points: number[]): string {
  return points.map((p, i) => `${i + 1}.º ${p}`).join(" · ");
}
