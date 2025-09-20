interface ControlsProps {
  onHit: () => void;
  onStand: () => void;
  onDouble: () => void;
  onSplit: () => void;
  disabled: boolean;
  canDouble: boolean;
  canSplit: boolean;
}

export function Controls({
  onHit,
  onStand,
  onDouble,
  onSplit,
  disabled,
  canDouble,
  canSplit
}: ControlsProps) {
  const baseClasses = "rounded-2xl px-4 py-3 font-semibold";
  const enabledClasses = "bg-gradient-to-b from-pink-400 to-pink-600 shadow-[0_6px_0_#8b184e]";
  const disabledClasses = "bg-white/10 opacity-60";

  return (
    <div className="rounded-2xl bg-white/5 p-4 border border-white/10 grid grid-cols-2 gap-3">
      <button 
        onClick={onHit} 
        disabled={disabled} 
        className={`${baseClasses} ${disabled ? disabledClasses : enabledClasses}`}
      >
        Tirer
      </button>
      <button 
        onClick={onStand} 
        disabled={disabled} 
        className={`${baseClasses} ${disabled ? disabledClasses : enabledClasses}`}
      >
        Arrêter
      </button>
      <button 
        onClick={onSplit} 
        disabled={disabled || !canSplit} 
        className={`${baseClasses} ${(disabled || !canSplit) ? disabledClasses : enabledClasses}`}
      >
        Diviser
      </button>
      <button 
        onClick={onDouble} 
        disabled={disabled || !canDouble} 
        className={`${baseClasses} ${(disabled || !canDouble) ? disabledClasses : enabledClasses}`}
      >
        Doubler
      </button>
    </div>
  );
}

