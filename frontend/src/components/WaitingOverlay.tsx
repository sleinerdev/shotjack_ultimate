interface WaitingOverlayProps {
  show: boolean;
}

export function WaitingOverlay({ show }: WaitingOverlayProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur">
      <div className="text-center text-white">
        <div className="w-16 h-16 mx-auto mb-4 border-4 border-white/25 border-t-white rounded-full animate-spin" />
        <div className="text-xl font-semibold">En attente des joueurs</div>
      </div>
    </div>
  );
}

