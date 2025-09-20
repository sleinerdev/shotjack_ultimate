import type { ServerModal } from '../types';

interface ResultModalProps {
  modal: ServerModal;
  onConfirm: () => void;
}

export function ResultModal({
  modal: {
    preface,
    headline,
    headlineColor,
    summary,
    distribute,
    details,
    requireConfirm,
    confirmLabel,
    summaryClass
  },
  onConfirm
}: ResultModalProps) {
  const computedSummaryClass = summaryClass || (/^Tu bois/i.test(summary || "") ? "text-3xl" : "text-5xl");
  const isWin = (headlineColor || "").toLowerCase().includes("22c55e");

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur">
      <div className="w-[92%] max-w-sm rounded-3xl bg-[#0C1020] text-white p-6 border border-white/10 text-center">
        {headline && (
          <div 
            className="text-4xl font-extrabold mb-2" 
            style={{ color: headlineColor || undefined }}
          >
            {headline}
          </div>
        )}
        
        {preface && (
          <div className="text-xl font-semibold mb-1">{preface}</div>
        )}
        
        {details?.length ? (
          <div className="text-white/90 space-y-1 text-lg mb-4">
            {details.map((detail, index) => {
              const item = typeof detail === "string" ? { text: detail } : detail;
              const style = item.color ? { color: item.color } : undefined;
              return (
                <div 
                  key={index} 
                  className={`${item.bold ? "font-bold" : ""}`} 
                  style={style}
                >
                  {item.text}
                </div>
              );
            })}
          </div>
        ) : null}
        
        {summary && (
          <div className={`${computedSummaryClass} font-extrabold mb-4`}>
            {summary}
          </div>
        )}
        
        {typeof distribute === "number" && distribute > 0 && (
          <div className={`text-3xl font-extrabold mb-4 rounded-xl px-3 py-2 ${
            isWin ? "bg-green-500/15 ring-2 ring-green-400/60" : ""
          }`}>
            Tu distribues {distribute} {distribute === 1 ? "gorgée" : "gorgées"}
          </div>
        )}
        
        {requireConfirm && (
          <button 
            onClick={onConfirm} 
            className="w-full rounded-2xl bg-gradient-to-b from-pink-400 to-pink-600 shadow-[0_10px_0_#8b184e] px-5 py-4 font-extrabold text-3xl"
          >
            {confirmLabel || "J'ai bu"}
          </button>
        )}
      </div>
    </div>
  );
}

