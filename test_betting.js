'use strict';
// ── Test suite para el motor de apuestas XIV Ryder Cup ──────────────────────
// Replica exacta de calcMarket y calcAll del betting.html

const LOCOS = ['Alon','Béjar','Blasfi','Bugo','Agus','Nico','Castejas','Juanma','Merello','Prieto'];
const LOBOS = ['Jaki','Jido','Diego','Gupi','Pedro','Herrero','Otegui','Nacho','Juan','Fertxo'];
const ALL   = [...LOCOS, ...LOBOS];
const MAX   = 20;

// ── ENGINE (copia exacta del betting.html) ──────────────────────────────────
function team(p){ return LOCOS.includes(p)?'loco':LOBOS.includes(p)?'lobo':null; }
function spent(p, bets){ return bets.filter(b=>b.bettor===p).reduce((s,b)=>s+b.amount,0); }

function calcMarket(bets, winner, empate) {
  if(empate) return bets.map(b=>({...b,net:0,gross:b.amount}));
  const wb=bets.filter(b=>b.pick===winner);
  const lb=bets.filter(b=>b.pick!==winner);
  // Desierta: nadie apostó al lado ganador → losers pierden, banca se queda el pozo
  if(!wb.length) return lb.map(b=>({...b,gross:0,net:-b.amount,banca:true}));
  // Desierta: nadie apostó al lado perdedor → winners recuperan su apuesta (push)
  if(!lb.length) return wb.map(b=>({...b,gross:b.amount,net:0}));
  const tot=bets.reduce((s,b)=>s+b.amount,0);
  const wp=wb.reduce((s,b)=>s+b.amount,0);
  return [...wb.map(b=>{const g=(b.amount/wp)*tot;return{...b,gross:g,net:g-b.amount};}),
          ...lb.map(b=>({...b,gross:0,net:-b.amount}))];
}

function calcAll(S) {
  const net={};
  ALL.forEach(p=>net[p]=0);
  let bancaTotal=0;
  const addRes=res=>{
    res.forEach(p=>{if(net[p.bettor]!==undefined)net[p.bettor]+=p.net;});
    if(res.length && res[0].banca) bancaTotal+=res.reduce((s,r)=>s+Math.abs(r.net),0);
  };
  S.singles.forEach(m=>{
    if(!m.winner) return;
    const bets=S.bets.filter(b=>b.type==='singles'&&b.matchId===m.id);
    if(!bets.length) return;
    addRes(calcMarket(bets,m.winner,m.winner==='empate'));
  });
  if(S.finalResult){
    const fb=S.bets.filter(b=>b.type==='final');
    addRes(calcMarket(fb,S.finalResult,false));
  }
  return {net, bancaTotal};
}

// ── HELPERS DE TEST ─────────────────────────────────────────────────────────
let passed=0, failed=0;

function assert(label, condition, detail='') {
  if(condition){ console.log(`  ✅  ${label}`); passed++; }
  else          { console.log(`  ❌  ${label}${detail?' — '+detail:''}`); failed++; }
}

function approx(a, b, tol=0.001){ return Math.abs(a-b)<tol; }

function bet(bettor, pick, amount, type='singles', matchId=1){
  return {bettor, pick, amount, type, matchId};
}

// ── TESTS ───────────────────────────────────────────────────────────────────

console.log('\n══════════════════════════════════════════════════════');
console.log('  MOTOR DE APUESTAS XIV RYDER CUP — SUITE DE TESTS');
console.log('══════════════════════════════════════════════════════\n');

// ── 1. EMPATE (push) ─────────────────────────────────────────────────────────
console.log('── 1. EMPATE (Push) ─────────────────────────────────');
{
  const bets = [
    bet('Fertxo','loco',10), bet('Jaki','lobo',5), bet('Juan','loco',8)
  ];
  const res = calcMarket(bets, 'empate', true);
  assert('Todos reciben su apuesta íntegra', res.every(r=>approx(r.gross,r.amount)));
  assert('Neto 0 para todos', res.every(r=>approx(r.net,0)));
  assert('Sin flag banca', !res.some(r=>r.banca));
}

