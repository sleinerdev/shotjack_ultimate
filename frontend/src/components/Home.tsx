import { useMemo, useState } from 'react';
import { Logo } from './Logo';

interface HomeProps {
  name: string;
  setName: (name: string) => void;
  onCreate: () => void;
  onJoin: (id: string) => void;
}


const MAX_MATCH_ID_LENGTH = 6;

const sanitizeMatchId = (raw: string) => raw.slice(0, MAX_MATCH_ID_LENGTH);


export function Home({ name, setName, onCreate, onJoin }: HomeProps) {
  const [matchIdInput, setMatchIdInput] = useState("");
  const [matchIdError, setMatchIdError] = useState<string | null>(null);

  const canJoin = useMemo(() => matchIdInput.trim().length > 0, [matchIdInput]);

  const handleJoin = () => {
    const trimmedId = matchIdInput.trim();
    if (!trimmedId) {
      setMatchIdError("Veuillez renseigner un identifiant de partie");
      return;
    }

    setMatchIdError(null);
    onJoin(trimmedId);
  };

  return (
    <div className="h-full w-full bg-[#070814] text-white flex flex-col overflow-hidden">
      {/* Contenu principal avec scroll si nécessaire */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="w-full max-w-sm mx-auto flex flex-col gap-8">
          <Logo />

          <div className="space-y-3">
            <label className="block text-sm text-white/80">Ton pseudo</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl bg-white/10 px-4 py-3 outline-none touch-manipulation"
              placeholder="Ton nom"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-white/80">Rejoindre une partie</label>
            <div className="flex gap-2">
              <input
                value={matchIdInput}
                onChange={(e) => {
                  setMatchIdInput(sanitizeMatchId(e.target.value));
                  setMatchIdError(null);
                }}
                className={`flex-1 rounded-2xl px-4 py-3 outline-none touch-manipulation transition-colors ${
                  matchIdError ? "bg-red-500/10 border border-red-400/60" : "bg-white/10"
                }`}
                placeholder="ID de partie (ex: 12ab)"
                />
              <button
                onClick={handleJoin}
                disabled={!canJoin}
                className={`whitespace-nowrap rounded-2xl px-5 py-3 font-semibold transition-all touch-manipulation ${
                  canJoin
                    ? "bg-gradient-to-b from-pink-400 to-pink-600 shadow-[0_6px_0_#8b184e] active:shadow-[0_2px_0_#8b184e] active:translate-y-1"
                    : "bg-white/10 text-white/50"
                }`}
              >
                Rejoindre
              </button>
            </div>
            {matchIdError && (
              <div className="text-xs text-red-300">{matchIdError}</div>
            )}
          </div>

          <div className="pt-4">
            <button
              onClick={onCreate}
              className="w-full rounded-[32px] bg-gradient-to-b from-pink-400 to-pink-600 shadow-[0_12px_0_#8b184e] active:shadow-[0_4px_0_#8b184e] active:translate-y-2 transition-all py-4 text-xl font-extrabold touch-manipulation"
            >
              Créer une partie
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
