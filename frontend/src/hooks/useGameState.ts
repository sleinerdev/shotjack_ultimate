import { useState, useEffect, useMemo, useRef } from "react";
import type { Snapshot, PlayerOnline, ServerModal, FlashState, PlayerSession } from "../types";
import { SESSION_KEY } from "../constants";

export function useGameState() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [me, setMe] = useState<PlayerSession>(null);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const [modal, setModal] = useState<ServerModal | null>(null);
  const [flash, setFlash] = useState<FlashState>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showOverview, setShowOverview] = useState(false);
  const [awaitingOthers, setAwaitingOthers] = useState(false);

  const ackedRoundRef = useRef<number | null>(null);
  const lastStateRoundRef = useRef<number | null>(null);
  const prevRoundRef = useRef<number>(0);
  const processedRef = useRef(0);
  const leftRef = useRef(false);

  const persistSession = (session: { matchId: string; token: string; name: string }) => {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      console.warn('Failed to persist session:', error);
    }
  };

  const loadSession = (): PlayerSession => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn('Failed to load session:', error);
      return null;
    }
  };

  const clearSession = () => {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (error) {
      console.warn('Failed to clear session:', error);
    }
  };

  const mePlayer = useMemo(() =>
    snapshot?.players.find(p => p.id === me?.playerId) || null,
    [snapshot, me]
  );

  const myTurn = snapshot?.phase === "turn" && snapshot.turn?.playerId === me?.playerId;
  const myActiveHand = mePlayer ? mePlayer.hands[mePlayer.active] : undefined;
  const isHost = snapshot && me ? snapshot.order[0] === me.playerId : false;

  const onModalConfirm = () => {
    if (!modal) return;
    setModal(null);
    setFlash(null);
    ackedRoundRef.current = lastStateRoundRef.current ?? null;
    setAwaitingOthers(true);
  };

  return {
    snapshot,
    setSnapshot,
    me,
    setMe,
    hasStartedPlaying,
    setHasStartedPlaying,
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
    onModalConfirm,
  };
}
