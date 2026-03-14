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

export enum ItemType {
  CONSUMABLE = '消耗品',
  TOOL = '摸魚工具',
  ABILITY = '特殊能力',
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: ItemType;
  effect: {
    stat?: keyof PlayerStats;
    value?: number;
    passive?: string;
  };
}

export interface PlayerStats {
  energy: number; // 代替 MP (Action Points)
  maxEnergy: number;
  stress: number; // 代替 HP (Survival Line, 100 = Game Over)
  savings: number;
  luck: number;
  level: number;
  xp: number;
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
  ownedItemIds: string[];
}

export enum ActionCategory {
  SLACKING = "摸魚",
  PRANK = "搞事",
  EVADE = "閃避",
  INTERACT = "互動",
}

export interface DailyModifier {
  id: string;
  name: string;
  description: string;
  stressMult: number;
  energyCostMod: number;
  bossSpeedMult: number;
}

export interface ActionEvent {
  id: string;
  name: string;
  description: string;
  category: ActionCategory;
  energyCost: number; // 原 mpCost
  stressChange: number; // 負值為減少壓力，正值為增加
  chaosGain?: number;
  xpGain?: number;
  savingsChange?: number;
}

export interface GameState {
  players: Player[];
  day: number;
  bossPosition: { x: number; y: number };
  bossChatMessage: string | null;
  plantPosition: { x: number; y: number };
  chaosLevel: number;
  activityThisDay: number;
  performance: number;
  lastEvent: string | null;
  notifications: string[]; // 新增：即時提示列表
  currentEvent: DailyModifier;
  coffeePrice?: number; // 新增：動態咖啡價格
}