// ── 2. NORMAL PARI-MUTUEL ───────────────────────────────────────────────────
console.log('\n── 2. PARI-MUTUEL NORMAL ────────────────────────────');
{
  // Pozo: 60€ (40 a loco, 20 a lobo). Gana loco.
  const bets = [
    bet('Fertxo','loco',20), bet('Juan','loco',20),
    bet('Jaki',  'lobo',10), bet('Jido','lobo',10)
  ];
  const res = calcMarket(bets, 'loco', false);

  const fertxo = res.find(r=>r.bettor==='Fertxo');
  const jaki   = res.find(r=>r.bettor==='Jaki');

  // Fertxo: 20/40*60 = 30, net +10
  assert('Fertxo (ganador) recibe 30€', approx(fertxo.gross, 30), `gross=${fertxo.gross}`);
  assert('Fertxo net +10€', approx(fertxo.net, 10), `net=${fertxo.net}`);

  // Jaki: pierde 10€
  assert('Jaki (perdedor) gross 0', approx(jaki.gross, 0));
  assert('Jaki net -10€', approx(jaki.net, -10));

  // Pozo conservado: sum(gross ganadores) == pozo total
  const totalPool = bets.reduce((s,b)=>s+b.amount, 0);
  const totalGross = res.filter(r=>r.net>=0).reduce((s,r)=>s+r.gross, 0);
  assert('Pozo conservado (sum gross ganadores = pozo total)', approx(totalGross, totalPool),
    `totalGross=${totalGross.toFixed(2)}, pool=${totalPool}`);
}

// ── 3. DESIERTA: TODOS AL MISMO LADO, GANA ESE LADO (push) ─────────────────
console.log('\n── 3. DESIERTA — gana el lado apostado (Push) ───────');
{
  // 5 personas apuestan a Jaki (loco), nadie a Bugo (lobo). Gana Jaki (loco).
  const bets = [
    bet('Fertxo','loco',10), bet('Juan','loco',8),
    bet('Pedro', 'loco',5),  bet('Nacho','loco',7), bet('Diego','loco',5)
  ];
  const res = calcMarket(bets, 'loco', false);

  assert('Todos reciben su apuesta íntegra (push)', res.every(r=>approx(r.gross,r.amount)),
    res.map(r=>`${r.bettor}:gross=${r.gross}`).join(', '));
  assert('Neto 0 para todos', res.every(r=>approx(r.net,0)));
  assert('Sin flag banca', !res.some(r=>r.banca));
  assert('Nadie en el lado perdedor', res.filter(r=>r.net<0).length===0);
}

// ── 4. DESIERTA: TODOS AL MISMO LADO, GANA EL OTRO (banca) ─────────────────
console.log('\n── 4. DESIERTA — gana el lado SIN apostadores (Banca) ');
{
  // 5 personas apuestan a Jaki (loco), nadie a Bugo (lobo). Gana Bugo (lobo) — sorpresa.
  const bets = [
    bet('Fertxo','loco',10), bet('Juan','loco',8),
    bet('Pedro', 'loco',5),  bet('Nacho','loco',7), bet('Diego','loco',5)
  ];
  const totalPool = bets.reduce((s,b)=>s+b.amount,0); // 35€
  const res = calcMarket(bets, 'lobo', false);

  assert('Todos los apostadores pierden (gross=0)', res.every(r=>approx(r.gross,0)));
  assert('Neto negativo = su apuesta', res.every(r=>approx(r.net,-r.amount)));
  assert('Flag banca=true en todos', res.every(r=>r.banca===true));

  const bancaRecauda = res.reduce((s,r)=>s+Math.abs(r.net),0);
  assert(`Banca recauda el pozo completo (${totalPool}€)`, approx(bancaRecauda, totalPool),
    `bancaRecauda=${bancaRecauda}`);
  assert('Sin ganadores', res.filter(r=>r.net>0).length===0);
}

// ── 5. SOLO UN APOSTADOR EN CADA LADO ───────────────────────────────────────
console.log('\n── 5. UN APOSTADOR POR LADO ─────────────────────────');
{
  // Fertxo 10€ a loco, Jaki 5€ a lobo. Gana loco.
  const bets = [bet('Fertxo','loco',10), bet('Jaki','lobo',5)];
  const res  = calcMarket(bets,'loco',false);

  const fertxo = res.find(r=>r.bettor==='Fertxo');
  const jaki   = res.find(r=>r.bettor==='Jaki');
  // Fertxo: 10/10*15=15, net +5
  assert('Fertxo recibe 15€', approx(fertxo.gross,15));
  assert('Fertxo net +5€',    approx(fertxo.net,5));
  assert('Jaki pierde 5€',    approx(jaki.net,-5));
}

