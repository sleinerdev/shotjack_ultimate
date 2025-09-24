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
      {/* Contenu principal aligné en haut */}
      <div className="flex-1 overflow-y-auto px-6 pt-12">
        <div className="w-full max-w-lg mx-auto">
          <Logo />
          
          <div className="mt-12 space-y-4">
            <label className="block text-lg text-white/80 font-medium">Ton pseudo</label>
            <input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="w-full rounded-2xl bg-white/10 px-6 py-4 text-lg outline-none touch-manipulation" 
              placeholder="Ton nom" 
            />
          </div>
          
          <div className="mt-10 space-y-4">
            <label className="block text-lg text-white/80 font-medium">Rejoindre une partie</label>
            <div className="flex gap-3">
              <input 
                value={matchIdInput} 
                onChange={(e) => setMatchIdInput(e.target.value)} 
                className="flex-1 rounded-2xl bg-white/10 px-6 py-4 text-lg outline-none touch-manipulation" 
                placeholder="ID de partie" 
              />
              <button 
                onClick={handleJoin}
                className="whitespace-nowrap rounded-2xl px-6 py-4 text-lg font-semibold bg-gradient-to-b from-pink-400 to-pink-600 shadow-[0_8px_0_#8b184e] active:shadow-[0_3px_0_#8b184e] active:translate-y-2 transition-all touch-manipulation"
              >
                Rejoindre
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bouton fixe en bas - sans exclusion zone */}
      <div className="flex-shrink-0 px-6 pb-6">
        <div className="w-full max-w-lg mx-auto">
          <button 
            onClick={onCreate} 
            className="w-full rounded-[32px] bg-gradient-to-b from-pink-400 to-pink-600 shadow-[0_14px_0_#8b184e] active:shadow-[0_6px_0_#8b184e] active:translate-y-3 transition-all py-5 text-2xl font-extrabold touch-manipulation"
          >
            Créer une partie
          </button>
        </div>
      </div>
    </div>
  );
}
