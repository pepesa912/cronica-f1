import { clamp } from "./rng";
import type { DriverState } from "./types";

export type TeamInfo = {
  id: string;
  name: string;
  nat: string;
  color: string;
  works: boolean;
};

const TEAM_SRC = `
alfa|Alfa Romeo|ITA|#9b1b30|1
ferrari|Ferrari|ITA|#dc0000|1
maserati|Maserati|ITA|#b11226|1
mercedes|Mercedes|GER|#00d2be|1
gordini|Gordini|FRA|#1a4f8b|0
talbot|Talbot-Lago|FRA|#2f5d9f|0
cooper|Cooper|GBR|#1f6b4a|0
vanwall|Vanwall|GBR|#0e4d2c|0
brm|BRM|GBR|#0b3d2e|1
lotus|Lotus|GBR|#0c6b45|0
porsche|Porsche|GER|#b8b8b8|1
brabham|Brabham|GBR|#e0b000|0
honda|Honda|JPN|#d35400|1
eagle|Eagle|USA|#1a3e8a|0
matra|Matra|FRA|#0033a0|1
mclaren|McLaren|GBR|#ff8000|1
march|March|GBR|#f5c400|0
tyrrell|Tyrrell|GBR|#2456c5|0
shadow|Shadow|GBR|#6b3fa0|0
hesketh|Hesketh|GBR|#c8102e|0
penske|Penske|USA|#c41230|0
wolf|Wolf|CAN|#16324f|0
ligier|Ligier|FRA|#2f6fed|0
copersucar|Fittipaldi|BRA|#f4c400|0
renault|Renault|FRA|#ffe34a|1
williams|Williams|GBR|#2b6bff|0
arrows|Arrows|GBR|#f26b21|0
ensign|Ensign|GBR|#d4531a|0
toleman|Toleman|GBR|#e10600|0
benetton|Benetton|ITA|#008a3e|0
minardi|Minardi|ITA|#f0d060|0
jordan|Jordan|IRL|#ffd100|0
footwork|Footwork|JPN|#f47c20|0
sauber|Sauber|SUI|#c5c8ce|0
pacific|Pacific|GBR|#e23d8c|0
simtek|Simtek|GBR|#3d3d8b|0
stewart|Stewart|GBR|#d7d7d7|0
prost|Prost|FRA|#0033a0|0
bar|BAR|GBR|#d00000|0
jaguar|Jaguar|GBR|#0b6b3a|0
toyota|Toyota|JPN|#eb0a1e|1
bmw|BMW Sauber|GER|#1c69d4|1
superaguri|Super Aguri|JPN|#e10600|0
redbull|Red Bull|AUT|#1e41ff|1
tororosso|Toro Rosso|ITA|#20345c|0
racingbulls|Racing Bulls|ITA|#4c6fff|0
brawn|Brawn|GBR|#8fbf1f|1
hrt|HRT|ESP|#c4a35a|0
virgin|Virgin|GBR|#e10600|0
marussia|Marussia|RUS|#8b1e3f|0
caterham|Caterham|MAS|#007a53|0
manor|Manor|GBR|#9b2335|0
haas|Haas|USA|#d0d4d8|0
alpine|Alpine|FRA|#ff87bc|1
alphatauri|AlphaTauri|ITA|#5eb1e8|0
aston|Aston Martin|GBR|#006f62|1
cadillac|Cadillac|USA|#c4a35a|0
audi|Audi|GER|#bb0a30|1
lola|Lola|GBR|#e10600|0
surtees|Surtees|GBR|#0a6ebd|0
iso|Iso-Marlboro|GBR|#8a8f98|0
walker|Cooper Walker|GBR|#0d3b2e|0
brp|BRP|GBR|#1f4e79|0
connaught|Connaught|GBR|#114433|0
hwm|HWM|GBR|#6b2d5b|0
lancia|Lancia|ITA|#7a1f2b|1
larrousse|Larrousse|FRA|#f07d00|0
leyton|Leyton House|GBR|#0e6b4f|0
onyx|Onyx|GBR|#6e2b6e|0
spyker|Spyker|NED|#f08a00|0
forceindia|Force India|IND|#ff5a00|0
racingpoint|Racing Point|GBR|#f5a3c7|0
lotusgp|Lotus|GBR|#c9a227|0
hondaf1|Honda|GBR|#e10600|1
`;

