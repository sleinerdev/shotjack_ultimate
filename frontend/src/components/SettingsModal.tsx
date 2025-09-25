interface SettingsModalProps {
  onClose: () => void;
  onHome: () => void;
  onRules: () => void;
}

export function SettingsModal({ onClose, onHome, onRules }: SettingsModalProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur">
      <div className="w-[90%] max-w-sm rounded-3xl bg-[#0C1020] text-white p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-bold">Paramètres</div>
          <button onClick={onClose} className="text-xl">✕</button>
        </div>
        <div className="space-y-3">
          <button 
            onClick={onHome} 
            className="w-full rounded-2xl bg-white/10 px-4 py-3 hover:bg-white/15 transition-colors"
          >
            Retour à l'accueil
          </button>
          <button 
            onClick={onRules} 
            className="w-full rounded-2xl bg-pink-500/20 border border-pink-400/30 px-4 py-3 hover:bg-pink-500/30 transition-colors"
          >
            Voir les règles
          </button>
        </div>
      </div>
    </div>
  );
}

