import { useState } from 'react';
import { Logo } from './Logo';

interface HomeProps {
  name: string;
  setName: (name: string) => void;
  onCreate: () => void;
  onJoin: (id: string) => void;
}

export function Home({ name, setName, onCreate, onJoin }: HomeProps) {
  const [matchIdInput, setMatchIdInput] = useState("");

  const handleJoin = () => {
    const trimmedId = matchIdInput.trim();
    if (trimmedId) {
      onJoin(trimmedId);
    }
  };

  return (
    <div className="h-full w-full bg-[#070814] text-white flex flex-col overflow-hidden">
      {/* Contenu principal avec scroll si nécessaire */}
      <div className="flex-1 overflow-y-auto px-6 pt-8">
        <div className="w-full max-w-sm mx-auto">
          <Logo />
          
          <div className="mt-8 space-y-3">
            <label className="block text-sm text-white/80">Ton pseudo</label>
            <input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="w-full rounded-2xl bg-white/10 px-4 py-3 outline-none touch-manipulation" 
              placeholder="Ton nom" 
            />
          </div>
          
          <div className="mt-6 space-y-2">
            <label className="block text-sm text-white/80">Rejoindre une partie</label>
            <div className="flex gap-2">
              <input 
                value={matchIdInput} 
                onChange={(e) => setMatchIdInput(e.target.value)} 
                className="flex-1 rounded-2xl bg-white/10 px-4 py-3 outline-none touch-manipulation" 
                placeholder="ID de partie" 
              />
              <button 
                onClick={handleJoin}
                className="whitespace-nowrap rounded-2xl px-5 py-3 font-semibold bg-gradient-to-b from-pink-400 to-pink-600 shadow-[0_6px_0_#8b184e] active:shadow-[0_2px_0_#8b184e] active:translate-y-1 transition-all touch-manipulation"
              >
                Rejoindre
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bouton fixe en bas */}
      <div className="flex-shrink-0 px-6 pb-8">
        <div className="w-full max-w-sm mx-auto">
          <button 
            onClick={onCreate} 
            className="w-full rounded-[32px] bg-gradient-to-b from-pink-400 to-pink-600 shadow-[0_12px_0_#8b184e] active:shadow-[0_4px_0_#8b184e] active:translate-y-2 transition-all py-4 text-xl font-extrabold touch-manipulation"
          >
            Créer une partie
          </button>
        </div>
      </div>
    </div>
  );
}
