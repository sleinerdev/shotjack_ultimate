import { Logo } from './Logo';

interface CreatedScreenProps {
  matchId: string;
  onEnter: () => void;
}

export function CreatedScreen({ matchId, onEnter }: CreatedScreenProps) {
  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(matchId);
    } catch (error) {
      console.warn('Failed to copy match ID:', error);
    }
  };

  return (
    <div className="h-full w-full bg-[#070814] text-white flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col justify-start pt-12 px-6">
        <div className="w-full max-w-lg mx-auto text-center">
          <Logo />
          
          <div className="mt-16 rounded-3xl bg-white/5 border border-white/10 p-8">
            <div className="text-white/70 text-lg font-medium mb-4">Code de la partie</div>
            <button 
              onClick={copyId} 
              className="w-full rounded-2xl bg-[#0f2731] py-6 text-3xl font-extrabold tracking-widest active:bg-[#1a3d4f] transition-colors touch-manipulation"
            >
              {matchId || "—"}
            </button>
            <div className="mt-8">
              <button 
                onClick={onEnter} 
                className="w-full rounded-[32px] bg-gradient-to-b from-pink-400 to-pink-600 shadow-[0_12px_0_#8b184e] active:shadow-[0_5px_0_#8b184e] active:translate-y-3 transition-all py-5 text-xl font-extrabold touch-manipulation"
              >
                Rejoindre la salle d'attente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
