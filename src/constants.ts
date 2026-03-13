import { PlayerRole, Card, CardType, DailyModifier, Gender, ShopItem, ItemType } from "./types";

export const OFFICE_LAYOUT = {
  width: 1700,
  height: 720,
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
        { id: "empty_l1", x: 2, y: 1, label: "", owner: null },
        { id: "empty_l2", x: 2, y: 2, label: "", owner: null },
        { id: "lara", x: 2, y: 3, label: "Lara", owner: "lara", gender: Gender.FEMALE },
      ]
    },
    {
      name: "中間島嶼",
      desks: [
        { id: "empty_m1", x: 4, y: 1, label: "", owner: null },
        { id: "empty_m2", x: 5, y: 1, label: "", owner: null },
        { id: "empty_m3", x: 4, y: 2, label: "", owner: null },
        { id: "andy", x: 5, y: 2, label: "Andy", owner: "andy", gender: Gender.MALE },
        { id: "neil", x: 4, y: 3, label: "Neil", owner: "neil", gender: Gender.MALE },
        { id: "adi", x: 5, y: 3, label: "Adi", owner: "adi", gender: Gender.MALE },
        { id: "ben", x: 4.5, y: 4, label: "Ben", owner: "ben", gender: Gender.MALE },
      ]
    },
    {
      name: "右側島嶼",
      desks: [
        { id: "empty_r1", x: 7, y: 1, label: "", owner: null },
        { id: "empty_r2", x: 8, y: 1, label: "", owner: null },
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
    { id: "plant", x: 10, y: 0, label: "舒壓植栽", type: "STRESS_RELIEF", emoji: "🪴" },
  ],
  door: { x: 5, y: 0 }
};

export const CARD_POOL: Card[] = [
  { id: "c1", name: "Alt-Tab 瞬切", description: "假裝工作。壓力-5，混亂度+5", type: CardType.SLACKING, energyCost: 5, stressChange: -5, chaosGain: 5, rarity: "C" },
  { id: "c2", name: "偽裝 Meeting", description: "全世界都以為你在開會。壓力-15", type: CardType.SLACKING, energyCost: 10, stressChange: -15, chaosGain: 10, rarity: "B" },
  { id: "c3", name: "傳播八卦", description: "湊過去講秘密。壓力-20，混亂度+20", type: CardType.GOSSIP, energyCost: 15, stressChange: -20, chaosGain: 20, rarity: "A" },
  { id: "c4", name: "偷喝珍奶", description: "珍珠才是本體。壓力-10", type: CardType.SLACKING, energyCost: 0, stressChange: -10, rarity: "B" },
  { id: "c5", name: "椅子賽車", description: "喔喔喔！輪子噴火啦！混亂度+30", type: CardType.PRANK, energyCost: 20, stressChange: -5, chaosGain: 30, rarity: "B" },
  { id: "c6", name: "主管讚賞", description: "老闆瞬移過來拍拍你。壓力-30，獎金+1000", type: CardType.SLACKING, energyCost: 0, stressChange: -30, savingsChange: 1000, rarity: "A" },
  { id: "c7", name: "深呼吸", description: "對著綠色植物深呼吸。壓力-50，混亂度-5", type: CardType.GOSSIP, energyCost: 10, stressChange: -50, chaosGain: -5, rarity: "S" },
  { id: "c10", name: "廁所遁逃", description: "進入薪水傳送門。壓力-20", type: CardType.SLACKING, energyCost: 0, stressChange: -20, rarity: "C" },
  { id: "c11", name: "閃現走位", description: "殘影閃現！躲避追擊。", type: CardType.ESCAPE, energyCost: 10, stressChange: 5, rarity: "B" },
  { id: "c12", name: "無情甩鍋", description: "「這不是我負責的」。自己壓力-15，目標壓力+30", type: CardType.PRANK, energyCost: 15, stressChange: 30, rarity: "B" },
  { id: "c13", name: "請喝咖啡", description: "用咖啡收買人心。目標壓力-40", type: CardType.GOSSIP, energyCost: 5, stressChange: -40, rarity: "A" },
  { id: "c14", name: "滑鼠貼膠帶", description: "看同事修滑鼠。目標壓力+20，混亂度+15", type: CardType.PRANK, energyCost: 10, stressChange: 20, chaosGain: 15, rarity: "C" },
  { id: "c15", name: "背後突襲", description: "「哇！」目標隨機瞬移，混亂度+10", type: CardType.PRANK, energyCost: 15, stressChange: 10, chaosGain: 10, rarity: "B" },
  { id: "c16", name: "代領包裹", description: "幫同事去門口拿包裹。獎金+100", type: CardType.SLACKING, energyCost: 10, stressChange: -10, savingsChange: 100, rarity: "C" },
  { id: "c17", name: "下午茶外送", description: "幫全公司訂珍奶。全體同事壓力-20", type: CardType.GOSSIP, energyCost: 20, stressChange: -20, chaosGain: 15, rarity: "S" },
  { id: "c18", name: "澆水", description: "幫植物澆水。壓力-15，植物散發芬多精光環。", type: CardType.SLACKING, energyCost: 5, stressChange: -15, rarity: "B" },
];

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'privacy_filter',
    name: '防窺螢幕貼',
    description: '降低摸魚時被盯上的機率。出牌造成的混亂度增加速度 -30%。',
    price: 400,
    type: ItemType.TOOL,
    effect: { passive: 'REDUCE_CHAOS' }
  },
  {
    id: 'silent_keyboard',
    name: '靜音紅軸鍵盤',
    description: '敲擊聲極小。出牌時有 15% 機率自動回復 1 點精力。',
    price: 1500,
    type: ItemType.TOOL,
    effect: { passive: 'REDUCE_STRESS_TICK' }
  },
  {
    id: 'macro_script',
    name: '自動辦公腳本',
    description: '背景自動跑報表。每日結算獎金 2 倍，且所有卡片有 10% 機率不扣錢。',
    price: 2200,
    type: ItemType.TOOL,
    effect: { passive: 'BONUS_PERFORMANCE' }
  },
  {
    id: 'noise_canceling_headphones',
    name: '頂級降噪耳機',
    description: '阻隔同事八卦。30% 機率閃避同事丟過來的壓力攻擊。',
    price: 3000,
    type: ItemType.TOOL,
    effect: { passive: 'DODGE_ATTACK' }
  },
  {
    id: 'ergo_pillow',
    name: '人體工學靠枕',
    description: '坐再久都不累。每日下班壓力額外減少 20。',
    price: 800,
    type: ItemType.TOOL,
    effect: { passive: 'BONUS_RECOVERY' }
  },
  {
    id: 'fancy_watch',
    name: '無用但很帥的機械錶',
    description: '單純炫耀？其實能在結算時提高遇到「主管讚賞」卡牌的權重。',
    price: 5000,
    type: ItemType.TOOL,
    effect: { passive: 'LUCK_BOOST' }
  },
  {
    id: 'specialty_coffee',
    name: '頂級特調咖啡',
    description: '【消耗品】立即回復 30 精力 + 消除 40 壓力。購買後價格會永久上漲。',
    price: 1500,
    type: ItemType.CONSUMABLE,
    effect: { value: 30, stat: 'energy' }
  }
];

