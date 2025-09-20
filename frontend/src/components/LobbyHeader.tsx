interface LobbyHeaderProps {
  id: string;
  onBack: () => void;
  onSettings: () => void;
}

export function LobbyHeader({ id, onBack, onSettings }: LobbyHeaderProps) {
  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(id);
    } catch (error) {
      console.warn('Failed to copy ID:', error);
    }
  };

  return (
    <div className="w-full bg-[#1b2f3a] text-white">
      <div className="max-w-md mx-auto px-4 py-3 relative flex items-center justify-center">
        <div 
          onClick={copyId} 
          className="font-extrabold tracking-widest text-2xl cursor-pointer select-none"
        >
          ID: {id}
        </div>
        <button 
          onClick={onBack} 
          className="absolute left-4 top-2.5 h-10 w-10 rounded-lg bg-transparent grid place-items-center"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M10 7L5 12L10 17" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19 12H6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <button 
          onClick={onSettings} 
          className="absolute right-4 top-2.5 h-10 w-10 rounded-lg bg-white/10 text-2xl flex items-center justify-center"
        >
          ⚙
        </button>
      </div>
    </div>
  );
}