export const TEAMS: Record<string, TeamInfo> = Object.fromEntries(
  TEAM_SRC.trim()
    .split("\n")
    .map((line) => {
      const [id, name, nat, color, works] = line.split("|");
      return [id, { id, name, nat, color, works: works === "1" }];
    }),
);

const PALETTE = ["#e10600", "#ff8000", "#ffe34a", "#8fbf1f", "#00d2be", "#2b6bff", "#6b3fa0", "#ff87bc", "#c4a35a", "#d0d4d8", "#006f62", "#f26b21"];

export function fictionalColor(n: number): string {
  return PALETTE[Math.abs(n) % PALETTE.length];
}

const ENGINE_NAMES: Record<string, string> = {
  super: "compresor",
  v12: "V12",
  "4clt": "4CLT",
  f2: "F2",
  lago: "Lago",
  gordini: "Gordini",
  bristol: "Bristol",
  alta: "Alta",
  lea: "Lea-Francis",
  w196: "W196",
  "553": "553",
  "250f": "250F",
  d50: "D50",
  "555": "555",
  vw: "Vanwall",
  "25": "2.5",
  "801": "801",
  climax: "Climax",
  dino: "Dino",
  "15": "1.5",
  f4: "flat-4",
  f8: "flat-8",
  "156": "156",
  v8: "V8",
  brm: "BRM",
  repco: "Repco",
  maser: "Maserati",
  h16: "H16",
  ford: "Ford",
  dfv: "Ford",
  weslake: "Weslake",
  "312": "312",
  "312b": "312B",
  "312b3": "312B3",
  "312t": "312T",
  "312t2": "312T2",
  "312t3": "312T3",
  "312t4": "312T4",
  t5: "T5",
  "126": "126 turbo",
  turbo: "turbo",
  alfa: "Alfa",
  bmw: "BMW",
  tag: "TAG",
  honda: "Honda",
  hart: "Hart",
  renault: "Renault",
  megatron: "Megatron",
  judd: "Judd",
  f186: "F1-86",
  f187: "F1/87",
  "640": "640",
  "641": "641",
  "643": "643",
  f92: "F92A",
  f93: "F93A",
  "412": "412 T",
  f310: "F310",
  f310b: "F310B",
  f300: "F300",
  f399: "F399",
  v10: "V10",
  lambo: "Lamborghini",
  ilmor: "Ilmor",
  yamaha: "Yamaha",
  mugen: "Mugen",
  peugeot: "Peugeot",
  porsche: "Porsche",
  playlife: "Playlife",
  petronas: "Petronas",
  meca: "Mecachrome",
  supertec: "Supertec",
  arrows: "Arrows",
  cosworth: "Cosworth",
  fond: "Fondmetal",
  acer: "Acer",
  asia: "Asiatech",
  european: "European",
  pu: "híbrido",
  rbpt: "Honda RBPT",
  mercedes: "Mercedes",
  ferrari: "Ferrari",
  ferrari26: "Ferrari 2026",
  mercedes26: "Mercedes 2026",
  ford26: "Red Bull Ford",
  honda26: "Honda",
  audi: "Audi",
  toyota: "Toyota",
};

export function engineName(token: string): string {
  return ENGINE_NAMES[token] ?? token;
}

export function teamInfo(id: string): TeamInfo {
  return (
    TEAMS[id] ?? {
      id,
      name: id,
      nat: "INT",
      color: "#8a8f98",
      works: false,
    }
  );
}

