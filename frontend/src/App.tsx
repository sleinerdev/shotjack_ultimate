import { useEffect, useMemo, useRef, useState } from "react";
import { useWebSocket, waitForOpen } from "./hooks/useWebSocket";
import { useGameState } from "./hooks/useGameState";
import { Home } from "./components/Home";
import { CreatedScreen } from "./components/CreatedScreen";
import { LobbyHeader } from "./components/LobbyHeader";
import { TableHeader } from "./components/TableHeader";
import { LobbyList } from "./components/LobbyList";
import { CardsRow } from "./components/Card";
import { TotalPill } from "./components/TotalPill";
import { Controls } from "./components/Controls";
import { Overview } from "./components/Overview";
import { PlayersBand } from "./components/PlayersBand";
import { ResultModal } from "./components/ResultModal";
import { FlashOverlay } from "./components/FlashOverlay";
import { WaitingOverlay } from "./components/WaitingOverlay";
import { SettingsModal } from "./components/SettingsModal";
import { RulesModal } from "./components/RulesModal";
import { getRandomName } from "./utils/names";
import { safeTotals, isBlackjack, canSplit, canDouble } from "./utils/game";
import { WS_URL, TIMEOUTS } from "./constants";
import type { ServerModal } from "./types";

export default function App() {
  // Charger la session initiale
  const initialSession = (() => {
    try {
      const raw = localStorage.getItem("sj_session");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const [screen, setScreen] = useState<"home" | "created" | "online">("home");
  const [name, setName] = useState<string>(() =>
    initialSession?.name || getRandomName()
  );

  const {
    snapshot,
    setSnapshot,
    me,
    setMe,
    modal,
    setModal,
    flash,
    setFlash,
    showSettings,
    setShowSettings,
    showOverview,
    setShowOverview,
    awaitingOthers,
    setAwaitingOthers,
    ackedRoundRef,
    lastStateRoundRef,
    prevRoundRef,
    processedRef,
    leftRef,
    persistSession,
    loadSession,
    clearSession,
    mePlayer,
    myTurn,
    myActiveHand,
    isHost,
  } = useGameState();

  const { open, send, messages, wsRef, clearQueue } = useWebSocket(
    screen !== "home" ? WS_URL : "ws://invalid"
  );

  const flashPersistRef = useRef(false);
  const autoBJRef = useRef(false);
  const overviewBtnRef = useRef<HTMLButtonElement>(null);
  const [showRules, setShowRules] = useState(false);
  const [overviewDisabled, setOverviewDisabled] = useState(false);

  const hardCloseSocket = () => {
    try {
      wsRef.current?.close();
    } catch (error) {
      console.warn('Error closing socket:', error);
    }
  };

  const resetToHome = () => {
    leftRef.current = true; // Bloquer les messages tardifs
    try {
      if (me?.matchId) send({ type: "leave_match" });
    } catch (error) {
      console.warn('Error sending leave message:', error);
    }
    
    // Nettoyer tous les états
    clearSession();
    setShowSettings(false);
    setShowOverview(false);
    setModal(null);
    setAwaitingOthers(false);
    setSnapshot(null);
    setMe(null);
    processedRef.current = 0;
    
    // Reset leftRef après un court délai pour permettre au message leave_match d'être envoyé
    setTimeout(() => {
      leftRef.current = false;
    }, 100);
    
    clearQueue(); // Nettoyer la file d'attente WebSocket
    hardCloseSocket();
    
    // S'assurer que l'écran revient à home
    setScreen("home");
  };

  const createMatch = () => {
    const finalName = name || getRandomName();
    const action = () => send({ type: "create_match", name: finalName });
    setScreen("created");
    if (!open) waitForOpen(wsRef, action);
    else action();
  };

  const joinMatch = (id: string) => {
    const finalName = name || getRandomName();
    const action = () => send({ type: "join_match", matchId: id, name: finalName });
    setScreen("online");
    if (!open) waitForOpen(wsRef, action);
    else action();
  };

  const startRound = () => send({ type: "start_round" });
  const sendAction = (action: "hit" | "stand" | "double" | "split") => 
    send({ type: "action", action });

   // Tentative de reconnexion si session existante (seulement au démarrage)
   useEffect(() => {
     if (screen !== "home") return;
     if (leftRef.current) return; // Ne pas se reconnecter si on a quitté explicitement
     
     const session = loadSession();
     if (!session) return;

     // Reconnexion automatique uniquement au démarrage de l'app
     const doReconnect = () => {
       setScreen("online");
       send({
         type: "reconnect",
         matchId: session.matchId,
         token: session.token,
         name: name || session.name || getRandomName()
       });
     };

     if (!open) waitForOpen(wsRef, doReconnect);
     else doReconnect();
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [open]);

  // Traitement des messages WebSocket
  useEffect(() => {
    for (let i = processedRef.current; i < messages.length; i++) {
      if (leftRef.current) continue; // Ignorer si on a quitté
      
      const msg = messages[i];

      // Note: pas de gestionnaire "left" car le serveur n'envoie plus ce message

      if (msg.type === "created") {
        leftRef.current = false; // Reset après confirmation serveur
        const session = { playerId: msg.playerId, matchId: msg.matchId, token: msg.token, name };
        setMe(session);
        persistSession(session);
      }

      if (msg.type === "joined") {
        leftRef.current = false; // Reset après confirmation serveur
        const session = { playerId: msg.playerId, matchId: msg.matchId, token: msg.token, name };
        setMe(session);
        persistSession(session);
      }

      if (msg.type === "rejoined") {
        leftRef.current = false; // Reset après confirmation serveur
        const session = { playerId: msg.playerId, matchId: msg.matchId, token: msg.token, name };
        setMe(session);
        setScreen("online");
      }

      if (msg.type === "state") {
        const round = msg.snapshot.round;
        const phase = msg.snapshot.phase;

        // Reset client quand le round avance
        if (round > (prevRoundRef.current || 0)) {
          setModal(null);
          if (flashPersistRef.current) {
            flashPersistRef.current = false;
          }
          setFlash(null);
          setAwaitingOthers(false);
          ackedRoundRef.current = null;
        }
        prevRoundRef.current = round;
        lastStateRoundRef.current = round;

        // Éviter le flash du lobby - ne pas afficher lobby si on est en attente
        if (phase === "lobby" && awaitingOthers) {
          // Ne pas mettre à jour le snapshot pour éviter le flash
          // Le snapshot sera mis à jour quand la phase change
        } else {
          setSnapshot(msg.snapshot);
        }

        if (awaitingOthers) {
          const advanced = (ackedRoundRef.current !== null && round > ackedRoundRef.current);
          if (advanced || (phase !== "resolve" && phase !== "distribute")) {
            setAwaitingOthers(false);
            ackedRoundRef.current = null;
            const hostNow = msg.snapshot.order[0] === (me?.playerId || "");
            if (hostNow && phase === "lobby") {
              send({ type: "start_round" });
            }
          }
        }
      }

      if (msg.type === "modal") {
        const roundNow = lastStateRoundRef.current ?? 0;
        if (awaitingOthers && ackedRoundRef.current === roundNow) continue;

        const modal = msg as ServerModal;
        const headlineColor = (modal.headlineColor || "").toLowerCase();
        const isWin = headlineColor.includes("22c55e");
        const isLose = headlineColor.includes("ef4444");

        flashPersistRef.current = false;
        if (isLose) {
          setFlash({ color: "red", text: "PERDU" });
          if (modal.requireConfirm) flashPersistRef.current = true;
          else setTimeout(() => setFlash(null), TIMEOUTS.FLASH_DURATION);
        } else if (isWin) {
          setFlash({ color: "green", text: "GAGNÉ" });
          if (modal.requireConfirm) flashPersistRef.current = true;
          else setTimeout(() => setFlash(null), TIMEOUTS.FLASH_DURATION);
        } else {
          setFlash({ color: "orange", text: "PUSH" });
          setTimeout(() => setFlash(null), TIMEOUTS.FLASH_DURATION);
        }

        setModal(modal);

        if (!modal.requireConfirm) {
          ackedRoundRef.current = roundNow;
          setAwaitingOthers(true);
          setTimeout(() => {
            if (leftRef.current) return;
            setModal(null);
            send({ type: "distribute_done" });
          }, TIMEOUTS.MODAL_AUTO_CLOSE);
        }
      }
    }
    processedRef.current = messages.length;
  }, [messages, me?.playerId, send, name, clearSession, persistSession]);

  // Totaux du croupier visibles
  const dealerVisible = useMemo(() => {
    if (!snapshot) return [];
    return snapshot.dealer.hidden ? snapshot.dealer.cards.slice(0, 1) : snapshot.dealer.cards;
  }, [snapshot]);

  // Auto stand si blackjack
  useEffect(() => {
    if (myTurn && myActiveHand && isBlackjack(myActiveHand.cards) && !autoBJRef.current) {
      autoBJRef.current = true;
      send({ type: "action", action: "stand" });
    }
    if (snapshot?.phase !== "turn") autoBJRef.current = false;
  }, [myTurn, myActiveHand, snapshot?.phase, send]);

  const controlsDisabled =
    !myTurn || 
    !myActiveHand || 
    !!modal || 
    isBlackjack(myActiveHand?.cards || []) || 
    (safeTotals(myActiveHand?.cards || []).every(total => total > 21));

  const canDoubleHand = !!myActiveHand && canDouble(myActiveHand.cards, myActiveHand.noHit);
  const canSplitHand = !!myActiveHand && canSplit(myActiveHand.cards);

  const handleModalConfirm = () => {
    if (!modal) return;
    setModal(null);
    if (flashPersistRef.current) {
      flashPersistRef.current = false;
      setFlash(null);
    }
    ackedRoundRef.current = lastStateRoundRef.current ?? null;
    setAwaitingOthers(true);
    if ((modal.youDrink || 0) > 0) {
      send({ type: "drink_done" });
    } else {
      send({ type: "distribute_done" });
    }
  };

  // Utiliser les totaux du serveur
  const distributed = mePlayer?.totalDistributed ?? 0;
  const drunk = mePlayer?.totalDrank ?? 0;

  const header = (snapshot?.phase === "lobby" || !snapshot)
    ? <LobbyHeader 
        id={snapshot?.id || me?.matchId || "—"} 
        onBack={resetToHome} 
        onSettings={() => setShowSettings(true)} 
      />
    : <TableHeader 
        distributed={distributed}
        drunk={drunk}
        onSettings={() => setShowSettings(true)} 
        onOverview={() => !overviewDisabled && setShowOverview(v => !v)} 
        overviewOpen={showOverview}
        overviewBtnRef={overviewBtnRef}
      />;

  if (screen === "home") {
    return (
      <div className="h-screen h-[100dvh] w-full overflow-hidden flex flex-col pt-safe-top">
        <Home
          name={name}
          setName={(value) => {
            setName(value);
            const session = loadSession();
            if (session) {
              persistSession({ ...session, name: value || "Joueur" });
            }
          }}
          onCreate={createMatch}
          onJoin={joinMatch}
        />
      </div>
    );
  }

  if (screen === "created") {
    return (
      <div className="h-screen h-[100dvh] w-full overflow-hidden flex flex-col pt-safe-top">
        <CreatedScreen
          matchId={me?.matchId || "—"}
          onEnter={() => setScreen("online")}
        />
      </div>
    );
  }

  const inLobby = snapshot?.phase === "lobby" || !snapshot;

  return (
    <div className="h-screen h-[100dvh] w-full overflow-hidden flex flex-col" style={{ background: "#213743" }}>
      {/* Header fixe avec safe area */}
      <div className="flex-shrink-0 pt-safe-top">
        {header}
      </div>

      {/* Contenu principal scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {inLobby && (
          <div className="w-full max-w-md mx-auto h-full flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <LobbyList 
                players={snapshot?.players || []} 
                order={snapshot?.order || (me ? [me.playerId] : [])} 
              />
            </div>
            <div className="flex-shrink-0 px-4 pb-4 pt-5">
              {isHost ? (
                <button 
                  onClick={startRound} 
                  className="w-full rounded-[28px] px-4 py-4 text-xl font-extrabold text-white bg-gradient-to-b from-pink-400 to-pink-600 shadow-[0_12px_0_#8b184e] active:shadow-[0_4px_0_#8b184e] active:translate-y-2 transition-all"
                >
                  Démarrer la manche
                </button>
              ) : (
                <div className="text-center text-white/70 py-4">En attente de l'hôte…</div>
              )}
            </div>
          </div>
        )}

        {snapshot && snapshot.phase !== "lobby" && (
          <div className="w-full h-full flex flex-col">
            {/* Bande de joueurs */}
            <PlayersBand 
              snapshot={snapshot} 
              currentPlayerId={snapshot.turn?.playerId}
              myPlayerId={me?.playerId}
            />
            
            {/* Contenu du jeu - fixe sans scroll avec espace pour contrôles */}
            <div className="flex-1 w-full max-w-md mx-auto px-4 py-3 text-white flex flex-col overflow-hidden pb-20">
              <div className="flex-1 flex flex-col justify-center space-y-3">
                {/* Cartes du croupier - réduites */}
                <div className="mx-auto w-full max-w-56 rounded-xl bg-[#0f2731] p-2.5">
                  <CardsRow 
                    cards={snapshot.dealer.cards} 
                    hideSecond={snapshot.dealer.hidden} 
                    size="md" 
                  />
                </div>
                <TotalPill 
                  values={dealerVisible.length ? safeTotals(dealerVisible) : ["—"]} 
                  tight 
                />

                {/* Cartes du joueur - réduites */}
                <div className="mx-auto w-full max-w-72 rounded-xl bg-[#0f2731] p-2.5">
                  {myActiveHand && <CardsRow cards={myActiveHand.cards} size="lg" />}
                </div>
                {myActiveHand && (
                  <TotalPill values={safeTotals(myActiveHand.cards)} tight />
                )}
              </div>

              {/* Contrôles fixes en bas avec support iOS PWA */}
              <div className="flex-shrink-0 pb-2 ios-pwa-controls bg-[#213743] px-4">
                <div className="w-full max-w-md mx-auto">
                  <Controls
                    disabled={controlsDisabled}
                    canDouble={canDoubleHand}
                    canSplit={canSplitHand}
                    onHit={() => sendAction("hit")}
                    onStand={() => sendAction("stand")}
                    onDouble={() => sendAction("double")}
                    onSplit={() => sendAction("split")}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Overview 
        show={showOverview} 
        snapshot={snapshot} 
        onClose={() => {
          setShowOverview(false);
          setOverviewDisabled(true);
          setTimeout(() => setOverviewDisabled(false), 300); // Délai de 300ms
        }}
        anchorRect={overviewBtnRef.current?.getBoundingClientRect() || null}
      />
      <WaitingOverlay show={awaitingOthers} />
      <FlashOverlay flash={flash} />
      
      {modal && (
        <ResultModal modal={modal} onConfirm={handleModalConfirm} />
      )}
      
      {showSettings && (
        <SettingsModal 
          onClose={() => setShowSettings(false)} 
          onHome={resetToHome}
          onRules={() => {
            setShowSettings(false);
            setShowRules(true);
          }}
        />
      )}
      
      {showRules && (
        <RulesModal 
          onClose={() => setShowRules(false)} 
        />
      )}
    </div>
  );
}
