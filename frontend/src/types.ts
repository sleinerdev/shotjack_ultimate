// Types de cartes
export type CardT = { rank: string; suit: string };

// Types de main
export type HandOnline = { 
  cards: CardT[]; 
  bet: number; 
  result?: string; 
  noHit?: boolean 
};

// Types de joueur
export type PlayerOnline = { 
  id: string; 
  name: string; 
  totalDrank: number; 
  totalDistributed: number;
  connected: boolean; 
  hands: HandOnline[]; 
  active: number 
};

// Types de phase de jeu
export type Phase = "lobby" | "turn" | "dealer" | "resolve" | "distribute";

// Snapshot de l'état du jeu
export type Snapshot = {
  id: string;
  phase: Phase;
  round: number;
  order: string[];
  dealer: { cards: CardT[]; hidden: boolean };
  turn?: { playerId: string; hand: number };
  players: PlayerOnline[];
};

// Modal du serveur
export type ServerModal = {
  type: "modal";
  headline?: string;
  headlineColor?: string;
  preface?: string;
  details?: Array<string | { text: string; bold?: boolean; color?: string }>;
  distribute?: number;
  requireConfirm: boolean;
  youDrink?: number;
  confirmLabel?: string;
  summary?: string;
  summaryClass?: string;
};

// Session du joueur
export type PlayerSession = {
  playerId: string;
  matchId: string;
  token: string;
  name: string;
} | null;

// État du flash
export type FlashState = {
  color: "red" | "green" | "orange";
  text: string;
} | null;

// Message WebSocket
export type WebSocketMessage = any;
