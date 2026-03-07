export enum PlayerRole {
  INTERN = "實習小偷",
  JUNIOR = "菜鳥小偷",
  SENIOR = "首席小偷",
  LEGEND = "摸魚之神",
}

export enum EntityType {
  PLAYER = 'PLAYER',
  COLLEAGUE = 'COLLEAGUE',
  BOSS = 'BOSS',
  PLANT = 'PLANT',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export interface PlayerStats {
  hp: number; // Health (混分值)
  mp: number; // Mana (摸魚值)
  maxMp: number;
  xp: number; // Experience (年資)
  level: number;
  stress: number;
  savings: number;
  luck: number;
  charisma: number;
}

export interface Player {
  id: string;
  name: string;
  role: string;
  stats: PlayerStats;
  gender: Gender;
  chatMessage: string | null;
  position: { x: number; y: number };
  gridX: number;
  gridY: number;
}

export enum CardType {
  PRANK = "惡作劇",
  SLACKING = "摸魚",
  ESCAPE = "逃避",
  GOSSIP = "八卦",
}

// 每日隨機事件定義
export interface DailyModifier {
  id: string;
  name: string;
  description: string;
  stressMult: number; // 壓力增長倍率
  mpCostMod: number;  // MP 消耗修正
  bossSpeedMult: number; // 老闆速度倍率
}

export interface Card {
  id: string;
  name: string;
  description: string;
  type: CardType;
  mpCost: number; // 消耗 MP
  hpChange?: number; // 恢復 HP
  stressChange: number;
  chaosGain?: number;
  xpGain?: number;
  savingsChange?: number;
  rarity: "C" | "B" | "A" | "S";
}

export interface GameState {
  players: Player[];
  day: number;
  hand: Card[];
  deck: Card[];
  discardPile: Card[];
  bossPosition: { x: number; y: number };
  plantPosition: { x: number; y: number };
  chaosLevel: number;
  activityThisDay: number;
  performance: number;
  lastEvent: string | null;
  currentEvent: {
    id: string;
    name: string;
    description: string;
    stressMult: number;
    mpCostMod: number;
    bossSpeedMult: number;
  };
}
