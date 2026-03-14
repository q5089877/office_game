import { PlayerRole, ActionEvent, ActionCategory, DailyModifier, Gender, ShopItem, ItemType } from "./types";

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

export const EVENT_POOL: ActionEvent[] = [
  // ================= 摸魚類 (SLACKING) =================
  // 正面 (低耗能 / 回壓)
  { id: "s1", name: "廁所滑手機", description: "進入精神時光屋。壓力-10", category: ActionCategory.SLACKING, energyCost: 5, stressChange: -10 },
  { id: "s2", name: "假裝看報表", description: "眉頭深鎖假裝查錯。壓力-10", category: ActionCategory.SLACKING, energyCost: 5, stressChange: -10 },
  { id: "s3", name: "伸懶腰", description: "拉筋放鬆。壓力-5，恢復 2 精力", category: ActionCategory.SLACKING, energyCost: 0, stressChange: -5, xpGain: 5 },
  { id: "s4", name: "偷吃零食", description: "咀嚼聲很小心。壓力-12", category: ActionCategory.SLACKING, energyCost: 5, stressChange: -12 },
  { id: "s5", name: "戴耳機開會", description: "全世界以為你在聽簡報。壓力-15", category: ActionCategory.SLACKING, energyCost: 10, stressChange: -15 },
  { id: "s6", name: "整理桌面", description: "假裝很忙的經典招式。壓力-8，混亂-5", category: ActionCategory.SLACKING, energyCost: 5, stressChange: -8, chaosGain: -5 },
  { id: "s7", name: "主管讚賞", description: "老闆路過順口稱讚。壓力-20", category: ActionCategory.SLACKING, energyCost: 5, stressChange: -20, xpGain: 20 },
  { id: "s8", name: "喝口手搖飲", description: "微糖去冰，靈魂救贖。壓力-15", category: ActionCategory.SLACKING, energyCost: 5, stressChange: -15 },
  // 負面 (摸魚翻車)
  { id: "s9", name: "逛網拍手滑", description: "不小心刷了卡... 存款-500", category: ActionCategory.SLACKING, energyCost: 5, stressChange: 0, savingsChange: -500 },
  { id: "s10", name: "流口水被笑", description: "睡太熟被同事發現。壓力+15", category: ActionCategory.SLACKING, energyCost: 5, stressChange: 15 },
  { id: "s11", name: "滑過頭", description: "看影片忘了時間。老闆接近度增加", category: ActionCategory.SLACKING, energyCost: 5, stressChange: 5, chaosGain: 10 },

  // ================= 搞事類 (PRANK) =================
  // 正面 (高XP / 混亂度)
  { id: "p1", name: "傳播八卦", description: "湊過去講秘密。混亂度+20", category: ActionCategory.PRANK, energyCost: 15, stressChange: -5, chaosGain: 20, xpGain: 30 },
  { id: "p2", name: "滑鼠貼膠帶", description: "看同事修滑鼠。對方壓力+30", category: ActionCategory.PRANK, energyCost: 10, stressChange: 5, chaosGain: 15, xpGain: 20 },
  { id: "p3", name: "無情甩鍋", description: "這不歸我管。自己壓力-20，指定同事壓力+40", category: ActionCategory.PRANK, energyCost: 15, stressChange: -20, xpGain: 25 },
  { id: "p4", name: "背後突襲", description: "「哇！」目標隨機瞬移，混亂度+10", category: ActionCategory.PRANK, energyCost: 15, stressChange: 0, chaosGain: 10, xpGain: 15 },
  { id: "p5", name: "拔掉網路線", description: "全區斷網！混亂度+40", category: ActionCategory.PRANK, energyCost: 20, stressChange: -10, chaosGain: 40, xpGain: 50 },
  { id: "p6", name: "把文件碎掉", description: "消滅證據。壓力-15", category: ActionCategory.PRANK, energyCost: 10, stressChange: -15, chaosGain: 5 },
  { id: "p7", name: "假傳聖旨", description: "「老闆說這份給你做」。XP大量增加", category: ActionCategory.PRANK, energyCost: 15, stressChange: -10, chaosGain: 20, xpGain: 40 },
  // 負面 (搞事翻車)
  { id: "p8", name: "搞事被抓包", description: "同事立刻反擊！壓力+30", category: ActionCategory.PRANK, energyCost: 15, stressChange: 30, chaosGain: 10 },
  { id: "p9", name: "拔錯線", description: "拔到老闆電腦的電源線... (立刻引來老闆)", category: ActionCategory.PRANK, energyCost: 15, stressChange: 50, chaosGain: 50 },
  { id: "p10", name: "八卦傳錯人", description: "對方剛好是當事人！壓力+25", category: ActionCategory.PRANK, energyCost: 15, stressChange: 25 },

  // ================= 閃避類 (EVADE) =================
  // 正面 (改變走位 / 大降壓)
  { id: "e1", name: "殘影閃現", description: "瞬間長距離位移。躲避攻擊！", category: ActionCategory.EVADE, energyCost: 15, stressChange: 0, xpGain: 10 },
  { id: "e2", name: "椅子噴火衝刺", description: "輪子磨出火花！長距位移，混亂+15", category: ActionCategory.EVADE, energyCost: 20, stressChange: -5, chaosGain: 15 },
  { id: "e3", name: "請客收買人心", description: "幫全辦公室訂飲料。全體同仁壓力-20", category: ActionCategory.EVADE, energyCost: 15, stressChange: -30, savingsChange: -300 },
  { id: "e4", name: "戰略性深呼吸", description: "瞬間進入禪定。壓力-25", category: ActionCategory.EVADE, energyCost: 15, stressChange: -25 },
  { id: "e5", name: "代領包裹", description: "跑去門口拿快遞。位移到門口，壓力-10", category: ActionCategory.EVADE, energyCost: 10, stressChange: -10 },
  { id: "e6", name: "光速回報", description: "瞬間交出報告。XP+50，壓力-12", category: ActionCategory.EVADE, energyCost: 20, stressChange: -12, xpGain: 50 },
  // 負面 (閃避翻車)
  { id: "e7", name: "閃現撞牆", description: "頭超痛！壓力+30", category: ActionCategory.EVADE, energyCost: 15, stressChange: 30 },
  { id: "e8", name: "衝進老闆懷裡", description: "位移到老闆旁邊！危險度爆表", category: ActionCategory.EVADE, energyCost: 15, stressChange: 40 },
  { id: "e9", name: "假請客被識破", description: "大家發現是用公費買的。壓力+35", category: ActionCategory.EVADE, energyCost: 15, stressChange: 35 }
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
  "是誰把膠帶黏在我的滑鼠感應器上！",
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
  "這份 Email 我看了半小時，一個字都沒進去。",
  "我剛才是不是不小心點了「全部回覆」？完蛋了，人生走馬燈開始閃過。",
  "辦公室冷氣的頻率，聽起來跟我靈魂破碎的聲音一模一樣。",
  "我不是在發呆，我是在進行「雲端大腦同步」，只是網路有點慢。",
  "打字聲越大，代表我內心的 OS 越多，並不代表產出越多。",
  "為什麼下午三點的陽光總是這麼誘惑？它在叫我出去流浪。",
  "這封信我讀了五遍，字我都認識，但湊在一起就變成了外星語。",
  "螢幕亮度調這麼低，是為了保護我那正在摸魚的純真雙眼。",
  "飲水機是我唯一的社交圈，那裡的情報比老闆的公告還精準。",
  "只要我的電腦不關機，我的專案就在進行中（理論上）。",
  "其實我的專長不是寫程式，是精準計算還有幾秒鐘可以打卡。"
];

