import { PlayerRole, Card, CardType } from "./types";
import { Gender } from "./logic/GameClasses";

export const OFFICE_LAYOUT = {
  width: 1080,
  height: 700,
  gridSize: { x: 11, y: 7 }, 
  cellWidth: 98,
  cellHeight: 85,
  clusters: [
    {
      name: "左側島嶼",
      desks: [
        { id: "lynn", x: 1, y: 1, label: "Lynn", owner: "lynn", gender: Gender.FEMALE },
        { id: "karen", x: 1, y: 2, label: "Karen", owner: "karen", gender: Gender.FEMALE },
        { id: "felicity", x: 1, y: 3, label: "Felicity", owner: "felicity", gender: Gender.FEMALE },
        { id: "empty_l1", x: 2, y: 1, label: "待招募", owner: null },
        { id: "empty_l2", x: 2, y: 2, label: "待招募", owner: null },
        { id: "lara", x: 2, y: 3, label: "Lara", owner: "lara", gender: Gender.FEMALE },
      ]
    },
    {
      name: "中間島嶼",
      desks: [
        { id: "empty_m1", x: 4, y: 1, label: "待招募", owner: null },
        { id: "empty_m2", x: 5, y: 1, label: "待招募", owner: null },
        { id: "empty_m3", x: 4, y: 2, label: "待招募", owner: null },
        { id: "andy", x: 5, y: 2, label: "Andy", owner: "andy", gender: Gender.MALE },
        { id: "neil", x: 4, y: 3, label: "Neil", owner: "neil", gender: Gender.MALE },
        { id: "adi", x: 5, y: 3, label: "Adi", owner: "adi", gender: Gender.MALE },
        { id: "ben", x: 4.5, y: 4, label: "Ben", owner: "ben", gender: Gender.MALE },
      ]
    },
    {
      name: "右側島嶼",
      desks: [
        { id: "empty_r1", x: 7, y: 1, label: "待招募", owner: null },
        { id: "empty_r2", x: 8, y: 1, label: "待招募", owner: null },
        { id: "jacky", x: 7, y: 2, label: "Jacky", owner: "jacky", gender: Gender.MALE },
        { id: "hank", x: 8, y: 2, label: "Hank", owner: "hank", gender: Gender.MALE },
        { id: "cian", x: 7, y: 3, label: "Cian", owner: "cian", gender: Gender.MALE },
        { id: "lance", x: 8, y: 3, label: "Lance", owner: "lance", gender: Gender.MALE },
      ]
    }
  ],  objects: [
    { id: "coffee", x: 3, y: 5, label: "夢幻咖啡機", type: "ENERGY_SOURCE", emoji: "☕" },
    { id: "printer", x: 6, y: 5, label: "冒煙印表機", type: "CHAOS_SOURCE", emoji: "🔥" },
    { id: "toilet", x: 10, y: 5, label: "薪水傳送門", type: "STRESS_RELIEF", emoji: "🧻" },
    { id: "vending", x: 0, y: 5, label: "快樂水機", type: "ENERGY_SOURCE", emoji: "🥤" },
  ],
  door: { x: 5, y: 0 }
};

export const CARD_POOL: Card[] = [
  { id: "c1", name: "Alt-Tab 瞬切", description: "假裝工作。壓力-5，混亂度+5", type: CardType.SLACKING, mpCost: 5, stressChange: -5, chaosGain: 5, rarity: "C" },
  { id: "c2", name: "偽裝 Meeting", description: "全世界都以為你在開會。壓力-15，體力-10", type: CardType.SLACKING, mpCost: 10, stressChange: -15, chaosGain: 10, rarity: "B" },
  { id: "c3", name: "傳播八卦", description: "湊過去講秘密。壓力-20，混亂度+20", type: CardType.GOSSIP, mpCost: 15, stressChange: -20, chaosGain: 20, rarity: "A" },
  { id: "c4", name: "偷喝珍奶", description: "珍珠才是本體。體力+40，壓力-10", type: CardType.SLACKING, mpCost: 0, stressChange: -10, rarity: "B" },
  { id: "c5", name: "椅子賽車", description: "喔喔喔！輪子噴火啦！混亂度+30", type: CardType.PRANK, mpCost: 20, stressChange: -5, chaosGain: 30, rarity: "B" },
  { id: "c6", name: "主管讚賞", description: "老闆瞬移過來拍拍你。壓力-30，獎金+1000", type: CardType.SLACKING, mpCost: 0, stressChange: -30, savingsChange: 1000, rarity: "A" },
  { id: "c7", name: "深呼吸", description: "對著綠色植物深呼吸。壓力-50，混亂度-5", type: CardType.GOSSIP, mpCost: 10, stressChange: -50, chaosGain: -5, rarity: "S" },
  { id: "c10", name: "廁所遁逃", description: "進入薪水傳送門。體力+30，壓力-20", type: CardType.SLACKING, mpCost: 0, stressChange: -20, rarity: "C" },
  { id: "c11", name: "閃現走位", description: "殘影閃現！躲避追擊。", type: CardType.ESCAPE, mpCost: 10, stressChange: 5, rarity: "B" },
  { id: "c12", name: "無情甩鍋", description: "「這不是我負責的」。自己壓力-15，目標壓力+30", type: CardType.PRANK, mpCost: 15, stressChange: 30, rarity: "B" },
  { id: "c13", name: "請喝咖啡", description: "用咖啡收買人心。目標壓力-40，魅力+5", type: CardType.GOSSIP, mpCost: 5, stressChange: -40, rarity: "A" },
  { id: "c14", name: "滑鼠貼膠帶", description: "看同事修滑鼠。目標壓力+20，混亂度+15", type: CardType.PRANK, mpCost: 10, stressChange: 20, chaosGain: 15, rarity: "C" },
  { id: "c15", name: "背後突襲", description: "「哇！」目標隨機瞬移，混亂度+10", type: CardType.PRANK, mpCost: 15, stressChange: 10, chaosGain: 10, rarity: "B" },
  { id: "c16", name: "代領包裹", description: "幫同事去門口拿包裹。魅力+3，獎金+100", type: CardType.SLACKING, mpCost: 10, stressChange: -10, savingsChange: 100, rarity: "C" },
];

export const ROLE_CONFIG = {
  [PlayerRole.EMPLOYEE]: { baseSalary: 3000, stressGain: 0.1, energyLoss: 0.2 },
  [PlayerRole.MANAGER]: { baseSalary: 6000, stressGain: 0.2, energyLoss: 0.1 },
};
