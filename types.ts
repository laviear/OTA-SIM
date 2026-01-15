export type CyclePhase = 'WEEKDAY' | 'WEEKEND';
export type TurnState = 'DECISION' | 'LIVE_INTERACTION' | 'RESULT';

export interface GameState {
  money: number;
  san: number; // Sanity
  love: number; // Idol affection
  week: number;
  cyclePhase: CyclePhase; // Current time of week
  turnState: TurnState; // Are we choosing, interacting, or reading results?
  lastLog: string; // Text to display in the result phase
  lastChekiSeeds?: string[]; // Seeds for multiple cheki display
}

export interface GameAction {
  label: string;
  handler: () => void;
  variant: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  cost?: string;
  desc?: string;
}