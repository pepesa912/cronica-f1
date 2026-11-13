const FIRST: Record<string, string[]> = {
  GBR: ["Callum", "Elliot", "Finn", "Harvey", "Jude", "Kit", "Lewis", "Owen", "Rhys", "Theo"],
  ITA: ["Alessio", "Bruno", "Dario", "Enzo", "Fabio", "Luca", "Marco", "Nico", "Paolo", "Teo"],
  FRA: ["Adrien", "Baptiste", "Cedric", "Etienne", "Hugo", "Leo", "Mathis", "Noe", "Remi", "Sacha"],
  ESP: ["Alvaro", "Bruno", "Diego", "Hugo", "Iker", "Marc", "Nico", "Pablo", "Raul", "Unai"],
  GER: ["Anton", "Ben", "Erik", "Felix", "Jonas", "Lars", "Mats", "Niklas", "Otto", "Tim"],
  NED: ["Bram", "Daan", "Finn", "Joris", "Luuk", "Mees", "Noud", "Sem", "Thijs", "Wes"],
  BRA: ["Caio", "Diego", "Enzo", "Felipe", "Igor", "Joao", "Lucas", "Miguel", "Pedro", "Rafael"],
  ARG: ["Bautista", "Facundo", "Ignacio", "Lautaro", "Mateo", "Nicolas", "Santino", "Thiago", "Valentin", "Agustin"],
  AUS: ["Archie", "Callum", "Declan", "Harrison", "Jack", "Lachlan", "Noah", "Oscar", "Riley", "Tyler"],
  JPN: ["Haruto", "Kenji", "Minato", "Naoki", "Ren", "Sho", "Sota", "Takumi", "Yuki", "Riku"],
  USA: ["Cole", "Dylan", "Evan", "Grant", "Jake", "Logan", "Mason", "Nate", "Reid", "Shane"],
  MEX: ["Andres", "Diego", "Emiliano", "Gael", "Ivan", "Luis", "Mateo", "Pablo", "Sergio", "Tomas"],
  CAN: ["Aiden", "Cole", "Etienne", "Felix", "Hugo", "Liam", "Noah", "Owen", "Theo", "Zach"],
  MON: ["Andrea", "Charles", "Luca", "Marco", "Nico"],
  FIN: ["Aaro", "Eero", "Juho", "Mika", "Onni", "Sami", "Teemu", "Valtteri"],
  SWE: ["Albin", "Elias", "Isak", "Linus", "Nils", "Oscar", "Viktor"],
  DEN: ["Frederik", "Jonas", "Magnus", "Nikolaj", "Oliver", "Soren"],
  SUI: ["Andrin", "Leandro", "Nico", "Roman", "Yanis"],
  AUT: ["Fabian", "Jonas", "Lukas", "Moritz", "Paul"],
  BEL: ["Arthur", "Louis", "Mats", "Stan", "Wout"],
  CHN: ["Hao", "Jun", "Lei", "Wei", "Yang", "Zhou"],
  THA: ["Kitt", "Niran", "Preecha", "Somchai", "Than"],
  NZL: ["Beau", "Fletcher", "Hunter", "Jaxon", "Mitchell"],
  POL: ["Adam", "Bartek", "Kuba", "Maks", "Olek"],
  POR: ["Afonso", "Diogo", "Goncalo", "Miguel", "Tiago"],
  RUS: ["Artem", "Daniil", "Ilya", "Kirill", "Pavel"],
  COL: ["Andres", "Camilo", "Juan", "Mateo", "Santiago"],
  IND: ["Arjun", "Dev", "Kabir", "Rohan", "Vihaan"],
  INA: ["Aditya", "Bima", "Dimas", "Raka", "Satria"],
  MAS: ["Aiman", "Danial", "Hafiz", "Irfan", "Zikri"],
  HUN: ["Bence", "Dominik", "Levente", "Mate", "Noel"],
  VEN: ["Andres", "Carlos", "Diego", "Luis", "Miguel"],
  IRL: ["Cillian", "Conor", "Dylan", "Oisin", "Sean"],
  RSA: ["Dylan", "Jayden", "Keegan", "Liam", "Ruan"],
};

