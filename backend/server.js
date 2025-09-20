import { WebSocketServer } from "ws";
import { randomUUID } from "crypto";

/* ===== Config serveur ===== */
const PORT = Number(process.env.PORT || 8080);
const wss = new WebSocketServer({ port: PORT });
console.log("WS listening on", PORT);

/* ===== Cartes & utils ===== */
const RANKS = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
const SUITS = ["\u2660","\u2665","\u2666","\u2663"]; // ♠ ♥ ♦ ♣
const PUSH_ORANGE = "#f79621";

function makeShoe(decks=1){
  const d=[]; for(let n=0;n<decks;n++) for(const s of SUITS) for(const r of RANKS) d.push({rank:r,suit:s});
  return shuffle(d);
}
function shuffle(a){ const arr=a.slice(); for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]];} return arr; }
function draw(deck){ return { card: deck[0], rest: deck.slice(1) }; }
function faceVal(c){ if(c.rank==="A") return 11; if(["K","Q","J","10"].includes(c.rank)) return 10; return parseInt(c.rank,10); }
function totals(cards){ let t=0,a=0; for(const c of cards){ if(c.rank==="A"){a++; t+=11;} else t+=faceVal(c);} const out=[t]; while(a>0){ t-=10; a--; out.push(t);} return [...new Set(out)].sort((x,y)=>y-x); }
function best(cards){ const t=totals(cards); return t.find(x=>x<=21) ?? t[t.length-1]; }
function isBJ(cards){ return cards.length===2 && best(cards)===21; }
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
function short(){ return Math.random().toString(36).slice(2,8); }

// IDs de partie au format "ChiffreChiffreLettreLettre" (ex: 12AB)
function generateMatchIdCustom(){
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  
  const digit1 = digits[Math.floor(Math.random() * digits.length)];
  const digit2 = digits[Math.floor(Math.random() * digits.length)];
  const letter1 = letters[Math.floor(Math.random() * letters.length)];
  const letter2 = letters[Math.floor(Math.random() * letters.length)];
  
  return `${digit1}${digit2}${letter1}${letter2}`;
}

function generateUniqueMatchId(){
  let id;
  do {
    id = generateMatchIdCustom();
  } while (matches.has(id));
  return id;
}

/* ===== Gestion des connexions ===== */
const connections = new Set(); // { ws, matchId?, playerId?, token? }
const matches = new Map(); // id -> match

function send(c, type, payload){ try{ c.ws.send(JSON.stringify({ type, ...payload })); }catch{} }
function bcast(matchId, type, payload){ for(const c of connections) if(c.matchId===matchId) send(c,type,payload); }
function snapshot(m){
  return {
    id:m.id, phase:m.phase, round:m.round, order:m.order, dealer:m.dealer, turn:m.turn,
    players: m.order.map(pid => {
      const p=m.players[pid];
      return { id:p.id, name:p.name, totalDrank:p.totalDrank, totalDistributed:p.totalDistributed, connected:p.connected, hands:p.hands, active:p.active };
    })
  };
}
function pushState(m){ bcast(m.id,"state",{ snapshot: snapshot(m) }); }

/* ===== création de partie ===== */
function newMatch(ownerId, name, token){
  const id = generateUniqueMatchId();
  const m = {
    id, createdAt: Date.now(), round: 0,
    phase: "lobby",
    deck: makeShoe(1),
    dealer: { cards: [], hidden: true },
    players: { [ownerId]: { id:ownerId, name, token, totalDrank:0, totalDistributed:0, connected:true, hands:[], active:0 } },
    order: [ownerId],
    turn: undefined,
    pending: { needDrinkAck: new Set(), needDistributeAck: new Set() },
    cfg: { revealMs: 1000, betweenMs: 1600 }
  };
  matches.set(id,m);
  return m;
}

/* ===== flow de jeu ===== */
function startRound(m){
  m.round++;
  m.phase="deal";
  m.dealer={cards:[],hidden:true};
  m.pending.needDrinkAck.clear();
  m.pending.needDistributeAck.clear();

  if (m.deck.length<20) m.deck=makeShoe(1);

  for(const pid of m.order){
    const p=m.players[pid];
    p.hands=[{cards:[],bet:1}];
    p.active=0;
  }

  // distribution: 2 cartes aux joueurs + 2 au croupier (dont 1 cachée)
  for(let i=0;i<2;i++){
    for(const pid of m.order){
      const p=m.players[pid];
      let r=draw(m.deck); m.deck=r.rest; p.hands[0].cards.push(r.card);
    }
    let r=draw(m.deck); m.deck=r.rest; m.dealer.cards.push(r.card);
  }

  m.phase="turn";
  m.turn={ playerId:m.order[0], hand:0 };
  pushState(m);
}