// id|name|nat|born|peak|peakAge|consistency|wet|quali
const DRIVER_SRC = `
albers|Christijan Albers|NED|1979|74|26|70|68|72
albon|Alexander Albon|THA|1996|86|27|84|88|84
alboreto|Michele Alboreto|ITA|1956|90|28|86|82|88
alesi|Jean Alesi|FRA|1964|90|28|78|86|92
alguersuari|Jaime Alguersuari|ESP|1990|78|22|76|74|78
alliot|Philippe Alliot|FRA|1954|74|32|72|70|74
allison|Cliff Allison|GBR|1932|78|26|74|76|76
alonso|Fernando Alonso|ESP|1981|97|25|96|94|95
ambrosio|Jerome d'Ambrosio|BEL|1985|74|27|76|72|74
amon|Chris Amon|NZL|1943|90|27|74|88|86
andretti|Mario Andretti|USA|1940|94|35|86|88|92
antonelli|Andrea Kimi Antonelli|ITA|2006|94|23|84|88|92
arnoux|Rene Arnoux|FRA|1948|88|32|80|84|86
arundell|Peter Arundell|GBR|1933|78|30|76|74|78
ascari|Alberto Ascari|ITA|1918|97|34|90|86|95
attwood|Richard Attwood|GBR|1940|76|28|78|74|74
badoer|Luca Badoer|ITA|1971|72|26|74|70|72
baghetti|Giancarlo Baghetti|ITA|1934|80|27|76|74|78
baldi|Mauro Baldi|ITA|1954|76|29|74|72|76
bandini|Lorenzo Bandini|ITA|1935|84|29|80|82|82
barbazza|Fabrizio Barbazza|ITA|1963|70|29|68|66|70
barilla|Paolo Barilla|ITA|1961|70|28|70|68|70
barrichello|Rubens Barrichello|BRA|1972|88|28|88|82|86
baumgartner|Zsolt Baumgartner|HUN|1981|68|24|66|64|68
bearman|Oliver Bearman|GBR|2005|84|22|80|82|84
behra|Jean Behra|FRA|1921|88|34|80|86|84
bellof|Stefan Bellof|GER|1957|90|27|74|94|88
belmondo|Paul Belmondo|FRA|1963|66|30|64|62|66
beltoise|Jean-Pierre Beltoise|FRA|1937|82|33|84|80|78
beretta|Olivier Beretta|MON|1969|70|25|70|68|70
berger|Gerhard Berger|AUT|1959|90|30|82|84|88
bernard|Eric Bernard|FRA|1964|76|28|74|72|76
bernoldi|Enrique Bernoldi|BRA|1978|72|24|70|70|74
bianchi|Jules Bianchi|FRA|1989|82|24|80|84|80
bira|Prince Bira|THA|1914|80|36|78|76|80
blundell|Mark Blundell|GBR|1966|78|28|78|74|76
boesel|Raul Boesel|BRA|1957|74|26|74|70|72
bonetto|Felice Bonetto|ITA|1903|76|48|74|78|72
bonnier|Jo Bonnier|SWE|1930|80|32|80|78|76
bortoleto|Gabriel Bortoleto|BRA|2004|83|22|80|78|82
bottas|Valtteri Bottas|FIN|1989|88|29|92|80|92
boullion|Jean-Christophe Boullion|FRA|1969|74|26|72|70|74
bourdais|Sebastien Bourdais|FRA|1979|80|29|76|78|82
boutsen|Thierry Boutsen|BEL|1957|84|32|86|80|82
brabham|Jack Brabham|AUS|1926|92|37|94|78|84
brambilla|Vittorio Brambilla|ITA|1937|78|38|70|76|74
brooks|Tony Brooks|GBR|1932|90|26|86|84|88
brundle|Martin Brundle|GBR|1959|84|28|84|80|82
bruni|Gianmaria Bruni|ITA|1981|74|23|70|72|76
bsenna|Bruno Senna|BRA|1983|76|28|74|76|76
bucknum|Ronnie Bucknum|USA|1936|72|28|70|68|70
buemi|Sebastien Buemi|SUI|1988|80|23|78|76|80
burti|Luciano Burti|BRA|1975|74|26|72|74|74
button|Jenson Button|GBR|1980|90|29|94|90|84
caffi|Alex Caffi|ITA|1964|72|26|70|68|72
campos|Adrian Campos|ESP|1960|68|28|64|62|66
capelli|Ivan Capelli|ITA|1963|84|25|76|78|86
cecotto|Johnny Cecotto|VEN|1956|76|28|72|74|78
cevert|Francois Cevert|FRA|1944|88|28|82|86|88
cfittipaldi|Christian Fittipaldi|BRA|1971|76|23|76|74|76
chandhok|Karun Chandhok|IND|1984|70|26|70|68|70
cheever|Eddie Cheever|USA|1958|82|27|80|76|80
chilton|Max Chilton|GBR|1991|70|22|74|66|68
chiron|Louis Chiron|MON|1899|82|51|84|78|80
clark|Jim Clark|GBR|1936|99|27|92|90|99
colapinto|Franco Colapinto|ARG|2003|81|22|74|80|82
collins|Peter Collins|GBR|1931|88|25|80|86|86
comas|Erik Comas|FRA|1963|74|29|74|70|72
coulthard|David Coulthard|GBR|1971|88|28|90|80|84
courage|Piers Courage|GBR|1942|82|27|76|84|80
daly|Derek Daly|IRL|1953|76|28|74|74|74
damatta|Cristiano da Matta|BRA|1973|80|30|78|76|82
davidson|Anthony Davidson|GBR|1979|76|27|78|74|76
dbrabham|David Brabham|AUS|1965|74|28|76|70|72
deangelis|Elio de Angelis|ITA|1958|86|26|84|80|90
decesaris|Andrea de Cesaris|ITA|1959|78|24|70|74|82
depailler|Patrick Depailler|FRA|1944|86|32|78|88|84
devries|Nyck de Vries|NED|1995|76|27|80|74|78
dhill|Damon Hill|GBR|1960|90|36|90|86|84
digrassi|Lucas di Grassi|BRA|1984|76|26|78|74|76
diniz|Pedro Diniz|BRA|1970|70|26|72|66|68
diresta|Paul di Resta|GBR|1986|80|26|82|78|80
dumfries|Johnny Dumfries|GBR|1958|74|28|74|72|76
dwalker|Dave Walker|AUS|1941|72|30|68|70|74
elford|Vic Elford|GBR|1935|78|33|76|80|74
ericsson|Marcus Ericsson|SWE|1990|74|26|78|70|72
etancelin|Philippe Etancelin|FRA|1896|74|54|76|70|72
fagioli|Luigi Fagioli|ITA|1898|86|52|82|80|84
fangio|Juan Manuel Fangio|ARG|1911|99|44|97|99|94
farina|Giuseppe Farina|ITA|1906|92|44|80|78|94
firman|Ralph Firman|GBR|1975|70|28|68|66|70
fisichella|Giancarlo Fisichella|ITA|1973|84|28|82|80|86
fittipaldi|Emerson Fittipaldi|BRA|1946|94|27|92|84|90
flockhart|Ron Flockhart|GBR|1923|76|33|74|72|74
follmer|George Follmer|USA|1934|74|39|72|70|72
fontana|Norberto Fontana|ARG|1975|72|22|70|68|72
frentzen|Heinz-Harald Frentzen|GER|1967|86|30|84|82|86
friesacher|Patrick Friesacher|AUT|1980|68|25|66|64|68
gachot|Bertrand Gachot|BEL|1962|72|30|70|70|74
ganley|Howden Ganley|NZL|1941|74|31|76|72|72
gasly|Pierre Gasly|FRA|1996|84|26|82|80|84
gene|Marc Gene|ESP|1974|74|26|76|72|74
gethin|Peter Gethin|GBR|1940|78|31|74|76|76
ghill|Graham Hill|GBR|1929|92|33|92|90|86
ghinzani|Piercarlo Ghinzani|ITA|1952|70|32|72|66|68
giacomelli|Bruno Giacomelli|ITA|1952|78|28|74|76|80
ginther|Richie Ginther|USA|1930|84|34|86|80|82
giovinazzi|Antonio Giovinazzi|ITA|1993|78|25|76|74|78
giraud|Yves Giraud-Cabantous|FRA|1904|72|46|74|68|70
glock|Timo Glock|GER|1982|80|27|80|78|80
gonzalez|Jose Froilan Gonzalez|ARG|1922|88|32|78|84|90
grosjean|Romain Grosjean|FRA|1986|84|27|74|80|88
grouillard|Olivier Grouillard|FRA|1958|70|32|66|68|72
gugelmin|Mauricio Gugelmin|BRA|1963|80|26|82|74|78
gurney|Dan Gurney|USA|1931|92|32|88|84|90
gutierrez|Esteban Gutierrez|MEX|1991|74|23|74|70|76
gvilleneuve|Gilles Villeneuve|CAN|1950|96|29|72|97|92
hadjar|Isack Hadjar|FRA|2004|84|22|80|82|84
hailwood|Mike Hailwood|GBR|1940|80|32|76|82|78
hakkinen|Mika Hakkinen|FIN|1968|96|30|86|98|96
hamilton|Lewis Hamilton|GBR|1985|98|33|90|99|97
hartley|Brendon Hartley|NZL|1990|76|28|78|74|74
haryanto|Rio Haryanto|INA|1993|68|23|70|64|66
hawthorn|Mike Hawthorn|GBR|1929|90|29|82|80|88
heidfeld|Nick Heidfeld|GER|1977|84|28|94|76|86
herbert|Johnny Herbert|GBR|1964|82|31|80|84|80
hesnault|Francois Hesnault|FRA|1956|70|28|68|66|70
hulkenberg|Nico Hulkenberg|GER|1987|84|27|90|78|90
hulme|Denny Hulme|NZL|1936|90|32|96|80|78
hunt|James Hunt|GBR|1947|92|29|72|92|90
ickx|Jacky Ickx|BEL|1945|92|28|84|96|84
inoue|Taki Inoue|JPN|1963|64|32|60|62|66
ireland|Innes Ireland|GBR|1930|82|32|76|80|82
irvine|Eddie Irvine|GBR|1966|84|33|78|76|82
jabouille|Jean-Pierre Jabouille|FRA|1942|82|37|84|74|80
jarier|Jean-Pierre Jarier|FRA|1946|82|30|74|80|88
jmagnussen|Jan Magnussen|DEN|1973|78|24|72|80|82
johansson|Stefan Johansson|SWE|1956|82|30|80|78|80
jones|Alan Jones|AUS|1946|92|34|90|78|84
jpalmer|Jonathan Palmer|GBR|1956|76|31|80|70|74
jverstappen|Jos Verstappen|NED|1972|78|22|70|82|80
jvilleneuve|Jacques Villeneuve|CAN|1971|92|26|78|84|97
jwilson|Justin Wilson|GBR|1978|78|25|80|76|76
karthikeyan|Narain Karthikeyan|IND|1977|70|28|72|66|70
katayama|Ukyo Katayama|JPN|1963|72|31|74|70|72
klien|Christian Klien|AUT|1983|76|22|74|74|76
kling|Karl Kling|GER|1910|82|44|80|76|80
kmagnussen|Kevin Magnussen|DEN|1992|82|24|78|84|82
knakajima|Kazuki Nakajima|JPN|1985|74|23|76|70|74
kobayashi|Kamui Kobayashi|JPN|1986|80|26|76|82|78
kovalainen|Heikki Kovalainen|FIN|1981|82|27|80|78|84
krosberg|Keke Rosberg|FIN|1948|90|34|82|84|88
kubica|Robert Kubica|POL|1984|90|24|86|97|90
kvyat|Daniil Kvyat|RUS|1994|80|21|74|78|82
laffite|Jacques Laffite|FRA|1943|86|36|88|82|80
lamy|Pedro Lamy|POR|1972|74|24|76|70|72
latifi|Nicholas Latifi|CAN|1995|72|25|76|68|70
lauda|Niki Lauda|AUT|1949|96|28|98|82|92
lawson|Liam Lawson|NZL|2002|82|23|78|84|80
leclerc|Charles Leclerc|MON|1997|94|24|84|90|97
lehto|JJ Lehto|FIN|1966|78|26|74|76|80
lewisevans|Stuart Lewis-Evans|GBR|1930|82|27|76|80|84
lindblad|Arvid Lindblad|GBR|2007|83|21|78|80|86
liuzzi|Vitantonio Liuzzi|ITA|1980|76|26|74|74|78
macklin|Lance Macklin|GBR|1919|74|33|72|70|72
maggs|Tony Maggs|RSA|1937|76|26|76|72|74
maglioli|Umberto Maglioli|ITA|1928|78|27|76|74|76
maldonado|Pastor Maldonado|VEN|1985|76|27|66|72|86
mandretti|Michael Andretti|USA|1962|82|31|74|80|86
mansell|Nigel Mansell|GBR|1953|94|39|80|90|92
mantovani|Sergio Mantovani|ITA|1929|74|25|72|70|72
manzon|Robert Manzon|FRA|1917|78|35|80|76|74
marimon|Onofre Marimon|ARG|1923|76|31|72|74|76
marques|Tarso Marques|BRA|1976|68|22|66|64|68
martini|Pierluigi Martini|ITA|1961|78|28|80|74|76
mass|Jochen Mass|GER|1946|80|30|84|76|76
massa|Felipe Massa|BRA|1981|88|27|86|78|84
mazepin|Nikita Mazepin|RUS|1999|68|22|64|62|70
mcalpine|Kenneth McAlpine|GBR|1920|70|33|72|66|68
mclaren|Bruce McLaren|NZL|1937|86|28|88|80|82
mcnish|Allan McNish|GBR|1969|76|33|78|74|76
menditeguy|Carlos Menditeguy|ARG|1914|78|43|76|74|76
merhi|Roberto Merhi|ESP|1991|72|23|70|70|74
merzario|Arturo Merzario|ITA|1943|74|31|70|76|72
mick|Mick Schumacher|GER|1999|76|23|78|74|76
modena|Stefano Modena|ITA|1963|78|28|76|74|80
monteiro|Tiago Monteiro|POR|1976|72|29|74|70|70
montoya|Juan Pablo Montoya|COL|1975|90|27|74|86|94
morbidelli|Gianni Morbidelli|ITA|1968|76|25|76|74|78
moss|Stirling Moss|GBR|1929|98|31|84|98|99
musso|Luigi Musso|ITA|1924|86|32|78|84|86
nakano|Shinji Nakano|JPN|1971|70|26|74|68|70
nannini|Alessandro Nannini|ITA|1959|84|30|76|84|86
nasr|Felipe Nasr|BRA|1992|76|23|76|72|76
nilsson|Gunnar Nilsson|SWE|1948|82|29|80|84|80
norris|Lando Norris|GBR|1999|93|25|88|92|95
nrosberg|Nico Rosberg|GER|1985|90|31|94|82|92
ocon|Esteban Ocon|FRA|1996|84|25|86|80|84
oliver|Jackie Oliver|GBR|1942|78|28|74|76|78
pace|Carlos Pace|BRA|1944|86|31|80|88|84
palmerj|Jolyon Palmer|GBR|1991|74|25|76|70|76
panis|Olivier Panis|FRA|1966|82|30|84|78|80
pantano|Giorgio Pantano|ITA|1979|74|25|70|72|78
parkes|Mike Parkes|GBR|1931|80|35|82|74|78
patrese|Riccardo Patrese|ITA|1954|88|36|90|80|86
pdlr|Pedro de la Rosa|ESP|1971|78|35|84|74|76
perdisa|Cesare Perdisa|ITA|1932|74|24|72|70|72
perez|Sergio Perez|MEX|1990|86|30|90|82|78
pescarolo|Henri Pescarolo|FRA|1942|78|30|80|76|74
peterson|Ronnie Peterson|SWE|1944|94|30|72|92|98
petrov|Vitaly Petrov|RUS|1984|76|27|74|74|76
phill|Phil Hill|USA|1927|90|34|94|78|86
piastri|Oscar Piastri|AUS|2001|92|24|92|88|94
pic|Charles Pic|FRA|1990|72|22|72|68|72
piquet|Nelson Piquet|BRA|1952|94|31|92|80|90
piquetjr|Nelson Piquet Jr|BRA|1985|74|23|70|72|76
pironi|Didier Pironi|FRA|1952|88|29|80|86|86
pizzonia|Antonio Pizzonia|BRA|1980|74|23|70|72|76
poore|Dennis Poore|GBR|1916|72|36|74|68|70
prost|Alain Prost|FRA|1955|98|30|99|88|96
pryce|Tom Pryce|GBR|1949|84|26|76|86|84
raikkonen|Kimi Raikkonen|FIN|1979|94|28|84|94|82
ralf|Ralf Schumacher|GER|1975|84|26|82|78|84
ratzenberger|Roland Ratzenberger|AUT|1960|72|34|76|68|70
rebaque|Hector Rebaque|MEX|1956|72|25|74|68|70
redman|Brian Redman|GBR|1937|80|33|84|78|76
regazzoni|Clay Regazzoni|SUI|1939|86|36|82|84|84
reutemann|Carlos Reutemann|ARG|1942|90|36|88|80|92
revson|Peter Revson|USA|1939|84|34|82|80|82
ricciardo|Daniel Ricciardo|AUS|1989|88|27|82|88|84
rindt|Jochen Rindt|AUT|1942|96|28|76|94|96
rodriguez|Pedro Rodriguez|MEX|1940|88|27|80|90|86
rosier|Louis Rosier|FRA|1905|78|45|82|72|74
rosset|Ricardo Rosset|BRA|1968|66|28|64|62|66
russell|George Russell|GBR|1998|90|26|90|88|94
sainz|Carlos Sainz|ESP|1994|88|28|92|84|86
sala|Luis Perez-Sala|ESP|1959|70|30|72|68|70
salo|Mika Salo|FIN|1966|80|32|80|82|78
salvadori|Roy Salvadori|GBR|1922|78|34|80|74|76
sargeant|Logan Sargeant|USA|2000|74|23|70|72|76
sato|Takuma Sato|JPN|1977|78|26|72|80|80
scarfiotti|Ludovico Scarfiotti|ITA|1933|80|33|78|76|78
scheckter|Jody Scheckter|RSA|1950|92|29|84|88|84
schell|Harry Schell|USA|1921|80|35|74|82|78
schenken|Tim Schenken|AUS|1943|76|28|78|74|74
schumacher|Michael Schumacher|GER|1969|99|33|94|98|94
senna|Ayrton Senna|BRA|1960|99|30|84|99|99
siffert|Jo Siffert|SUI|1936|84|33|78|86|82
silva|Hermano da Silva Ramos|BRA|1925|72|31|70|68|70
sirotkin|Sergey Sirotkin|RUS|1995|74|23|76|70|74
snakajima|Satoru Nakajima|JPN|1953|76|35|80|70|74
sommer|Raymond Sommer|FRA|1906|80|44|74|78|82
speed|Scott Speed|USA|1983|74|23|68|74|78
spence|Mike Spence|GBR|1936|80|28|78|76|80
stevens|Will Stevens|GBR|1991|70|23|72|66|68
stewart|Jackie Stewart|GBR|1939|97|32|98|96|90
stommelen|Rolf Stommelen|GER|1943|76|29|74|76|74
streiff|Philippe Streiff|FRA|1955|74|32|76|70|72
stroll|Lance Stroll|CAN|1998|76|24|80|72|78
stuck|Hans-Joachim Stuck|GER|1951|80|25|74|82|78
sullivan|Danny Sullivan|USA|1950|78|35|80|74|80
surer|Marc Surer|SUI|1951|76|32|80|72|74
surtees|John Surtees|GBR|1934|92|30|90|82|90
sutil|Adrian Sutil|GER|1983|78|26|76|76|80
suzuki|Aguri Suzuki|JPN|1960|74|30|72|74|74
takagi|Toranosuke Takagi|JPN|1974|72|25|68|70|74
tambay|Patrick Tambay|FRA|1949|84|34|86|80|80
tfabi|Teo Fabi|ITA|1955|80|29|78|74|86
trintignant|Maurice Trintignant|FRA|1917|82|38|88|76|78
trulli|Jarno Trulli|ITA|1974|84|30|90|74|94
tsunoda|Yuki Tsunoda|JPN|2000|82|23|72|80|84
ttaylor|Trevor Taylor|GBR|1936|76|27|72|74|78
tuero|Esteban Tuero|ARG|1978|68|20|62|66|72
vandoorne|Stoffel Vandoorne|BEL|1992|80|25|84|76|82
vdgarde|Giedo van der Garde|NED|1985|74|28|76|70|74
vergne|Jean-Eric Vergne|FRA|1990|80|24|78|78|82
verstappen|Max Verstappen|NED|1997|99|26|92|98|96
vettel|Sebastian Vettel|GER|1987|96|26|96|90|94
villoresi|Luigi Villoresi|ITA|1909|86|43|84|82|84
vontrips|Wolfgang von Trips|GER|1928|86|32|76|84|86
warwick|Derek Warwick|GBR|1954|84|30|82|80|82
watson|John Watson|GBR|1946|84|36|86|80|78
webber|Mark Webber|AUS|1976|88|34|92|86|82
wehrlein|Pascal Wehrlein|GER|1994|78|22|80|74|80
wendlinger|Karl Wendlinger|AUT|1968|76|25|74|78|76
wfittipaldi|Wilson Fittipaldi|BRA|1943|72|29|74|70|70
wisell|Reine Wisell|SWE|1941|76|30|74|74|76
wurz|Alexander Wurz|AUT|1974|80|24|82|84|78
yamamoto|Sakon Yamamoto|JPN|1982|66|25|64|62|66
yoong|Alex Yoong|MAS|1976|64|26|60|62|66
zanardi|Alex Zanardi|ITA|1966|78|31|72|80|80
zhou|Zhou Guanyu|CHN|1999|78|24|80|74|78
zonta|Ricardo Zonta|BRA|1976|76|24|74|72|76
`;

