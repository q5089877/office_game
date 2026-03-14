import { GameManager, Character, Boss } from "./GameClasses";
import { OFFICE_LAYOUT } from "../constants";

export type CardEffectFn = (game: GameManager, player: Character, target: Character, originalId: string) => string;

interface DialogueEntity {
  chatMessage: string | null;
  chatTimer: number;
}

const triggerNPCDialogue = (target: DialogueEntity, message: string, duration: number = 3000) => {
  target.chatMessage = message;
  target.chatTimer = duration;
};

export const CARD_EFFECT_HANDLERS: Record<string, CardEffectFn> = {
  // ================= 摸魚類 (SLACKING) =================
  "s1": (game, player) => {
    const toilet = OFFICE_LAYOUT.objects.find(o => o.id === 'toilet');
    if (toilet) { player.gridX = toilet.x; player.gridY = toilet.y; }
    return "🚽 躲廁所滑短影音，進入精神時光屋。";
  },
  "s2": (game, player) => "蹙起眉頭對著空白 Excel，看起來超級忙碌。 (無人懷疑)",
  "s3": (game, player) => "伸了個大懶腰，骨頭發出清脆的喀喀聲。 (回覆 2 點精力)",
  "s4": (game, player) => "小心翼翼地撕開零食包裝... 喀滋喀滋。 (沒被抓到)",
  "s5": (game, player) => "戴上降噪耳機，對著螢幕點頭，假裝在聽重要的 Online Meeting。",
  "s6": (game, player) => "開始擦拭螢幕和鍵盤，展現優良的辦公室 5S 精神。",
  "s7": (game, player) => {
    triggerNPCDialogue(game.boss, "不錯，繼續保持。", 3000);
    return "老闆路過，順口稱讚了你一句！ (壓力大降)";
  },
  "s8": (game, player) => "偷偷吸了一大口藏在馬克杯裡的手搖飲。 (微糖去冰，靈魂救贖)",
  // 負面
  "s9": (game, player) => "逛網拍一不小心手滑點了結帳... (存款 -500)",
  "s10": (game, player, target) => {
    if (target.id !== player.id) triggerNPCDialogue(target, "他剛剛是不是流口水了？", 3000);
    return `睡太熟被 ${target.name} 發現了！ (壓力上升)`;
  },
  "s11": (game, player) => "看貓咪影片看太入迷，沒發現老闆正在靠近！ (風險激增)",

  // ================= 搞事類 (PRANK) =================
  "p1": (game, player, target) => {
    if (target.id !== player.id) {
      player.gridX = target.gridX; player.gridY = target.gridY;
      triggerNPCDialogue(target, "真假？！他居然這樣做？", 3500);
      return `你湊到 ${target.name} 耳邊大爆料，引發騷動！`;
    }
    return "你大聲自言自語爆料，同事們都覺得你怪怪的。";
  },
  "p2": (game, player, target) => {
    if (target.id !== player.id) {
      target.stats.modifyStress(30);
      triggerNPCDialogue(target, "我的滑鼠怎麼不會動了？！", 4000);
      return `你趁 ${target.name} 不注意，在滑鼠底下反貼了一截透明膠帶。嘿嘿！`;
    }
    return "你無聊到拿膠帶黏自己的滑鼠。";
  },
  "p3": (game, player, target) => {
    if (target.id !== player.id) {
      target.stats.modifyStress(40);
      triggerNPCDialogue(target, "這...這明明是你的專案啊！", 3500);
      return `你順手把黑鍋推給了 ${target.name}：「這塊你比較熟」。`;
    }
    return "甩鍋失敗，鍋還是你的。";
  },
  "p4": (game, player, target) => {
    if (target.id !== player.id) {
      const rx = Math.floor(Math.random() * OFFICE_LAYOUT.gridSize.x);
      const ry = Math.floor(Math.random() * OFFICE_LAYOUT.gridSize.y);
      target.gridX = rx; target.gridY = ry;
      triggerNPCDialogue(target, "哇啊啊啊！嚇死我了啦！", 3000);
      return `你突然在 ${target.name} 背後大叫，他嚇到整個人飛了出去！`;
    }
    return "你在原地跳了一下。";
  },
  "p5": (game, player) => {
    game.colleagues.forEach(c => {
      c.stats.modifyStress(10);
      triggerNPCDialogue(c, "網路斷了！？檔案沒存啊！", 4000);
    });
    return "🔥 你假裝腳滑，一腳踢掉了機房的總交換機電源！ (全區大亂)";
  },
  "p6": (game, player) => {
    const printer = OFFICE_LAYOUT.objects.find(o => o.id === 'printer');
    if (printer) { player.gridX = printer.x; player.gridY = printer.y; }
    return "溜到碎紙機旁，消滅了幾份自己做錯的報表檔案。";
  },
  "p7": (game, player, target) => {
    if (target.id !== player.id) {
      triggerNPCDialogue(target, "呃，好的，我今晚加班處理。", 3500);
      return `你拿著廢紙對 ${target.name} 說：「老闆說這份急件交給你」。 (獲得大量經驗)`;
    }
    return "你對著空氣發號施令。";
  },
  // 負面
  "p8": (game, player, target) => {
    if (target.id !== player.id) {
      triggerNPCDialogue(target, "你當我白痴嗎？", 3000);
      return `搞事失敗！${target.name} 當場識破你的詭計並大聲反擊。(壓力飆升)`;
    }
    return "搞事失敗，不小心砸了自己的腳。";
  },
  "p9": (game, player) => {
    const distToBoss = Math.abs(game.boss.gridX - player.gridX) + Math.abs(game.boss.gridY - player.gridY);
    if (distToBoss <= 3) {
      game.boss.gridX = player.gridX;
      game.boss.gridY = Math.max(0, player.gridY - 1);
      triggerNPCDialogue(game.boss, "是誰動了我的電源線？", 4000);
      return "🔥 完蛋！你拔錯線，直接把老闆電腦的電給切了！ (老闆瞬間逼近)";
    }
    game.player.stats.modifyStress(10);
    return "🔌 拔錯線，但好險是網管的備用線，沒引發災難。(虛驚一場，壓力微增)";
  },
  "p10": (game, player) => {
    triggerNPCDialogue(game.boss, "你在說誰的八卦？", 3000);
    return "八卦傳得太大聲，老闆剛好走過去聽得一清二楚... (壓力飆升)";
  },

  // ================= 閃避類 (EVADE) =================
  "e1": (game, player) => {
    const rx = Math.floor(Math.random() * OFFICE_LAYOUT.gridSize.x);
    const ry = Math.floor(Math.random() * OFFICE_LAYOUT.gridSize.y);
    player.gridX = rx; player.gridY = ry;
    return "💨 殘影閃現！你瞬間啟動量子迴避，出現在辦公室另一個角落。";
  },
  "e2": (game, player) => {
    player.gridY = Math.max(0, player.gridY - 3); // 往前狂衝三格
    game.colleagues.filter(c => Math.abs(c.gridX - player.gridX) <= 1).forEach(c => triggerNPCDialogue(c, "哇！輪子冒煙了！", 2000));
    return "🔥 辦公椅輪胎摩擦起火！你像一陣風一樣衝出走道。";
  },
  "e3": (game, player) => {
    game.colleagues.forEach(c => {
      c.stats.modifyStress(-30);
      triggerNPCDialogue(c, "太神啦！謝謝乾爹/乾媽！", 3500);
    });
    return "🥤 你大手筆使用公費(誤)自掏腰包，請全辦公室喝下午茶。 (全場壓力大減)";
  },
  "e4": (game, player) => {
    player.gridX = game.plant.gridX; player.gridY = game.plant.gridY;
    return "🧘 你走到植栽旁進入禪定模式，周圍的喧囂都與你無關。 (壓力大幅減少)";
  },
  "e5": (game, player) => {
    player.gridX = OFFICE_LAYOUT.door.x; player.gridY = OFFICE_LAYOUT.door.y;
    return "📦 「我去門口拿個快遞！」完美的藉口，順利脫離戰區。";
  },
  "e6": (game, player) => {
    return "⚡ 展現了 300 APM 的手速，瞬間完成報告並送出！ (XP 激增)";
  },
  // 負面
  "e7": (game, player) => {
    player.gridX = Math.min(OFFICE_LAYOUT.gridSize.x - 1, player.gridX + 1);
    return "💥 閃現失誤！你直接撞到旁邊的文件櫃，頭超痛！ (壓力激減)";
  },
  "e8": (game, player) => {
    player.gridX = game.boss.gridX; player.gridY = game.boss.gridY;
    triggerNPCDialogue(game.boss, "你跑這麼急要去哪？", 3000);
    return "💀 悲劇！你一個神走位，好巧不巧直接衝進老闆懷裡！";
  },
  "e9": (game, player) => {
    game.colleagues.forEach(c => triggerNPCDialogue(c, "結果是用公家的錢買的？", 3000));
    return "💸 大家發現你請客的下午茶是用之前廠商送的禮券換的。 (被狂碎念)";
  }
};