async function dealerPlay(m){
  if(m.phase!=="dealer") return;
  m.dealer.hidden=false; pushState(m);
  await sleep(m.cfg.revealMs);
  while(best(m.dealer.cards)<17){
    let r=draw(m.deck); m.deck=r.rest; m.dealer.cards.push(r.card); pushState(m);
    await sleep(m.cfg.betweenMs);
  }
  m.phase="resolve"; pushState(m);
  await sleep(200);
  resolveRound(m);
}

function advanceToNext(m, idxFrom){
  for(let k=idxFrom+1;k<m.order.length;k++){
    const pid=m.order[k]; const pp=m.players[pid];
    if(pp && pp.hands.length){ m.turn={playerId:pid, hand:pp.active}; pushState(m); return; }
  }
  m.phase="dealer"; m.turn=undefined; pushState(m);
  dealerPlay(m).catch(()=>{});
}

function nextTurnOrDealer(m){
  if(m.phase!=="turn" || !m.turn) return;
  const idx=m.order.indexOf(m.turn.playerId);
  const p=m.players[m.turn.playerId];
  if(!p){ return advanceToNext(m, idx); }
  const nextHand=p.active+1;

  if(nextHand<p.hands.length){
    p.active=nextHand; m.turn={playerId:p.id, hand:nextHand}; pushState(m); return;
  }
  return advanceToNext(m, idx);
}

function canSplit(h){
  return h.cards.length===2 && faceVal(h.cards[0])===faceVal(h.cards[1]);
}

function applyAction(m, pid, action){
  if(m.phase!=="turn" || !m.turn || m.turn.playerId!==pid) return;
  const p=m.players[pid]; if(!p) return;
  const h=p.hands[p.active]; if(!h) return;

  if(action==="hit"){
    if(h.noHit) return;
    let r=draw(m.deck); m.deck=r.rest; h.cards.push(r.card); pushState(m);
    const v=best(h.cards);
    if(v>=21){ nextTurnOrDealer(m); }
    return;
  }

  if(action==="stand"){ nextTurnOrDealer(m); return; }

  if(action==="double"){
    if(h.cards.length!==2 || h.noHit) return;
    let r=draw(m.deck); m.deck=r.rest; h.cards.push(r.card); h.bet=(h.bet||1)*2; pushState(m);
    nextTurnOrDealer(m); return;
  }

  if(action==="split"){
    if(!canSplit(h)) return;
    const [c1,c2]=h.cards;
    let rA=draw(m.deck); m.deck=rA.rest;
    let rB=draw(m.deck); m.deck=rB.rest;
    const isAces=c1.rank==="A"&&c2.rank==="A";
    p.hands=[
      {cards:[c1,rA.card], bet:h.bet||1, noHit:isAces},
      {cards:[c2,rB.card], bet:h.bet||1, noHit:isAces},
    ];
    p.active=0;
    m.turn={playerId:pid, hand:0};
    pushState(m);
    return;
  }
}

