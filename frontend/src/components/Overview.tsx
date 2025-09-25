import type { Snapshot, CardT } from '../types';
import { SLOT_COLORS } from '../constants';
import { safeTotals } from '../utils/game';

interface OverviewProps {
  show: boolean;
  snapshot: Snapshot | null;
  onClose: () => void;
  anchorRect: DOMRect | null;
}

export function Overview({ show, snapshot, onClose, anchorRect }: OverviewProps) {
  if (!show || !snapshot) return null;

  const byId = new Map(snapshot.players.map(p => [p.id, p]));
  const players = snapshot.order.map((id, i) => ({
    player: byId.get(id)!,
    color: SLOT_COLORS[i % SLOT_COLORS.length]
  })).filter(x => !!x.player);

  const closeStyle: React.CSSProperties = anchorRect ? {
    position: "fixed",
    left: anchorRect.left + (anchorRect.width - 48) / 2, // Centré exactement sur le bouton
    top: anchorRect.top + (anchorRect.height - 48) / 2,
    zIndex: 60
  } : { 
    position: "fixed", 
    right: 16, 
    top: 16,
    zIndex: 60 
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur" 
      onClick={onClose}
      onTouchEnd={onClose}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        onTouchEnd={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="h-12 w-12 rounded-full bg-black/50 border-2 border-white/20 grid place-items-center text-white text-xl font-bold touch-manipulation shadow-lg"
        style={closeStyle}
      >
        ✕
      </button>
      <div 
        className="max-w-md mx-auto text-white h-full overflow-y-auto" 
        onClick={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        <div className="p-6 pt-24">
          <div className="grid grid-cols-2 gap-3">
            {players.map(({ player, color }) => (
              <div key={player.id} className="rounded-2xl bg-[#0f2731] p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
                  <div className="text-sm truncate">{player.name}</div>
                </div>
                {player.hands[0]?.cards?.length ? (
                  <>
                    <MiniBand cards={player.hands[0].cards} />
                    <TotalPillMini values={safeTotals(player.hands[0].cards)} />
                  </>
                ) : (
                  <div className="text-white/50 text-xs">—</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface MiniBandProps {
  cards: CardT[];
}

function MiniBand({ cards }: MiniBandProps) {
  return (
    <div className="flex items-start justify-center">
      {cards.map((card, i) => {
        const isRed = card.suit === "♥" || card.suit === "♦";
        return (
          <div
            key={i}
            className={`w-12 h-16 rounded-md bg-white border border-black/10 overflow-hidden ${i > 0 ? "-ml-7" : ""}`}
          >
            <div className={`p-1.5 text-xs font-black ${isRed ? "text-red-500" : "text-black"}`}>
              {card.rank}{card.suit}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface TotalPillMiniProps {
  values: number[];
}

function TotalPillMini({ values }: TotalPillMiniProps) {
  const text = values.length >= 2 ? `${values[0]}, ${values[values.length - 1]}` : `${values[0]}`;
  return (
    <div className="mt-2 mx-auto w-16 text-center text-sm px-2 py-1 rounded-full bg-white/15">
      {text}
    </div>
  );
}