export const DIALOGUE_CATEGORIES = {
  ACTIVE_ATTACK: "ATTACK",
  PASSIVE_AGGRESSIVE: "PASSIVE_AGGRESSIVE",
  WORK_PRESSURE: "WORK_PRESSURE",
  FAKE_SYMPATHY: "FAKE_SYMPATHY",
  BACKHANDED_COMPLIMENT: "BACKHANDED_COMPLIMENT",
  DIRECT_INSULT: "DIRECT_INSULT",
  CONDESCENDING_ADVICE: "CONDESCENDING_ADVICE",
};

export const DIALOGUE_POOL = {
  // 通用摸魚
  GENERIC: [
    "誰在微波魚排？這味道揮之不去啊...",
    "我想下班，從早上九點開始就在想了。",
    "午餐吃什麼？這是我今天唯一的決策。",
    "只要我不尷尬，尷尬的就是老闆。",
    "這份報告我寫了三天，其實只用了三分鐘。",
    "開會的意義，就是讓大家發現其實不用開會。",
    "剛剛是不是有殘影閃過去？我見鬼了嗎？",
    "薪水小偷？不，我是勞動市場的平衡者。",
    "這週過得好慢，現在才星期二？",
    "如果摸魚是種比賽，我一定是奧運金牌。",
    "我在位子上，但我的靈魂在馬爾地夫。",
  ],
  // 高壓力 (壓力值 > 60)
  STRESSED: [
    "我的 Excel 又當掉了，這一定是天意！",
    "鍵盤敲大聲一點，老闆才會覺得我在工作。",
    "救命... 我感覺靈魂被掏空了。",
    "眼壓好高，我是不是該去點個眼藥水？",
    "(瘋狂打字中，其實在打小說)",
  ],
  // 特殊事件觸發
  EVENT_COFFEE: "咖啡機又壞了，這間公司還有希望嗎？",
  EVENT_FRIDAY: "這週五會下雨嗎？我想去露營...",
  EVENT_DEADLINE: "老闆剛才是不是在看我？(裝忙中)",

  // 攻擊對話（8個）
  ATTACK: [
    "菜鳥，這份報告你來做！明天早上我要看到結果。",
    "新人就是要多學點，這個急件交給你處理。",
    "我這邊忙不過來，你幫我整理這些資料。",
    "老闆說要訓練新人，這個專案給你負責。",
    "你的能力應該可以勝任這個，試試看吧。",
    "幫忙分擔一下，團隊合作嘛。",
    "這個很簡單，你應該很快就能做完。",
    "我教你怎麼做，然後你來完成剩下的部分。"
  ],

  // 被動攻擊性對話（7個）
  PASSIVE_AGGRESSIVE: [
    "菜鳥今天看起來很閒啊，是不是工作太簡單了？",
    "我像你這麼新的時候，一天可以處理三倍的工作量。",
    "慢慢來，反正我們也不急...（諷刺語氣）",
    "你確定這樣做對嗎？算了，新人嘛。",
    "這個錯誤我十年前就不會犯了。",
    "你的方法...很有創意，雖然不是標準做法。",
    "沒關係，多做幾次就會了，雖然時間不等人。"
  ],

  // 工作壓力對話（6個）
  WORK_PRESSURE: [
    "Deadline 是今天下班前，你應該沒問題吧？",
    "老闆剛剛問起這個，我說你在處理了。",
    "這個客戶很難搞，祝你好運。",
    "上次做這個的人已經離職了，原因不明。",
    "這個專案很重要，千萬不能搞砸。",
    "壓力大嗎？這只是開始而已。"
  ],

  // 假同情對話（5個）
  FAKE_SYMPATHY: [
    "看你這麼辛苦，要不要休息一下？不過這個要先做完。",
    "我知道這很難，但大家都經歷過這個階段。",
    "別太有壓力，雖然這個做不好會影響整個部門。",
    "慢慢來，品質比較重要...但今天一定要完成。",
    "你臉色不太好，是不是太累了？做完這個就可以休息了。"
  ],

  // 反手讚美對話（5個）
  BACKHANDED_COMPLIMENT: [
    "以新人來說，你做得還不錯。",
    "這次比上次好多了，雖然還是有進步空間。",
    "你的簡報技巧...很有個人風格。",
    "至少你很努力，這點值得肯定。",
    "想法不錯，如果實際一點會更好。"
  ],

  // 直接侮辱對話（4個）
  DIRECT_INSULT: [
    "菜鳥就是菜鳥，連這個都不會。",
    "你是來上班還是來實習的？",
    "這種水準是怎麼通過面試的？",
    "我來做可能比較快，你只會拖累進度。"
  ],

  // 居高臨下建議對話（5個）
  CONDESCENDING_ADVICE: [
    "讓我教你職場第一課：效率比完美重要。",
    "在我們部門，主動加班是基本態度。",
    "與其問問題，不如自己先試試看。",
    "真正的專業是即使不會也要裝作會。",
    "你的問題在於想太多，做就對了。"
  ],
};