export type DriverProfile = {
  id: string;
  name: string;
  nat: string;
  born: number;
  peak: number;
  peakAge: number;
  consistency: number;
  wet: number;
  quali: number;
};

export const DRIVERS: Record<string, DriverProfile> = Object.fromEntries(
  DRIVER_SRC.trim()
    .split("\n")
    .map((line) => {
      const [id, name, nat, born, peak, peakAge, consistency, wet, quali] = line.split("|");
      const profile: DriverProfile = {
        id,
        name,
        nat,
        born: Number(born),
        peak: Number(peak),
        peakAge: Number(peakAge),
        consistency: Number(consistency),
        wet: Number(wet),
        quali: Number(quali),
      };
      return [id, profile];
    }),
);

export function makeDriver(id: string, form = 0): DriverState {
  const profile = DRIVERS[id];
  if (!profile) throw new Error(`Piloto sin ficha: ${id}`);
  return {
    ...profile,
    generated: false,
    form,
    contract: 1,
    retired: false,
  };
}

export function ageCurve(age: number, peakAge: number, consistency: number): number {
  const dist = age - peakAge;
  if (dist < -8) return clamp(0.6 + (dist + 12) * 0.015, 0.55, 0.72);
  if (dist < 0) return 0.74 + (0.26 * (dist + 8)) / 8;
  const rate = 0.008 + (100 - consistency) * 0.00035;
  return clamp(1 - Math.max(0, dist - 1) * rate, 0.58, 1);
}

