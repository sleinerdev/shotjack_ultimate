import type { CardT } from '../types';

interface CardProps {
  card?: CardT;
  className?: string;
  z?: number;
}

export function Card({ card, className = "", z = 0 }: CardProps) {
  if (!card) return <CardBack className={className} z={z} />;
  
  const isRed = card.suit === "♥" || card.suit === "♦";
  
  return (
    <div 
      className={`relative ${className} rounded-xl bg-white border border-black/10 shadow-md grid place-items-center`} 
      style={{ zIndex: z }}
    >
      <div className={`font-black ${isRed ? "text-red-500" : "text-black"}`}>
        {card.rank}{card.suit}
      </div>
    </div>
  );
}

interface CardBackProps {
  className?: string;
  z?: number;
  overlay?: boolean;
}

export function CardBack({ className = "", z = 0, overlay = false }: CardBackProps) {
  return (
    <div 
      className={`relative ${className} rounded-xl border border-white/20 ${overlay ? "-ml-10 -mt-6" : ""}`} 
      style={{ zIndex: z }}
    >
      <div className="w-full h-full rounded-xl bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.15)_0_6px,rgba(0,0,0,0)_6px_12px)]" />
    </div>
  );
}

interface CardsRowProps {
  cards: CardT[];
  hideSecond?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  gap?: string;
}

export function CardsRow({ cards, hideSecond = false, size = "md", gap = "gap-2" }: CardsRowProps) {
  const sizeClasses = {
    xs: "w-12 h-20 text-sm",
    sm: "w-16 h-24 text-base", 
    md: "w-20 h-28 text-lg",
    lg: "w-28 h-40 text-2xl"
  };
  
  const scale = sizeClasses[size];
  
  return (
    <div className={`flex items-end ${gap}`}>
      {cards.map((card, index) => {
        if (hideSecond && index === 1) return null;
        return <Card key={index} card={card} className={scale} z={index} />;
      })}
      {hideSecond && cards[1] && <CardBack className={scale} z={2} overlay />}
    </div>
  );
}

