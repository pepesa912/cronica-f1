export type Circuit = {
  id: string;
  name: string;
  country: string;
  gp: string;
  len: number;
  overtake: number;
  rain: number;
  street: number;
  danger: number;
  speed: number;
  tour: number;
  fictional?: boolean;
};

function c(
  id: string,
  name: string,
  country: string,
  gp: string,
  len: number,
  overtake: number,
  rain: number,
  street: number,
  danger: number,
  speed: number,
  tour: number,
  fictional?: boolean,
): Circuit {
  return { id, name, country, gp, len, overtake, rain, street, danger, speed, tour, fictional };
}

export const CIRCUITS: Record<string, Circuit> = Object.fromEntries(
  (
    [
      c("silverstone", "Silverstone", "Reino Unido", "Gran Bretaña", 5.891, 0.74, 0.34, 0, 0.12, 1.05, 42),
      c("monaco", "Mónaco", "Mónaco", "Mónaco", 3.337, 0.12, 0.18, 0.95, 0.28, 0.72, 36),
      c("bremgarten", "Bremgarten", "Suiza", "Suiza", 7.28, 0.28, 0.36, 0, 0.34, 0.86, 38),
      c("spa", "Spa-Francorchamps", "Bélgica", "Bélgica", 7.004, 0.7, 0.38, 0, 0.26, 1.12, 44),
      c("reims", "Reims-Gueux", "Francia", "Francia", 8.3, 0.55, 0.22, 0, 0.3, 1.14, 34),
      c("monza", "Monza", "Italia", "Italia", 5.793, 0.62, 0.2, 0, 0.2, 1.16, 52),
      c("nord", "Nürburgring Nordschleife", "Alemania", "Alemania", 22.8, 0.22, 0.4, 0, 0.48, 0.9, 46),
      c("nurburgring", "Nürburgring", "Alemania", "Europa", 5.148, 0.55, 0.36, 0, 0.14, 0.96, 47),
      c("zandvoort", "Zandvoort", "Países Bajos", "Países Bajos", 4.259, 0.48, 0.32, 0, 0.16, 0.98, 45),
      c("pedralbes", "Pedralbes", "España", "España", 6.316, 0.4, 0.12, 0.4, 0.22, 0.95, 40),
      c("rouen", "Rouen-les-Essarts", "Francia", "Francia", 6.542, 0.35, 0.28, 0, 0.32, 0.94, 34),
      c("buenosaires", "Buenos Aires", "Argentina", "Argentina", 4.259, 0.5, 0.16, 0, 0.14, 0.96, 8),
      c("aintree", "Aintree", "Reino Unido", "Gran Bretaña", 4.828, 0.42, 0.36, 0, 0.14, 0.92, 42),
      c("pescara", "Pescara", "Italia", "Pescara", 25.8, 0.3, 0.16, 0.2, 0.5, 1.05, 50),
      c("boavista", "Boavista", "Portugal", "Portugal", 7.4, 0.25, 0.2, 0.7, 0.3, 0.88, 28),
      c("aindiab", "Ain-Diab", "Marruecos", "Marruecos", 7.618, 0.45, 0.08, 0, 0.2, 1.02, 12),
      c("avus", "AVUS", "Alemania", "Alemania", 8.3, 0.5, 0.22, 0, 0.36, 1.15, 46),
      c("monsanto", "Monsanto", "Portugal", "Portugal", 5.44, 0.32, 0.18, 0.3, 0.28, 0.9, 28),
      c("sebring", "Sebring", "Estados Unidos", "Estados Unidos", 8.36, 0.4, 0.24, 0, 0.2, 0.94, 78),
      c("riverside", "Riverside", "Estados Unidos", "Estados Unidos", 5.27, 0.48, 0.08, 0, 0.18, 1.0, 80),
      c("eastlondon", "East London", "Sudáfrica", "Sudáfrica", 3.92, 0.4, 0.14, 0, 0.16, 0.9, 6),
      c("watkins", "Watkins Glen", "Estados Unidos", "Estados Unidos", 5.435, 0.58, 0.28, 0, 0.16, 1.0, 82),
      c("charade", "Charade", "Francia", "Francia", 8.055, 0.3, 0.3, 0, 0.36, 0.92, 34),
      c("brands", "Brands Hatch", "Reino Unido", "Gran Bretaña", 4.206, 0.46, 0.32, 0, 0.2, 0.94, 42),
      c("zeltweg", "Zeltweg", "Austria", "Austria", 3.2, 0.55, 0.24, 0, 0.18, 1.02, 48),
      c("mexico", "Hermanos Rodríguez", "México", "México", 4.304, 0.52, 0.18, 0, 0.14, 0.95, 86),
      c("mosport", "Mosport", "Canadá", "Canadá", 3.957, 0.42, 0.22, 0, 0.22, 0.96, 74),
      c("kyalami", "Kyalami", "Sudáfrica", "Sudáfrica", 4.1, 0.5, 0.2, 0, 0.16, 1.0, 6),
      c("bugatti", "Le Mans Bugatti", "Francia", "Francia", 4.422, 0.35, 0.26, 0, 0.14, 0.9, 34),
      c("jarama", "Jarama", "España", "España", 3.404, 0.28, 0.14, 0, 0.14, 0.86, 32),
      c("tremblant", "Mont-Tremblant", "Canadá", "Canadá", 4.265, 0.4, 0.24, 0, 0.2, 0.94, 74),
      c("montjuic", "Montjuïc", "España", "España", 3.79, 0.22, 0.12, 0.75, 0.34, 0.88, 32),
      c("osterreichring", "Österreichring", "Austria", "Austria", 5.942, 0.66, 0.28, 0, 0.24, 1.1, 48),
      c("ricard", "Paul Ricard", "Francia", "Francia", 5.842, 0.58, 0.16, 0, 0.1, 1.02, 35),
      c("nivelles", "Nivelles", "Bélgica", "Bélgica", 3.724, 0.45, 0.3, 0, 0.12, 0.95, 43),
      c("zolder", "Zolder", "Bélgica", "Bélgica", 4.011, 0.4, 0.32, 0, 0.18, 0.92, 43),
      c("anderstorp", "Anderstorp", "Suecia", "Suecia", 4.025, 0.5, 0.26, 0, 0.12, 0.98, 41),
      c("dijon", "Dijon-Prenois", "Francia", "Francia", 3.801, 0.48, 0.24, 0, 0.14, 0.98, 35),
      c("interlagos", "Interlagos", "Brasil", "Brasil", 4.309, 0.6, 0.28, 0, 0.16, 1.0, 14),
      c("jacarepagua", "Jacarepaguá", "Brasil", "Brasil", 5.031, 0.52, 0.22, 0, 0.12, 1.02, 14),
      c("longbeach", "Long Beach", "Estados Unidos", "Estados Unidos Oeste", 3.275, 0.2, 0.08, 0.9, 0.22, 0.78, 70),
      c("fuji", "Fuji", "Japón", "Japón", 4.563, 0.5, 0.34, 0, 0.16, 1.0, 92),
      c("villeneuve", "Gilles Villeneuve", "Canadá", "Canadá", 4.361, 0.62, 0.24, 0.35, 0.18, 1.0, 74),
      c("imola", "Imola", "Italia", "Emilia-Romaña", 4.909, 0.35, 0.22, 0, 0.2, 0.96, 50),
      c("detroit", "Detroit", "Estados Unidos", "Estados Unidos", 4.023, 0.18, 0.16, 0.92, 0.24, 0.74, 72),
      c("caesars", "Caesars Palace", "Estados Unidos", "Las Vegas", 3.65, 0.22, 0.04, 0.7, 0.14, 0.8, 84),
      c("dallas", "Dallas", "Estados Unidos", "Estados Unidos", 3.901, 0.2, 0.12, 0.88, 0.26, 0.8, 76),
      c("estoril", "Estoril", "Portugal", "Portugal", 4.36, 0.5, 0.18, 0, 0.14, 0.98, 30),
      c("adelaide", "Adelaide", "Australia", "Australia", 3.78, 0.32, 0.14, 0.75, 0.2, 0.86, 98),
      c("jerez", "Jerez", "España", "España", 4.428, 0.48, 0.12, 0, 0.12, 0.96, 31),
      c("hungaroring", "Hungaroring", "Hungría", "Hungría", 4.381, 0.3, 0.2, 0, 0.1, 0.9, 49),
      c("rodriguez", "Hermanos Rodríguez", "México", "México", 4.304, 0.55, 0.2, 0, 0.12, 0.96, 87),
      c("suzuka", "Suzuka", "Japón", "Japón", 5.807, 0.42, 0.28, 0, 0.16, 1.02, 93),
      c("phoenix", "Phoenix", "Estados Unidos", "Estados Unidos", 3.72, 0.22, 0.06, 0.9, 0.2, 0.8, 71),
      c("magny", "Magny-Cours", "Francia", "Francia", 4.411, 0.4, 0.24, 0, 0.1, 0.94, 35),
      c("catalunya", "Barcelona-Catalunya", "España", "España", 4.657, 0.5, 0.16, 0, 0.1, 0.98, 33),
      c("donington", "Donington Park", "Reino Unido", "Europa", 4.023, 0.52, 0.3, 0, 0.14, 0.94, 42),
      c("okayama", "TI Aida", "Japón", "Pacífico", 3.703, 0.38, 0.26, 0, 0.12, 0.9, 91),
      c("melbourne", "Albert Park", "Australia", "Australia", 5.278, 0.58, 0.22, 0.45, 0.16, 0.98, 4),
      c("hockenheim", "Hockenheim", "Alemania", "Alemania", 4.574, 0.64, 0.26, 0, 0.14, 1.06, 46),
      c("redbullring", "Red Bull Ring", "Austria", "Austria", 4.318, 0.6, 0.28, 0, 0.14, 1.04, 48),
      c("sepang", "Sepang", "Malasia", "Malasia", 5.543, 0.66, 0.4, 0, 0.12, 1.0, 18),
      c("indyroad", "Indianápolis", "Estados Unidos", "Estados Unidos", 4.192, 0.45, 0.2, 0, 0.12, 1.02, 75),
      c("bahrain", "Sakhir", "Baréin", "Baréin", 5.412, 0.62, 0.04, 0, 0.1, 1.02, 20),
      c("shanghai", "Shanghái", "China", "China", 5.451, 0.64, 0.22, 0, 0.1, 1.0, 16),
      c("istanbul", "Estambul", "Turquía", "Turquía", 5.338, 0.6, 0.18, 0, 0.12, 1.02, 54),
      c("marina", "Marina Bay", "Singapur", "Singapur", 4.94, 0.28, 0.3, 0.92, 0.22, 0.78, 60),
      c("valencia", "Valencia", "España", "Europa", 5.419, 0.3, 0.12, 0.7, 0.14, 0.86, 34),
      c("yeongam", "Yeongam", "Corea del Sur", "Corea", 5.615, 0.5, 0.2, 0, 0.12, 0.98, 62),
      c("buddh", "Buddh", "India", "India", 5.125, 0.55, 0.14, 0, 0.12, 1.0, 58),
      c("cota", "Circuit of the Americas", "Estados Unidos", "Estados Unidos", 5.513, 0.64, 0.18, 0, 0.12, 1.02, 79),
      c("sochi", "Sochi", "Rusia", "Rusia", 5.848, 0.35, 0.2, 0.55, 0.12, 0.95, 56),
      c("baku", "Bakú", "Azerbaiyán", "Azerbaiyán", 6.003, 0.45, 0.1, 0.85, 0.32, 1.0, 55),
      c("portimao", "Portimão", "Portugal", "Portugal", 4.653, 0.55, 0.2, 0, 0.14, 1.0, 29),
      c("mugello", "Mugello", "Italia", "Toscana", 5.245, 0.4, 0.2, 0, 0.16, 1.04, 51),
      c("jeddah", "Yeda", "Arabia Saudita", "Arabia Saudita", 6.174, 0.48, 0.04, 0.8, 0.3, 1.08, 22),
      c("miami", "Miami", "Estados Unidos", "Miami", 5.412, 0.5, 0.3, 0.4, 0.14, 0.98, 73),
      c("lusail", "Lusail", "Catar", "Catar", 5.419, 0.52, 0.06, 0, 0.12, 1.02, 64),
      c("vegas", "Las Vegas", "Estados Unidos", "Las Vegas", 6.201, 0.55, 0.06, 0.85, 0.2, 1.08, 83),
      c("yas", "Yas Marina", "Emiratos Árabes", "Abu Dabi", 5.281, 0.42, 0.04, 0.35, 0.1, 0.96, 96),
      c("madring", "Madring", "España", "España", 5.414, 0.58, 0.14, 0.25, 0.12, 1.0, 33),
      c("zolder", "Zolder", "Bélgica", "Bélgica", 4.011, 0.4, 0.32, 0, 0.18, 0.92, 43),
      // fictional, only for a living calendar
      c("lirio", "Puerto Lirio", "Argentina", "Litoral", 4.62, 0.46, 0.22, 0.55, 0.16, 0.94, 9, true),
      c("montelago", "Montelago", "Italia", "Los Lagos", 5.11, 0.44, 0.26, 0, 0.14, 0.98, 53, true),
      c("kestrel", "Kestrel Downs", "Reino Unido", "las Islas", 5.24, 0.6, 0.4, 0, 0.14, 1.0, 41, true),
      c("oasis", "Oasis Park", "Baréin", "el Golfo", 5.33, 0.58, 0.05, 0, 0.1, 1.03, 21, true),
      c("parana", "Alto Paraná", "Brasil", "el Interior", 4.48, 0.52, 0.34, 0, 0.15, 0.97, 15, true),
      c("cima", "Cima Rossa", "Suiza", "los Alpes", 4.86, 0.36, 0.3, 0, 0.2, 0.95, 39, true),
      c("sable", "Sable d'Or", "Francia", "la Costa", 5.02, 0.4, 0.2, 0.6, 0.16, 0.92, 36, true),
      c("seco", "Lago Seco", "México", "el Altiplano", 4.7, 0.56, 0.12, 0, 0.12, 0.98, 85, true),
    ] as Circuit[]
  ).filter((circuit, index, all) => all.findIndex((other) => other.id === circuit.id) === index).map((circuit) => [circuit.id, circuit]),
);

export function raceTitle(gp: string): string {
  if (/^(Gran Premio|70)/.test(gp)) return gp;
  const bare = new Set(["Pescara", "Estiria", "Toscana", "Sakhir", "Eifel", "Pacífico", "70.º Aniversario"]);
  if (bare.has(gp) || gp.startsWith("70")) return `Gran Premio ${gp}`;
  return `Gran Premio de ${gp}`;
}

export function circuitLaps(circuit: Circuit): number {
  const distance = circuit.street > 0.65 ? 265 : circuit.len > 12 ? 300 : 305;
  return Math.max(40, Math.min(78, Math.round(distance / circuit.len)));
}
