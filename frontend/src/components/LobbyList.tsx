import type { PlayerOnline } from '../types';
import { SLOT_COLORS } from '../constants';

interface LobbyListProps {
  players: PlayerOnline[];
  order: string[];
}

export function LobbyList({ players, order }: LobbyListProps) {
  const byId = new Map(players.map(p => [p.id, p]));
  
  const rows = Array.from({ length: 6 }).map((_, i) => {
    const id = order[i];
    const player = id ? byId.get(id) : undefined;
    if (!player) {
      return { name: "", color: "", waiting: true, host: false };
    }
    return {
      name: player.name || "Joueur",
      color: SLOT_COLORS[i % SLOT_COLORS.length],
      waiting: false,
      host: i === 0
    };
  });

  return (
    <div className="max-w-md mx-auto px-4 pt-6">
      <div className="space-y-3">
        {rows.map((row, i) => 
          row.waiting ? (
            <ShimmerBox key={i} />
          ) : (
            <div key={i} className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2 border border-white/10">
              <div className="w-10 h-10 rounded-lg" style={{ background: row.color }} />
              <div className="flex-1">
                <div className="font-semibold tracking-wide text-white">{row.name}</div>
              </div>
              {row.host && (
                <span className="text-xs px-2 py-1 rounded-full bg-white/10 border border-white/15 text-white">
                  HOST
                </span>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function ShimmerBox() {
  return (
    <div className="relative overflow-hidden rounded-xl h-14 bg-white/10">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <style>{`@keyframes shimmer{100%{transform:translateX(100%)}}`}</style>
    </div>
  );
}

