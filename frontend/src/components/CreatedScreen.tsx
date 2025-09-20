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
    <div className="min-h-[100dvh] w-full bg-[#070814] text-white flex items-start justify-center pt-4 p-6">
      <div className="w-full max-w-sm mx-auto text-center">
        <Logo />
        
        <div className="mt-10 rounded-2xl bg-white/5 border border-white/10 p-6">
          <div className="text-white/70 text-sm">Code de la partie</div>
          <button 
            onClick={copyId} 
            className="mt-2 w-full rounded-2xl bg-[#0f2731] py-4 text-2xl font-extrabold tracking-widest"
          >
            {matchId || "—"}
          </button>
          <div className="mt-6">
            <button 
              onClick={onEnter} 
              className="w-full rounded-[28px] bg-gradient-to-b from-pink-400 to-pink-600 shadow-[0_10px_0_#8b184e] py-3 text-lg font-extrabold"
            >
              Rejoindre la salle d'attente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