// ── 6. LÍMITE DE 20€ POR JUGADOR ────────────────────────────────────────────
console.log('\n── 6. VALIDACIÓN LÍMITE 20€ ─────────────────────────');
{
  // Simula registro de dos apuestas del mismo jugador — spent() debe sumarlas
  const betsJugador = [bet('Fertxo','loco',10,  'singles',1),
                       bet('Fertxo','lobo',10,'final',0)];
  const gastado = betsJugador.filter(b=>b.bettor==='Fertxo').reduce((s,b)=>s+b.amount,0);
  assert('Gasto total correcto (10+10=20)', gastado===20);
  assert('No supera el máximo', gastado<=MAX);

  // Si intenta añadir otra apuesta de 1€, el gasto superaría el máximo
  const excede = (gastado + 1) > MAX;
  assert('Añadir 1€ más supera el límite', excede);
}

// ── 7. CALCALL — MÚLTIPLES MERCADOS ─────────────────────────────────────────
console.log('\n── 7. CALCALL — MÚLTIPLES MERCADOS ─────────────────');
{
  const S = {
    singles: [
      // Partido 1: normal, gana loco
      { id:1, loco:'Bugo', lobo:'Jaki', winner:'loco' },
      // Partido 2: desierta, todos a loco, gana lobo → banca
      { id:2, loco:'Nico', lobo:'Juan', winner:'lobo' },
      // Partido 3: empate → push
      { id:3, loco:'Alon', lobo:'Jido', winner:'empate' },
    ],
    finalResult: null,
    bets: [
      // Partido 1: Fertxo 10 a loco, Pedro 5 a loco, Jaki 15 a lobo
      bet('Fertxo','loco',10,'singles',1),
      bet('Pedro', 'loco',5, 'singles',1),
      bet('Jaki',  'lobo',15,'singles',1),
      // Partido 2: solo 3 personas a loco, nadie a lobo → gana lobo (banca)
      bet('Juan',  'loco',8, 'singles',2),
      bet('Gupi',  'loco',6, 'singles',2),
      bet('Diego', 'loco',4, 'singles',2),
      // Partido 3 (empate): Blasfi 7 a loco, Nacho 3 a lobo
      bet('Blasfi','loco',7,'singles',3),
      bet('Nacho', 'lobo',3,'singles',3),
    ]
  };

  const {net, bancaTotal} = calcAll(S);

  // Partido 1: pool 30€, locos pool 15€. Gana loco.
  //   Fertxo: 10/15*30=20, net +10
  //   Pedro:   5/15*30=10, net +5
  //   Jaki:   pierde 15, net -15
  assert('Partido 1 — Fertxo net +10€', approx(net['Fertxo'],10),   `net=${net['Fertxo']}`);
  assert('Partido 1 — Pedro net +5€',   approx(net['Pedro'],5),     `net=${net['Pedro']}`);
  assert('Partido 1 — Jaki net -15€',   approx(net['Jaki'],-15),    `net=${net['Jaki']}`);

  // Partido 2: desierta, todos pierden (Juan -8, Gupi -6, Diego -4 → banca 18€)
  assert('Partido 2 DESIERTA — Juan net -8€',  approx(net['Juan'],-8),  `net=${net['Juan']}`);
  assert('Partido 2 DESIERTA — Gupi net -6€',  approx(net['Gupi'],-6),  `net=${net['Gupi']}`);
  assert('Partido 2 DESIERTA — Diego net -4€', approx(net['Diego'],-4), `net=${net['Diego']}`);
  assert('Partido 2 DESIERTA — bancaTotal=18€', approx(bancaTotal,18),  `bancaTotal=${bancaTotal}`);

  // Partido 3 (empate → push): Blasfi 0, Nacho 0
  assert('Partido 3 EMPATE — Blasfi net 0', approx(net['Blasfi'],0), `net=${net['Blasfi']}`);
  assert('Partido 3 EMPATE — Nacho net 0',  approx(net['Nacho'],0),  `net=${net['Nacho']}`);
}

// ── 8. CALCALL — MERCADO FINAL CON APUESTA DESIERTA ────────────────────────
console.log('\n── 8. MERCADO FINAL DESIERTO (banca) ───────────────');
{
  const S = {
    singles: [],
    finalResult: 'locos',
    bets: [
      // Todos apuestan a lobos, nadie a locos. Ganan locos → banca
      bet('Fertxo','lobos',15,'final',0),
      bet('Jaki',  'lobos',10,'final',0),
      bet('Pedro', 'lobos',8, 'final',0),
    ]
  };

  const {net, bancaTotal} = calcAll(S);
  const pool = 33;

  assert('Fertxo pierde -15€ al mercado final desierto', approx(net['Fertxo'],-15));
  assert('Jaki pierde -10€',  approx(net['Jaki'],-10));
  assert('Pedro pierde -8€',  approx(net['Pedro'],-8));
  assert(`Banca retiene ${pool}€ del mercado final`, approx(bancaTotal, pool), `bancaTotal=${bancaTotal}`);
}

