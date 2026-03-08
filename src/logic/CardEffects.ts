import { GameManager, Character, Boss } from "./GameClasses";
import { OFFICE_LAYOUT } from "../constants";

export type CardEffectFn = (game: GameManager, player: Character, target: Character, originalId: string) => string;

/**
 * 對話實體介面 - 任何有chatMessage和chatTimer的物件
 */
interface DialogueEntity {
  chatMessage: string | null;
  chatTimer: number;
}

/**
 * 觸發NPC對話反應的輔助函數
 */
const triggerNPCDialogue = (target: DialogueEntity, message: string, duration: number = 3000) => {
  target.chatMessage = message;
  target.chatTimer = duration;
};

export const CARD_EFFECT_HANDLERS: Record<string, CardEffectFn> = {
  "c1": (game, player, target) => {
    // Alt-Tab 瞬切
    if (target.id !== player.id) {
      triggerNPCDialogue(target, "你剛剛是不是在偷看動畫？", 2500);
    }
    return "手速爆發！老闆完全沒發現你在看動畫。";
  },
  "c2": (game, player, target) => {
    // 偽裝 Meeting
    if (target.id !== player.id) {
      triggerNPCDialogue(target, "他戴著耳機，應該在開重要會議吧？", 3000);
    }
    return "戴上耳機，全世界都以為你在開會 (其實在睡覺)。";
  },
  "c3": (game, player, target) => {
    // 傳播八卦
    if (target.id !== player.id) {
      player.move(target.gridX, target.gridY);
      triggerNPCDialogue(target, "什麼？！老闆真的...？", 3500);
      return `你湊到 ${target.name} 耳邊說：「聽說老闆其實...」`;
    }
    return "你在自言自語講八卦。";
  },
  "c4": (game, player, target) => {
    // 偷喝珍奶
    const vending = OFFICE_LAYOUT.objects.find(o => o.id === 'vending');
    if (vending) player.move(vending.x, vending.y);

    // 附近的同事可能會評論
    const nearbyColleagues = game.colleagues.filter(c =>
      Math.abs(c.gridX - player.gridX) <= 2 &&
      Math.abs(c.gridY - player.gridY) <= 2
    );
    if (nearbyColleagues.length > 0) {
      const randomColleague = nearbyColleagues[Math.floor(Math.random() * nearbyColleagues.length)];
      triggerNPCDialogue(randomColleague, "珍奶的香味...好羨慕！", 2500);
    }

    return "咕嚕咕嚕... 珍珠才是本體！";
  },
  "c5": (game, player, target) => {
    // 椅子賽車
    const rx = Math.floor(Math.random() * OFFICE_LAYOUT.gridSize.x);
    const ry = Math.floor(Math.random() * OFFICE_LAYOUT.gridSize.y);
    player.move(rx, ry);

    // 附近的同事反應
    const nearbyColleagues = game.colleagues.filter(c =>
      Math.abs(c.gridX - rx) <= 3 &&
      Math.abs(c.gridY - ry) <= 3
    );
    nearbyColleagues.forEach(colleague => {
      triggerNPCDialogue(colleague, "哇！剛剛那是什麼？", 2000);
    });

    return "喔喔喔喔！椅子輪子噴火啦！";
  },
  "c6": (game, player, target) => {
    // 主管讚賞
    game.boss.move(player.gridX, player.gridY);
    triggerNPCDialogue(game.boss, "我看好你喔 (眼神死)", 4000);
    return "老闆瞬移過來拍拍你：「我看好你喔 (眼神死)」。";
  },
  "c7": (game, player, target) => {
    // 深呼吸
    player.move(game.plant.gridX, game.plant.gridY);
    return "對著綠色植物深呼吸，心情平靜了許多。";
  },
  "c10": (game, player, target) => {
    // 廁所遁逃
    const toilet = OFFICE_LAYOUT.objects.find(o => o.id === 'toilet');
    if (toilet) player.move(toilet.x, toilet.y);

    // 附近的同事可能會注意到
    const nearbyColleagues = game.colleagues.filter(c =>
      Math.abs(c.gridX - toilet.x) <= 2 &&
      Math.abs(c.gridY - toilet.y) <= 2
    );
    if (nearbyColleagues.length > 0) {
      const randomColleague = nearbyColleagues[Math.floor(Math.random() * nearbyColleagues.length)];
      triggerNPCDialogue(randomColleague, "他又去廁所了...", 2000);
    }

    return "進入薪水傳送門 (廁所)，開始滑手機...。";
  },
  "c11": (game, player, target) => {
    // 閃現走位
    const dir = [[0,1],[0,-1],[1,0],[-1,0]][Math.floor(Math.random()*4)];
    const newX = Math.max(0,Math.min(10,player.gridX+dir[0]));
    const newY = Math.max(0,Math.min(6,player.gridY+dir[1]));
    player.move(newX, newY);

    // 附近的同事反應
    const nearbyColleagues = game.colleagues.filter(c =>
      Math.abs(c.gridX - newX) <= 2 &&
      Math.abs(c.gridY - newY) <= 2
    );
    nearbyColleagues.forEach(colleague => {
      triggerNPCDialogue(colleague, "剛剛是不是有殘影？", 2500);
    });

    return "殘影閃現！同事以為見鬼了。";
  },
  "c12": (game, player, target) => {
    // 無情甩鍋
    if (target.id !== player.id) {
      player.stats.modifyStress(-15);
      triggerNPCDialogue(target, "這...這不是我負責的啊！", 3500);
      return `你把報告丟給 ${target.name}：「這部分你比較熟」。`;
    }
    return "這鍋甩不掉啊！";
  },
  "c13": (game, player, target) => {
    // 請喝咖啡
    if (target.id !== player.id) {
      player.charisma += 5;
      triggerNPCDialogue(target, "謝謝你的咖啡！", 3000);
      return `你請 ${target.name} 喝星 X 克，關係變好了！`;
    }
    return "你給自己買了杯咖啡。";
  },
  "c14": (game, player, target) => {
    // 滑鼠貼膠帶
    if (target.id !== player.id) {
      triggerNPCDialogue(target, "我的滑鼠怎麼不動了？！", 4000);
    }
    return `你偷偷在 ${target.name} 的滑鼠感應器貼了膠帶。嘿嘿！`;
  },
  "c15": (game, player, target) => {
    // 背後突襲
    if (target.id !== player.id) {
      const rx = Math.floor(Math.random() * OFFICE_LAYOUT.gridSize.x);
      const ry = Math.floor(Math.random() * OFFICE_LAYOUT.gridSize.y);
      target.move(rx, ry);
      triggerNPCDialogue(target, "哇啊啊啊！嚇死我了！", 3000);
      return `你突然在 ${target.name} 背後大喊，他嚇到整個人彈飛了！`;
    }
    return "你被自己的影子嚇到了。";
  },
  "c16": (game, player, target) => {
    // 代領包裹
    const door = OFFICE_LAYOUT.door;
    player.move(door.x, door.y);
    player.charisma += 3;

    // 隨機一個同事表示感謝
    if (game.colleagues.length > 0) {
      const randomColleague = game.colleagues[Math.floor(Math.random() * game.colleagues.length)];
      triggerNPCDialogue(randomColleague, "謝謝你幫我拿包裹！", 2500);
    }

    return "跑去門口幫大家拿包裹，表現得很積極！";
  },
  "c17": (game, player, target) => {
    // 下午茶外送
    player.move(OFFICE_LAYOUT.door.x, OFFICE_LAYOUT.door.y);

    // 全體同事受益並表示感謝
    game.colleagues.forEach(c => {
      c.stats.modifyStress(-20);
      triggerNPCDialogue(c, "珍奶萬歲！謝謝你！", 3000);
    });

    player.charisma += 10;
    return "珍奶外送到了！全辦公室都聞到了幸福的味道 🥤";
  }
};