export const NPC_QUOTES = [
  "我的 Excel 又當掉了，這一定是天意。",
  "誰在微波魚排？這味道揮之不去啊...",
  "我想下班，從早上九點開始就在想了。",
  "這週五會下雨嗎？我想去露營...",
  "咖啡機又壞了，這間公司還有希望嗎？",
  "老闆剛才是不是在看我？(裝忙中)",
  "午餐吃什麼？這是我今天唯一的決策。",
  "只要我不尷尬，尷尬的就是老闆。",
  "摸魚不是目的，是一種生活態度。",
  "這份報告我寫了三天，其實只用了三分鐘。",
  "開會的意義，就是讓大家發現其實不用開會。",
  "我的薪水是不是發錯了？怎麼少個零(誤)。",
  "剛剛是不是有殘影閃過去？我見鬼了嗎？",
  "這盆植物長得真好，比我的考績還好。",
  "我剛才 Alt-Tab 的手速快到連影分身都出來了。",
  "薪水小偷？不，我是勞動市場的平衡者。",
  "是戲有人把膠帶黏在我的滑鼠感應器上！",
  "下班後的我才是真正的我，現在只是具肉體。",
  "只要動作夠快，老闆的視線就追不上我。",
  "這週過得好慢，現在才星期二？",
  "我有個大膽的想法，就是現在走出去。",
  "誰又在印表機裡卡紙了？出來面對！",
  "我的咖啡裡沒加糖，但我的心更苦。",
  "老闆今天看起來像顆圓滾滾的小熊，真可愛(誤)。",
  "剛才有人在講我八卦嗎？耳朵好癢。",
  "為什麼要在上班時間談工作？太不專業了。",
  "我的體力值只夠撐到買下午茶的時候。",
  "我在位子上，但我的靈魂在馬爾地夫。",
  "如果摸魚是種比賽，我一定是奧運金牌。",
  "這份 Email 我看了半小時，一個字都沒進去。"
];

export const DAILY_EVENTS: DailyModifier[] = [
  { id: "normal", name: "平常的一天", description: "沒什麼特別的事發生。", stressMult: 1, energyCostMod: 0, bossSpeedMult: 1 },
  { id: "friday", name: "快樂週五", description: "大家心情都很好。壓力增長-50%", stressMult: 0.5, energyCostMod: 0, bossSpeedMult: 0.8 },
  { id: "deadline", name: "地獄趕工日", description: "壓力山大！壓力增長+50%，老闆巡邏變快。", stressMult: 1.5, energyCostMod: 0, bossSpeedMult: 1.3 },
  { id: "coffee_broken", name: "咖啡機故障", description: "噩耗！所有卡片精力消耗 +2。", stressMult: 1.1, energyCostMod: 2, bossSpeedMult: 1 },
  { id: "boss_meeting", name: "老闆開會中", description: "老闆今天很忙。老闆巡邏變慢。", stressMult: 1, energyCostMod: 0, bossSpeedMult: 0.5 },
];
