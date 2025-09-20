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
    <div className="min-h-[100dvh] w-full bg-[#070814] text-white flex items-start justify-center pt-4 p-6 overflow-x-hidden">
      <div className="w-full max-w-sm mx-auto">
        <Logo />
        
        <div className="mt-8 space-y-3">
          <label className="block text-sm text-white/80">Ton pseudo</label>
          <input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="w-full rounded-2xl bg-white/10 px-4 py-3 outline-none" 
            placeholder="Ton nom" 
          />
        </div>
        
        <div className="mt-6 space-y-2">
          <label className="block text-sm text-white/80">Rejoindre une partie</label>
          <div className="flex gap-2">
            <input 
              value={matchIdInput} 
              onChange={(e) => setMatchIdInput(e.target.value)} 
              className="flex-1 rounded-2xl bg-white/10 px-4 py-3 outline-none" 
              placeholder="ID de partie" 
            />
            <button 
              onClick={handleJoin}
              className="whitespace-nowrap rounded-2xl px-5 py-3 font-semibold bg-gradient-to-b from-pink-400 to-pink-600 shadow-[0_6px_0_#8b184e]"
            >
              Rejoindre
            </button>
          </div>
        </div>
        
        <div className="mt-8 pb-16">
          <button 
            onClick={onCreate} 
            className="w-full rounded-[32px] bg-gradient-to-b from-pink-400 to-pink-600 shadow-[0_12px_0_#8b184e] py-4 text-xl font-extrabold"
          >
            Créer une partie
          </button>
        </div>
      </div>
    </div>
  );
}
