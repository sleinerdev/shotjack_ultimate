// Configuration WebSocket
export const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080";

export const WS_CONFIG = {
  RECONNECT_TIMEOUT: 150,
  RECONNECT_ATTEMPTS: 80,
  MESSAGE_QUEUE_TIMEOUT: 80,
} as const;

// Clés de stockage
export const SESSION_KEY = "sj_session";

// Couleurs des slots de joueurs
export const SLOT_COLORS = [
  "#67b8e3",
  "#72e36f", 
  "#cc5a19",
  "#a974ff",
  "#ffc857",
  "#f46cb0"
];

// Délais
export const TIMEOUTS = {
  FLASH_DURATION: 1800,
  MODAL_AUTO_CLOSE: 900,
  RECONNECT_INTERVAL: 3000
};