function resolveRound(m){
  const dv=best(m.dealer.cards);
  const dealerBust=dv>21;
  const dealerBJ=isBJ(m.dealer.cards);

  let someoneBeats=false, anyLoss=false;

  for(const pid of m.order){
    const p=m.players[pid];
    if(!p) continue;
    for(const h of p.hands){
      const pv=best(h.cards); const bj=isBJ(h.cards);
      if(bj){ h.result="bj"; someoneBeats=true; continue; }
      if(pv>21){ h.result="player_bust"; anyLoss=true; continue; }
      if(dealerBust){ h.result="dealer_bust"; someoneBeats=true; continue; }
      if(pv>dv){ h.result="win"; someoneBeats=true; continue; }
      if(pv<dv){ h.result="lose"; anyLoss=true; continue; }
      if(pv===21 && dealerBJ && !bj){ h.result="lose"; anyLoss=true; }
      else h.result="push";
    }
  }

  const sanction = (!someoneBeats && anyLoss) ? 1 : 0;

  for(const pid of m.order){
    const p=m.players[pid];
    if(!p) continue;
    let youDrink=0, distribute=0;
    for(const h of p.hands){
      const bet=h.bet||1;
      if(h.result==="bj") distribute+=3;
      else if(h.result==="dealer_bust"||h.result==="win") distribute+=bet;
      else if(h.result==="lose"||h.result==="player_bust") youDrink+=bet;
    }
    youDrink += sanction;

    if(youDrink>0) m.pending.needDrinkAck.add(pid);
    if(distribute>0) m.pending.needDistributeAck.add(pid);

    sendModal(m,pid,youDrink,distribute,sanction);
  }

  m.phase="distribute";
  pushState(m);
}

function sendModal(m,pid,youDrink,distribute,sanction){
  const p=m.players[pid];
  if(!p) return;

  let headline="Résultats";
  if(p.hands.length===1){
    const r=p.hands[0].result;
    if(r==="push") headline="Push";
    else if(r==="win"||r==="dealer_bust") headline="Tu as gagné";
    else if(r==="bj") headline="Blackjack !!";
    else headline=(r==="player_bust")? "Tu as bust" : "Le croupier a gagné";
  }

  const details=[];
  if(p.hands.length>1){
    for(let i=0;i<p.hands.length;i++){
      const h=p.hands[i];
      const label=`Main ${i+1} — `;
      const color =
        h.result==="win"||h.result==="dealer_bust"||h.result==="bj" ? "#22c55e" :
        h.result==="push" ? PUSH_ORANGE : "#ef4444";
      const text =
        h.result==="push" ? `${label}Push` :
        h.result==="win" ? `${label}Tu as gagné` :
        h.result==="dealer_bust" ? `${label}Le croupier a bust` :
        h.result==="bj" ? `${label}Blackjack !!` :
        h.result==="player_bust" ? `${label}Tu as bust` :
        `${label}Le croupier a gagné`;
      details.push({ text, color, bold: h.result==="lose" });
    }
  }

  const preface = sanction>0 ? "+ Sanction collective" : undefined;
  const summary = youDrink>0 ? `Tu bois ${youDrink} ${youDrink===1?'gorgée':'gorgées'}` : undefined;
  const needConfirm = youDrink>0 || distribute>0;
  const confirmLabel = youDrink>0 ? "J’ai bu" : "C’est bon";
  const headlineColor =
    headline==="Push" ? PUSH_ORANGE :
    (headline==="Tu as gagné"||headline==="Blackjack !!") ? "#22c55e" :
    (headline==="Tu as bust"||headline==="Le croupier a gagné") ? "#ef4444" : undefined;

  const conn=[...connections].find(c=>c.playerId===pid && c.matchId===m.id);
  if(conn) send(conn,"modal",{ preface, headline, headlineColor, summary, distribute, details, requireConfirm: needConfirm, youDrink, confirmLabel });
}

function calcDrink(m,pid){
  const p=m.players[pid]; if(!p) return 0;
  const someoneBeats = Object.values(m.players).some(pp=> pp && pp.hands.some(h=> ["win","dealer_bust","bj"].includes(h.result)));
  const anyLoss = Object.values(m.players).some(pp=> pp && pp.hands.some(h=> ["lose","player_bust"].includes(h.result)));
  const sanction = !someoneBeats && anyLoss ? 1 : 0;
  let you=0; for(const h of p.hands){ const bet=h.bet||1; if(h.result==="lose"||h.result==="player_bust") you+=bet; }
  return you + sanction;
}

function resetToLobby(m){
  m.phase="lobby";
  m.dealer={cards:[], hidden:true};
  for(const id of m.order){ const p=m.players[id]; if(p){ p.hands=[]; p.active=0; } }
  m.pending.needDrinkAck.clear();
  m.pending.needDistributeAck.clear();
  pushState(m);
}

