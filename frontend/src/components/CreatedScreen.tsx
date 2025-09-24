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
      <div className="flex-1 px-6 pt-12">
        <div className="w-full max-w-lg mx-auto text-center">
          {/* Logo plus gros */}
          <div className="mb-16">
            <div className="text-center">
              <h1 className="text-[80px] leading-none font-black tracking-tight">
                <span className="inline-block px-3 py-2 rounded-3xl bg-gradient-to-b from-pink-400 to-pink-600 text-transparent bg-clip-text drop-shadow-[0_8px_0_#8b184e]">
                  <span className="text-white/0">SHOT</span>
                </span>
              </h1>
              <h1 className="text-[80px] leading-none font-black tracking-tight -mt-6">
                <span className="inline-block px-3 py-2 rounded-3xl bg-gradient-to-b from-pink-400 to-pink-600 text-transparent bg-clip-text drop-shadow-[0_8px_0_#8b184e]">
                  <span className="text-white/0">JACK</span>
                </span>
              </h1>
            </div>
          </div>
          
          <div className="rounded-3xl bg-white/5 border border-white/10 p-8">
            <div className="text-white/70 text-lg mb-4">Code de la partie</div>
            <button 
              onClick={copyId} 
              className="mt-2 w-full rounded-3xl bg-[#0f2731] py-6 text-4xl font-extrabold tracking-widest active:bg-[#1a3d4f] transition-colors touch-manipulation"
            >
              {matchId || "—"}
            </button>
            <div className="mt-8">
              <button 
                onClick={onEnter} 
                className="w-full rounded-[32px] bg-gradient-to-b from-pink-400 to-pink-600 shadow-[0_12px_0_#8b184e] active:shadow-[0_4px_0_#8b184e] active:translate-y-2 transition-all py-5 text-xl font-extrabold touch-manipulation"
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