export function rated(driver: DriverState, year: number): { race: number; quali: number; wet: number } {
  const m = ageCurve(year - driver.born, driver.peakAge, driver.consistency);
  return {
    race: clamp(driver.peak * m + driver.form, 42, 99),
    quali: clamp(driver.quali * m + driver.form * 0.5, 42, 99),
    wet: clamp(driver.wet * m + driver.form * 0.4, 42, 99),
  };
}

export const NUMBERS: Record<string, number> = {
  fangio: 2,
  ascari: 4,
  moss: 6,
  clark: 4,
  stewart: 5,
  senna: 12,
  prost: 1,
  schumacher: 1,
  hakkinen: 8,
  hamilton: 44,
  verstappen: 1,
  alonso: 14,
  vettel: 5,
  leclerc: 16,
  norris: 4,
  piastri: 81,
  russell: 63,
  antonelli: 12,
  sainz: 55,
  perez: 11,
  bottas: 77,
  albon: 23,
  gasly: 10,
  ocon: 31,
  stroll: 18,
  hulkenberg: 27,
  bearman: 87,
  hadjar: 6,
  lawson: 30,
  lindblad: 41,
  colapinto: 43,
  bortoleto: 5,
  tsunoda: 22,
  ricciardo: 3,
  raikkonen: 7,
  mick: 47,
  zhou: 24,
  lauda: 11,
  hunt: 11,
  mansell: 5,
  piquet: 6,
  hill: 0,
};
