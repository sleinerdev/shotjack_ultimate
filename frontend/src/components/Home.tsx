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
        <div className="w-full max-w-lg mx-auto">
          {/* Logo plus gros */}
          <div className="mb-12">
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
          
          <div className="mt-10 space-y-4">
            <label className="block text-lg text-white/80">Ton pseudo</label>
            <input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="w-full rounded-3xl bg-white/10 px-6 py-4 text-lg outline-none touch-manipulation" 
              placeholder="Ton nom" 
            />
          </div>
          
          <div className="mt-8 space-y-4">
            <label className="block text-lg text-white/80">Rejoindre une partie</label>
            <div className="flex gap-3">
              <input 
                value={matchIdInput} 
                onChange={(e) => setMatchIdInput(e.target.value)} 
                className="flex-1 rounded-3xl bg-white/10 px-6 py-4 text-lg outline-none touch-manipulation" 
                placeholder="ID de partie" 
              />
              <button 
                onClick={handleJoin}
                className="whitespace-nowrap rounded-3xl px-6 py-4 text-lg font-semibold bg-gradient-to-b from-pink-400 to-pink-600 shadow-[0_8px_0_#8b184e] active:shadow-[0_2px_0_#8b184e] active:translate-y-1 transition-all touch-manipulation"
              >
                Rejoindre
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bouton fixe en bas */}
      <div className="flex-shrink-0 px-6 pb-4">
        <div className="w-full max-w-lg mx-auto">
          <button 
            onClick={onCreate} 
            className="w-full rounded-[40px] bg-gradient-to-b from-pink-400 to-pink-600 shadow-[0_14px_0_#8b184e] active:shadow-[0_4px_0_#8b184e] active:translate-y-2 transition-all py-5 text-2xl font-extrabold touch-manipulation"
          >
            Créer une partie
          </button>
        </div>
      </div>
    </div>
  );
}