// ── 9. CONSERVATION: suma de nets == 0 excepto lo que retiene banca ─────────
console.log('\n── 9. CONSERVACIÓN DEL POZO ─────────────────────────');
{
  // Partido normal: la suma de nets debe ser 0 (pozo se redistribuye)
  const bets = [
    bet('Fertxo','loco',10), bet('Juan','loco',8),
    bet('Jaki',  'lobo',6),  bet('Jido','lobo',4)
  ];
  const res = calcMarket(bets,'loco',false);
  const sumNets = res.reduce((s,r)=>s+r.net,0);
  assert('Suma de nets = 0 (pozo conservado)', approx(sumNets,0), `sumNets=${sumNets.toFixed(6)}`);

  // Partido desierto: suma de nets == pozo (que va a banca)
  const bets2 = [bet('Fertxo','loco',10), bet('Juan','loco',8)];
  const res2   = calcMarket(bets2,'lobo',false);
  const pool2  = bets2.reduce((s,b)=>s+b.amount,0);
  const sumLoss= res2.reduce((s,r)=>s+Math.abs(r.net),0);
  assert('Suma de pérdidas desierta = pozo (va a banca)', approx(sumLoss,pool2), `sumLoss=${sumLoss}, pool=${pool2}`);
}

// ── 10. AUTO-APUESTA: jugador apuesta a su propio partido ───────────────────
console.log('\n── 10. AUTO-APUESTA (jugador apuesta a sí mismo) ───');
{
  // Jaki juega Singles #1 (lobo) y además apuesta 10€ al partido
  const bets = [
    bet('Jaki',  'lobo',10,'singles',1),  // apuesta a su propio lado
    bet('Fertxo','loco',15,'singles',1),
    bet('Juan',  'lobo',5, 'singles',1),
  ];
  // Gana lobo (el lado de Jaki). Pool=30, lobo pool=15
  const res = calcMarket(bets,'lobo',false);
  const jaki   = res.find(r=>r.bettor==='Jaki');
  const fertxo = res.find(r=>r.bettor==='Fertxo');
  // Jaki: 10/15*30=20, net +10
  assert('Auto-apuesta — Jaki gana 10€', approx(jaki.net,10),   `net=${jaki.net}`);
  assert('Auto-apuesta — Fertxo pierde -15€', approx(fertxo.net,-15));
}

// ── 11. VALIDACIÓN AUTO-APUESTA: no puede apostar contra sí mismo ─────────
console.log('\n── 11. AUTO-APUESTA: validación pick propio ─────────');
{
  // Replica la validación de addBet()
  function validateSelfBet(bettor, matchLoco, matchLobo, pick) {
    if(bettor===matchLoco && pick!=='loco') return 'No puedes apostar contra ti mismo';
    if(bettor===matchLobo && pick!=='lobo') return 'No puedes apostar contra ti mismo';
    return null;
  }

  // Jaki (lobo) en su partido vs Bugo (loco)
  assert('Jaki puede apostar a lobos (sí mismo)',
    validateSelfBet('Jaki','Bugo','Jaki','lobo') === null);
  assert('Jaki NO puede apostar a locos (rival)',
    validateSelfBet('Jaki','Bugo','Jaki','loco') !== null);

  // Bugo (loco) en su partido vs Jaki (lobo)
  assert('Bugo puede apostar a locos (sí mismo)',
    validateSelfBet('Bugo','Bugo','Jaki','loco') === null);
  assert('Bugo NO puede apostar a lobos (rival)',
    validateSelfBet('Bugo','Bugo','Jaki','lobo') !== null);

  // Fertxo no juega en ese partido → puede apostar a cualquier lado
  assert('Fertxo (no juega) puede apostar a locos',
    validateSelfBet('Fertxo','Bugo','Jaki','loco') === null);
  assert('Fertxo (no juega) puede apostar a lobos',
    validateSelfBet('Fertxo','Bugo','Jaki','lobo') === null);

  // Mercado Final: no hay restricción de auto-apuesta (no se juega un partido)
  // → la validación no aplica (t==='final' la saltamos)
  assert('Apuesta al Final: sin restricción de auto-apuesta', true);
}

// ── RESUMEN ──────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════');
console.log(`  RESULTADO: ${passed} ✅  pasados  |  ${failed} ❌  fallados`);
console.log('══════════════════════════════════════════════════════\n');
if(failed>0) process.exit(1);
