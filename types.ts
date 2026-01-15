
export type SetupStage = 'ATTR' | 'IDOL' | 'GAME';
export type CyclePhase = 'WEEKDAY' | 'WEEKEND';
export type TurnState = 'DECISION' | 'LIVE_INTERACTION' | 'REVEAL' | 'RESULT' | 'REPORT';

export interface Idol {
  id: string;
  name: string;
  color: string;
  styleTag: string;
  description: string;
  dialogues: string[];
  love: number;
  avatarUrl: string; 
  chekiUrls: string[]; 
  chekiDialogues: string[]; // 预生成的拍立得文字库
}

export interface ChekiDecoration {
  emoji: string;
  left: number;
  top: number;
  rotate: number;
  scale: number;
}

export interface Cheki {
  id: number;
  idol: Idol;
  imageUrl: string; 
  dialogue: string;
  date: string;
  decorations: ChekiDecoration[];
  rotation: number;
}

export interface WeeklyStats {
  moneyEarned: number;
  moneySpent: number;
  sanLost: number;
  loveGained: number;
}

export interface GameState {
  money: number;
  san: number;
  week: number;
  cyclePhase: CyclePhase;
  turnState: TurnState;
  lastLog: string;
  pushedIdols: Idol[];
  weeklyStats: WeeklyStats;
}

export interface AttrState {
  looks: number;
  wealth: number;
  sanity: number;
}