function onAck(m,pid,kind){
  if(kind==="drink" && m.pending.needDrinkAck.has(pid)){
    const drink=calcDrink(m,pid);
    const p=m.players[pid]; if(p) p.totalDrank += drink;
    m.pending.needDrinkAck.delete(pid);
  }
  if(kind==="distribute" && m.pending.needDistributeAck.has(pid)){
    const p=m.players[pid]; 
    if(p) {
      let distribute=0;
      for(const h of p.hands){
        const bet=h.bet||1;
        if(h.result==="bj") distribute+=3;
        else if(h.result==="dealer_bust"||h.result==="win") distribute+=bet;
      }
      p.totalDistributed += distribute;
    }
    m.pending.needDistributeAck.delete(pid);
  }
  if(m.pending.needDrinkAck.size===0 && m.pending.needDistributeAck.size===0){
    resetToLobby(m);
  }
}

/* ===== WebSocket wiring ===== */
wss.on("connection",(ws)=>{
  const c={ ws, matchId: undefined, playerId: undefined, token: undefined };
  connections.add(c);

  ws.on("message", async (buf)=>{
    let msg; try{ msg=JSON.parse(buf.toString()); }catch{ return; }
    const t=msg.type;

    if(t==="create_match"){
      const playerId=short(); const token=randomUUID();
      c.playerId=playerId; c.token=token;
      const m=newMatch(playerId, msg.name||"Joueur", token);
      c.matchId=m.id;
      send(c,"created",{ matchId:m.id, playerId, token });
      pushState(m);
      return;
    }

    if(t==="join_match"){
      const m=matches.get(msg.matchId); if(!m) return send(c,"error",{code:"NO_MATCH"});
      const playerId=short(); const token=randomUUID();
      m.players[playerId]={ id:playerId,name:msg.name||"Invité",token,totalDrank:0,totalDistributed:0,connected:true,hands:[],active:0 };
      m.order.push(playerId);
      c.matchId=m.id; c.playerId=playerId; c.token=token;
      send(c,"joined",{ matchId:m.id, playerId, token });
      pushState(m);
      return;
    }

    if(t==="reconnect"){
      const m=matches.get(msg.matchId); if(!m) return send(c,"error",{code:"NO_MATCH"});
      const pid = Object.keys(m.players).find(id => m.players[id].token === msg.token);
      if(!pid) return send(c,"error",{code:"NO_AUTH"});
      c.matchId=m.id; c.playerId=pid; c.token=msg.token;
      m.players[pid].connected=true;
      if (msg.name && typeof msg.name==="string") m.players[pid].name = msg.name;
      send(c,"rejoined",{ matchId:m.id, playerId: pid, token: msg.token });
      pushState(m);
      return;
    }

    if(t==="leave_match"){
      if(c.matchId && c.playerId){
        const m=matches.get(c.matchId);
        if(m){
          m.pending.needDrinkAck.delete(c.playerId);
          m.pending.needDistributeAck.delete(c.playerId);

          const wasHost = m.order[0] === c.playerId;
          const wasTurn = m.turn && m.turn.playerId === c.playerId;

          delete m.players[c.playerId];
          m.order = m.order.filter(id => id!==c.playerId);

          if (m.order.length===0){
            matches.delete(m.id);
          } else {
            if (wasTurn && m.phase==="turn"){
              advanceToNext(m, -1);
            }
            if(m.phase==="distribute" && m.pending.needDrinkAck.size===0 && m.pending.needDistributeAck.size===0){
              resetToLobby(m);
            } else {
              pushState(m);
            }
          }
        }
      }
      c.matchId=undefined; c.playerId=undefined; c.token=undefined;
      return;
    }

    const m=matches.get(c.matchId);
    if(!m) return;

    if(!c.playerId || !c.token || m.players[c.playerId]?.token!==c.token){
      return send(c,"error",{code:"AUTH"});
    }

    if(t==="start_round"){ if(m.phase==="lobby"||m.phase==="deal") startRound(m); return; }
    if(t==="action"){ applyAction(m, c.playerId, msg.action); return; }
    if(t==="drink_done"){ onAck(m, c.playerId, "drink"); return; }
    if(t==="distribute_done"){ onAck(m, c.playerId, "distribute"); return; }
  });

  ws.on("close", ()=>{
    try{
      if(c.matchId && c.playerId){
        const m=matches.get(c.matchId);
        if(m && m.players[c.playerId]){ m.players[c.playerId].connected=false; pushState(m); }
      }
    }finally{
      connections.delete(c);
    }
  });
});

