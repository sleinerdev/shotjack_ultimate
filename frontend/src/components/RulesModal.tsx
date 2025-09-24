import { useState, useEffect } from 'react';

interface RulesModalProps {
  onClose: () => void;
}

const RULES_PAGES = [
  {
    emoji: "🎯",
    title: "Objectif",
    content: [
      "Ton but est simple → battre le croupier.",
      "",
      "Le croupier s'arrête toujours à 17 ou plus.",
      "",
      "S'il bust (>21) et pas toi → tu gagnes.",
      "",
      "Si ton score est plus proche de 21 que lui → tu gagnes aussi.",
      "",
      "Le Blackjack (🅰️ + 10) est la main ultime."
    ]
  },
  {
    emoji: "🃏",
    title: "Les cartes",
    content: [
      "2 → 10 = leur chiffre",
      "",
      "J, Q, K = 10",
      "",
      "🅰️ = 1 ou 11"
    ]
  },
  {
    emoji: "⚡",
    title: "Ton tour",
    content: [
      "À ton tour tu peux :",
      "",
      "Tirer → prendre une carte",
      "",
      "Arrêter → garder ton total",
      "",
      "Doubler → miser le double et prendre une seule carte",
      "",
      "Diviser → si tu as 2 cartes identiques, tu sépares en 2 mains"
    ]
  },
  {
    emoji: "🍻",
    title: "Résultats",
    content: [
      "Tu bats le croupier → tu distribues",
      "",
      "Tu perds → tu bois",
      "",
      "Blackjack → tu distribues 3",
      "",
      "Égalité → personne ne boit",
      "",
      "Si personne ne gagne → tout le monde boit 1"
    ]
  }
];

const AUTO_SCROLL_DELAY = 4000; // 4 secondes par page

export function RulesModal({ onClose }: RulesModalProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Défilement automatique
  useEffect(() => {
    if (!isAutoScrolling) return;

    const interval = setInterval(() => {
      setCurrentPage(prev => {
        const nextPage = (prev + 1) % RULES_PAGES.length;
        return nextPage;
      });
    }, AUTO_SCROLL_DELAY);

    return () => clearInterval(interval);
  }, [isAutoScrolling]);

  // Gestion du swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsAutoScrolling(false);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // Swipe gauche = page suivante
      setCurrentPage(prev => (prev + 1) % RULES_PAGES.length);
    } else if (isRightSwipe) {
      // Swipe droite = page précédente
      setCurrentPage(prev => (prev - 1 + RULES_PAGES.length) % RULES_PAGES.length);
    }
  };


  const currentRule = RULES_PAGES[currentPage];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-96 h-[500px] bg-[#0C1020] text-white rounded-3xl border border-white/10 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
          <div className="text-lg font-bold">Règles du jeu</div>
          <button 
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-lg"
          >
            ✕
          </button>
        </div>

        {/* Contenu de la page */}
        <div 
          className="p-4 flex-1 flex flex-col justify-center overflow-hidden touch-manipulation"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="text-3xl">{currentRule.emoji}</div>
              <div className="text-xl font-bold text-pink-400">{currentRule.title}</div>
            </div>
          </div>
          
          <div className="space-y-1 text-center overflow-y-auto flex-1">
            {currentRule.content.map((line, index) => (
              <div key={index} className={line === "" ? "h-2" : "text-white/90 leading-relaxed text-base"}>
                {line}
              </div>
            ))}
          </div>
        </div>

        {/* Points de navigation */}
        <div className="p-4 border-t border-white/10">
          <div className="flex justify-center gap-3">
            {RULES_PAGES.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAutoScrolling(false);
                  setCurrentPage(index);
                }}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentPage ? 'bg-pink-400' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