export const DAILY_EVENTS: DailyModifier[] = [
  { id: "normal", name: "平常的一天", description: "沒什麼特別的事發生。", stressMult: 1, energyCostMod: 0, bossSpeedMult: 1 },
  { id: "friday", name: "快樂週五", description: "大家心情都很好。壓力增長-50%", stressMult: 0.5, energyCostMod: 0, bossSpeedMult: 0.8 },
  { id: "deadline", name: "地獄趕工日", description: "壓力山大！壓力增長+50%，老闆巡邏變快。", stressMult: 1.5, energyCostMod: 0, bossSpeedMult: 1.3 },
  { id: "coffee_broken", name: "咖啡機故障", description: "噩耗！所有卡片精力消耗 +2。", stressMult: 1.1, energyCostMod: 2, bossSpeedMult: 1 },
  { id: "boss_meeting", name: "老闆開會中", description: "老闆今天很忙。老闆巡邏變慢。", stressMult: 1, energyCostMod: 0, bossSpeedMult: 0.5 },
];

export const ABSENCE_REASONS = [
  "今天請假去面試了。",
  "宣稱外送遲到心情不好，決定在家遠端 (實際在打電動)。",
  "去百貨公司排隊搶週年慶限量商品。",
  "說要去看牙醫，其實是去星巴克發呆。",
  "電腦壞了，在等維修人員 (其實是把水灑在鍵盤上)。",
  "家裡的貓心情不好，需要留下來陪牠。",
  "去參加一個「如何不著痕跡地摸魚」的秘密研討會。",
  "今天出差去分公司支援 (其實是去外縣市吃美食)。",
  "說昨晚加班太累，今天晚點到 (結果直接消失)。",
  "家裡漏水，在等水電工 (其實是趁機補眠)。",
  "去辦理複雜的行政手續，估計要一整天。",
  "跟老闆說要陪家人複診，實際上是去追星。",
  "算命老師說今天命中缺水，不宜在辦公室久坐。",
  "突然想念起外婆煮的雞湯，決定回家一趟。",
  "去參加前任的婚禮，打算坐最後一排默默哭泣。",
  "昨晚追劇到三點，現在眼睛完全睜不開。",
  "發現公司附近的流浪貓在生小貓，要去幫忙接生。",
  "覺得今天的風兒有點喧囂，心情不適合工作。",
  "宣稱在路上撿到受傷的小狗，要送去獸醫院。",
  "說要回家拿重要文件，結果一回家就發現床在呼喚他。",
  "要去參加一個神祕的「摸魚達人」實體聚會。",
  "家裡的掃地機器人造反了，得回去安撫它。",
  "早上醒來發現左眼皮一直跳，感覺今天不宜與長官面談。",
  "昨晚宵夜太鹹，早上起床臉腫到認不出自己，沒臉見人。",
  "在路邊看兩位老爺爺下棋，一不小心就入迷到現在。",
  "被關在電梯裡了 (其實是在電梯裡收訊不好趁機看小說)。",
  "覺得辦公室今年的風水跟我的生肖相衝，打算在家避一避。",
  "巷口的阿婆說我是她今天的第 999 個客人，送了我一碗麵，得吃完。",
  "突然領悟到人生的意義在於耍廢，需要一整天的時間來消化這個真理。",
  "昨晚夢到公司倒閉，需要今天一整天來平復驚嚇的心情。",
  "發現鄰居家的 Wi-Fi 沒設密碼，決定留在家測試網路品質。",
  "覺得自己的影子今天看起來特別委屈，得留下來陪它聊聊。",
  "宣稱要去圖書館找專業資料，實際上是在冷氣房看漫畫。",
  "正在研究如何透過意念讓案子自己結案，目前進入關鍵階段。",
  "家裡的冷氣突然發出神祕的低頻音，懷疑是外星人在跟我溝通。",
  "去幫隔壁鄰居抓蛇，結果發現其實只是一截斷掉的水管。",
  "為了參加週末的馬拉松，今天需要提前進入「深度休眠」模式。",
  "路過公園覺得那棵樹長得很像我，想研究一下它的人(樹)生觀。",
  "在浴室洗澡時突然有了偉大靈感，怕一出門就被冷風吹散，趕快記錄。",
  "發現今天穿的兩隻襪子顏色不一樣，覺得這是不祥之兆，不敢出門。",
  "為了搶限量演唱會門票，現在正在網咖駐點待命。",
  "早餐吃得太飽，導致大腦供血不足，目前思考功能暫時當機。",
  "在上班路上被神祕磁場干擾，回過神來發現自己已經在百貨公司了。",
  "正在進行一項「24 小時不說話」的修行，怕去辦公室會破功。",
  "報名了「如何克服拖延症」的講座，結果因為拖延症發作遲到了。",
  "家裡的仙人掌看起來快枯萎了，得回去幫它做人工呼吸。",
  "覺得今天的宇宙射線太強，不適合長時間待在電腦螢幕前。",
  "宣稱要去拜訪客戶，實際上是在超商門市試喝最新款的限量拿鐵。",
  "昨晚夢見財神爺跟我說，今天如果待在家裡會有意外之財。",
  "單純覺得今天的雲朵長得很像炸雞腿，突然好想去吃炸雞。"
];

