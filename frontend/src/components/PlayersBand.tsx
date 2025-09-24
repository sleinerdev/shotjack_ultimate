import { useState, useRef } from 'react';
import type { Snapshot } from '../types';
import { safeTotals } from '../utils/game';
import { SLOT_COLORS } from '../constants';

interface PlayersBandProps {
  snapshot: Snapshot;
  currentPlayerId?: string;
}

export function PlayersBand({ snapshot, currentPlayerId }: PlayersBandProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const players = snapshot.order.map((id, i) => ({
    player: snapshot.players.find(p => p.id === id)!,
    color: SLOT_COLORS[i % SLOT_COLORS.length]
  })).filter(x => !!x.player);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (scrollRef.current) {
      const cardWidth = 160; // largeur d'une carte + gap
      if (isLeftSwipe) {
        scrollRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
      } else if (isRightSwipe) {
        scrollRef.current.scrollBy({ left: -cardWidth, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="bg-[#1a2b37] py-3 px-4 border-b border-white/10">
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide"
        style={{ scrollSnapType: 'x mandatory' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {players.map(({ player, color }) => {
          const hand = player.hands[0];
          const isActive = player.id === currentPlayerId;
          
          return (
            <div
              key={player.id}
              className={`flex-shrink-0 w-36 bg-[#0f2731] rounded-xl p-3 border-2 ${
                isActive ? 'border-pink-400' : 'border-transparent'
              }`}
              style={{ scrollSnapAlign: 'start' }}
            >
              <div className="flex items-center gap-2">
                {/* Cartes miniatures */}
                <div className="flex -space-x-2">
                  {hand?.cards?.slice(0, 3).map((card, i) => {
                    const isRed = card.suit === "♥" || card.suit === "♦";
                    return (
                      <div
                        key={i}
                        className="w-6 h-8 bg-white rounded-sm border border-black/10 flex items-center justify-center"
                      >
                        <div className={`text-[8px] font-bold ${isRed ? "text-red-500" : "text-black"}`}>
                          {card.rank}
                        </div>
                      </div>
                    );
                  }) || []}
                  {hand?.cards && hand.cards.length > 3 && (
                    <div className="w-6 h-8 bg-gray-400 rounded-sm flex items-center justify-center">
                      <div className="text-[8px] font-bold text-white">+</div>
                    </div>
                  )}
                </div>

                {/* Score et nom */}
                <div className="flex-1">
                  <div className="text-lg font-bold text-center text-white">
                    {hand?.cards ? safeTotals(hand.cards).slice(-1)[0] : "—"}
                  </div>
                  <div className="text-xs text-white/70 text-center truncate">
                    {player.name}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
