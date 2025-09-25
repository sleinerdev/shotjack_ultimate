interface TableHeaderProps {
  distributed: number;
  drunk: number;
  onSettings: () => void;
  onOverview: () => void;
  overviewOpen: boolean;
  overviewBtnRef?: React.RefObject<HTMLButtonElement>;
}

export function TableHeader({ distributed, drunk, onSettings, onOverview, overviewOpen, overviewBtnRef }: TableHeaderProps) {
  return (
    <div className="w-full bg-[#1b2f3a] text-white">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <button 
          ref={overviewBtnRef}
          aria-label="Vue d'ensemble" 
          onClick={onOverview}
          className="h-10 w-10 grid place-items-center rounded-full border border-white/15 bg-white/5 hover:bg-white/10 transition shadow-[inset_0_0_0_2px_rgba(255,255,255,0.06)]"
        >
          {overviewOpen ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          ) : (
            <span className="grid grid-cols-3 gap-0.5">
              {Array.from({length: 9}).map((_, i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-white/80"/>
              ))}
            </span>
          )}
        </button>
        
        <div className="flex items-center gap-3">
          <div className="text-center">
            <div className="bg-green-500/20 border border-green-400/30 rounded-2xl px-4 py-2 w-20 h-16 flex flex-col justify-center">
              <div className="text-xs text-green-300 font-semibold uppercase tracking-wider">Distribué</div>
              <div className="text-xl font-bold text-white">{distributed}</div>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-red-500/20 border border-red-400/30 rounded-2xl px-4 py-2 w-20 h-16 flex flex-col justify-center">
              <div className="text-xs text-red-300 font-semibold uppercase tracking-wider">Bu</div>
              <div className="text-xl font-bold text-white">{drunk}</div>
            </div>
          </div>
        </div>
        
        <button onClick={onSettings} className="h-10 w-10 rounded-lg bg-white/10">
          ⚙
        </button>
      </div>
    </div>
  );
}
