import { PlayerRole, Card, CardType } from "./types";

export const OFFICE_LAYOUT = {
  width: 1080,
  height: 522,
  gridSize: { x: 6, y: 5 }, // 6x5 網格
  cellWidth: 180,
  cellHeight: 104,
  clusters: [    {
      name: "混分區",
      desks: [
        { id: "player", x: 0, y: 0, label: "混分王", owner: "player" },
        { id: "lynn", x: 1, y: 0, label: "Lynn", owner: "lynn" },
        { id: "karen", x: 0, y: 1, label: "Karen", owner: "karen" },
      ]
    },
    {
      name: "八卦區",
      desks: [
        { id: "jacky", x: 4, y: 0, label: "Jacky", owner: "jacky" },
        { id: "cian", x: 5, y: 0, label: "Cian", owner: "cian" },
      ]
    }
  ],
  objects: [
    { id: "coffee", x: 2, y: 2, label: "夢幻咖啡機", type: "ENERGY_SOURCE", emoji: "☕" },
    { id: "printer", x: 3, y: 0, label: "冒煙印表機", type: "CHAOS_SOURCE", emoji: "🔥" },
    { id: "toilet", x: 5, y: 4, label: "薪水傳送門", type: "STRESS_RELIEF", emoji: "🧻" },
    { id: "vending", x: 0, y: 4, label: "快樂水機", type: "ENERGY_SOURCE", emoji: "🥤" },
  ],
  door: { x: 3, y: 4 }
};

export const CARD_POOL: Card[] = [
  { id: "c1", name: "Alt-Tab 瞬切", description: "假裝工作。壓力-5，混亂度+5", type: CardType.SLACKING, mpCost: 5, stressChange: -5, chaosGain: 5, rarity: "C" },
  { id: "c2", name: "偽裝 Meeting", description: "在位子上發呆。壓力-15，體力-10", type: CardType.SLACKING, mpCost: 10, stressChange: -15, chaosGain: 10, rarity: "B" },
  { id: "c3", name: "傳播八卦", description: "講老闆秘密。壓力-20，混亂度+20", type: CardType.GOSSIP, mpCost: 15, stressChange: -20, chaosGain: 20, rarity: "A" },
  { id: "c4", name: "偷喝珍奶", description: "體力+40，壓力-10", type: CardType.SLACKING, mpCost: 0, stressChange: -10, rarity: "B" },
  { id: "c5", name: "椅子賽車", description: "混亂度+30，壓力-5", type: CardType.PRANK, mpCost: 20, stressChange: -5, chaosGain: 30, rarity: "B" },
  { id: "c6", name: "主管讚賞", description: "莫名被讚。壓力-30，獎金+1000", type: CardType.SLACKING, mpCost: 0, stressChange: -30, savingsChange: 1000, rarity: "A" },
  { id: "c7", name: "調戲貓咪", description: "摸摸辦公室貓咪。壓力-50，混亂度+10", type: CardType.GOSSIP, mpCost: 10, stressChange: -50, chaosGain: 10, rarity: "S" },
  { id: "c10", name: "廁所遁逃", description: "消失一陣子。體力+30，壓力-20", type: CardType.SLACKING, mpCost: 0, stressChange: -20, rarity: "C" },
  { id: "c11", name: "閃現走位", description: "閃！", type: CardType.ESCAPE, mpCost: 10, stressChange: 5, rarity: "B" },
];

export const ROLE_CONFIG = {
  [PlayerRole.EMPLOYEE]: { baseSalary: 3000, stressGain: 0.1, energyLoss: 0.2 },
  [PlayerRole.MANAGER]: { baseSalary: 6000, stressGain: 0.2, energyLoss: 0.1 },
};
