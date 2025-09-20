import type { FlashState } from '../types';

interface FlashOverlayProps {
  flash: FlashState;
}

export function FlashOverlay({ flash }: FlashOverlayProps) {
  if (!flash || !flash.color) return null;

  const bgColorMap = {
    red: "bg-red-900/70",
    green: "bg-green-900/70", 
    orange: "bg-orange-900/70"
  };

  const bgColor = bgColorMap[flash.color] || "bg-gray-900/70";

  return (
    <div className={`fixed inset-0 z-40 ${bgColor} grid place-items-center`}>
      <div 
        style={{ fontFamily: "Impact, Anton, Bebas Neue, system-ui, sans-serif" }} 
        className="text-white text-6xl font-black tracking-wider drop-shadow-[0_6px_0_rgba(0,0,0,0.35)]"
      >
        {flash.text}
      </div>
    </div>
  );
}