const LAST: Record<string, string[]> = {
  GBR: ["Adler", "Crowe", "Dalton", "Ellison", "Harrow", "Keene", "Lang", "Mercer", "Pike", "Rowe", "Shaw", "Voss"],
  ITA: ["Bellandi", "Costa", "Ferri", "Greco", "Lombardi", "Marini", "Neri", "Pace", "Riva", "Santini", "Vitali"],
  FRA: ["Bernard", "Chevalier", "Dubois", "Fournier", "Laurent", "Mercier", "Morel", "Petit", "Renard", "Simon"],
  ESP: ["Aguilar", "Cortes", "Delgado", "Ferrer", "Iglesias", "Navarro", "Ortega", "Romero", "Soler", "Vidal"],
  GER: ["Bauer", "Engel", "Fischer", "Hartmann", "Keller", "Lang", "Neumann", "Richter", "Schmitt", "Vogel"],
  NED: ["Bakker", "De Vries", "Jansen", "Kuiper", "Mulder", "Smit", "Visser", "Willems"],
  BRA: ["Almeida", "Cardoso", "Duarte", "Ferreira", "Machado", "Nogueira", "Ribeiro", "Teixeira"],
  ARG: ["Acosta", "Benitez", "Cabrera", "Dominguez", "Farias", "Ledesma", "Molina", "Pereyra"],
  AUS: ["Barrett", "Campbell", "Fraser", "Keating", "Lawson", "Murray", "Quinn", "Walker"],
  JPN: ["Arai", "Fujita", "Hayashi", "Kobayashi", "Mori", "Sato", "Takahashi", "Watanabe"],
  USA: ["Bennett", "Carter", "Dawson", "Ellis", "Foster", "Griffin", "Hayes", "Parker"],
  MEX: ["Castro", "Dominguez", "Espinoza", "Guerrero", "Herrera", "Navarro", "Rojas", "Vargas"],
  CAN: ["Bouchard", "Campbell", "Gagnon", "Macrae", "Pelletier", "Reid", "Tremblay"],
  MON: ["Bianchi", "Costa", "Durand", "Rossi", "Venturi"],
  FIN: ["Aalto", "Korhonen", "Laine", "Makinen", "Nieminen", "Virtanen"],
  SWE: ["Berg", "Dahl", "Ek", "Lind", "Nystrom", "Sandberg"],
  DEN: ["Holm", "Jensen", "Kristensen", "Larsen", "Moller"],
  SUI: ["Baumann", "Frei", "Keller", "Meier", "Schmid"],
  AUT: ["Gruber", "Hofer", "Mayer", "Steiner", "Wagner"],
  BEL: ["Claes", "Dubois", "Jacobs", "Peeters", "Willems"],
  CHN: ["Chen", "Huang", "Li", "Wang", "Zhang", "Zhao"],
  THA: ["Chai", "Kiet", "Prasert", "Sombat", "Thong"],
  NZL: ["Bennett", "Fraser", "Kelly", "Reid", "Walsh"],
  POL: ["Kowalski", "Nowak", "Wisniewski", "Zielinski"],
  POR: ["Almeida", "Costa", "Ferreira", "Santos", "Silva"],
  RUS: ["Ivanov", "Kuznetsov", "Orlov", "Sokolov", "Volkov"],
  COL: ["Castro", "Gomez", "Herrera", "Ramirez", "Torres"],
  IND: ["Iyer", "Mehta", "Nair", "Patel", "Sharma"],
  INA: ["Halim", "Putra", "Santoso", "Wijaya"],
  MAS: ["Azman", "Hakim", "Rahman", "Yusof"],
  HUN: ["Kovacs", "Nagy", "Szabo", "Toth"],
  VEN: ["Garcia", "Hernandez", "Morales", "Ramos"],
  IRL: ["Byrne", "Doyle", "Murphy", "Walsh"],
  RSA: ["Botha", "Du Plessis", "Nagel", "Venter"],
};

export const NATS = Object.keys(FIRST);

const TEAM_LEFT = ["Nord", "Alto", "Vega", "Lumen", "Orbis", "Helix", "Ferro", "Cima", "Ponte", "Bravia", "Solano", "Kestrel", "Atlas", "Marlow", "Sierra", "Argent", "Nube", "Río", "Astra", "Linea"];
const TEAM_RIGHT = ["Racing", "GP", "Corse", "Motor", "Works", "Engineering", "Squadra", "Compétition", "Autosport"];

export function pickNat(rng: { int: (n: number) => number }): string {
  return NATS[rng.int(NATS.length)];
}

export function personName(nat: string, rng: { int: (n: number) => number }, used: Set<string>): string {
  const firsts = FIRST[nat] ?? FIRST.GBR;
  const lasts = LAST[nat] ?? LAST.GBR;
  for (let i = 0; i < 24; i++) {
    const name = `${firsts[rng.int(firsts.length)]} ${lasts[rng.int(lasts.length)]}`;
    if (!used.has(name)) return name;
  }
  return `${firsts[rng.int(firsts.length)]} ${lasts[rng.int(lasts.length)]} ${rng.int(90) + 10}`;
}

export function teamName(rng: { int: (n: number) => number }): string {
  return `${TEAM_LEFT[rng.int(TEAM_LEFT.length)]} ${TEAM_RIGHT[rng.int(TEAM_RIGHT.length)]}`;
}
