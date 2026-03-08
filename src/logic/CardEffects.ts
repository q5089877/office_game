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
  "c1": (game, player, target) => {
    if (target.id !== player.id) triggerNPCDialogue(target, "你剛剛是不是在偷看動畫？", 2500);
    return "手速爆發！老闆完全沒發現你在看動畫。";
  },
  "c2": (game, player, target) => {
    if (target.id !== player.id) triggerNPCDialogue(target, "他戴著耳機，應該在開重要會議吧？", 3000);
    return "戴上耳機，全世界都以為你在開會 (其實在睡覺)。";
  },
  "c3": (game, player, target) => {
    if (target.id !== player.id) {
      player.gridX = target.gridX; player.gridY = target.gridY;
      triggerNPCDialogue(target, "什麼？！老闆真的...？", 3500);
      return `你湊到 ${target.name} 耳邊說：「聽說老闆其實...」`;
    }
    return "你在自言自語講八卦。";
  },
  "c4": (game, player, target) => {
    const vending = OFFICE_LAYOUT.objects.find(o => o.id === 'vending');
    if (vending) { player.gridX = vending.x; player.gridY = vending.y; }
    return "咕嚕咕嚕... 珍珠才是本體！";
  },
  "c5": (game, player, target) => {
    const rx = Math.floor(Math.random() * OFFICE_LAYOUT.gridSize.x);
    const ry = Math.floor(Math.random() * OFFICE_LAYOUT.gridSize.y);
    player.gridX = rx; player.gridY = ry;
    game.colleagues.filter(c => Math.abs(c.gridX - rx) <= 3 && Math.abs(c.gridY - ry) <= 3)
      .forEach(colleague => triggerNPCDialogue(colleague, "哇！剛剛那是什麼？", 2000));
    return "喔喔喔喔！椅子輪子噴火啦！";
  },
  "c6": (game, player, target) => {
    game.boss.gridX = player.gridX; game.boss.gridY = player.gridY;
    triggerNPCDialogue(game.boss, "我看好你喔 (眼神死)", 4000);
    return "老闆瞬移過來拍拍你：「我看好你喔 (眼神死)」。";
  },
  "c7": (game, player, target) => {
    player.gridX = game.plant.gridX; player.gridY = game.plant.gridY;
    return "對著綠色植物深呼吸，心情平靜了許多。";
  },
  "c10": (game, player, target) => {
    const toilet = OFFICE_LAYOUT.objects.find(o => o.id === 'toilet');
    if (toilet) { player.gridX = toilet.x; player.gridY = toilet.y; }
    return "進入薪水傳送門 (廁所)，開始滑手機...。";
  },
  "c11": (game, player, target) => {
    const dir = [[0,1],[0,-1],[1,0],[-1,0]][Math.floor(Math.random()*4)];
    player.gridX = Math.max(0,Math.min(10,player.gridX+dir[0]));
    player.gridY = Math.max(0,Math.min(6,player.gridY+dir[1]));
    return "殘影閃現！同事以為見鬼了。";
  },
  "c12": (game, player, target) => {
    if (target.id !== player.id) {
      target.stats.modifyStress(30);
      triggerNPCDialogue(target, "這...這不是我負責的啊！", 3500);
      return `你把報告丟給 ${target.name}：「這部分你比較熟」。`;
    }
    return "這鍋甩不掉啊！";
  },
  "c13": (game, player, target) => {
    if (target.id !== player.id) {
      target.stats.modifyStress(-40);
      triggerNPCDialogue(target, "謝謝你的咖啡！", 3000);
      return `你請 ${target.name} 喝星 X 克，關係變好了！`;
    }
    return "你給自己買了杯咖啡。";
  },
  "c14": (game, player, target) => {
    if (target.id !== player.id) {
      target.stats.modifyStress(20);
      triggerNPCDialogue(target, "我的滑鼠怎麼不動了？！", 4000);
    }
    return `你偷偷在 ${target.name} 的滑鼠感應器貼了膠帶。嘿嘿！`;
  },
  "c15": (game, player, target) => {
    if (target.id !== player.id) {
      const rx = Math.floor(Math.random() * OFFICE_LAYOUT.gridSize.x);
      const ry = Math.floor(Math.random() * OFFICE_LAYOUT.gridSize.y);
      target.gridX = rx; target.gridY = ry;
      triggerNPCDialogue(target, "哇啊啊啊！嚇死我了！", 3000);
      return `你突然在 ${target.name} 背後大喊，他嚇到整個人彈飛了！`;
    }
    return "你被自己的影子嚇到了。";
  },
  "c16": (game, player, target) => {
    const door = OFFICE_LAYOUT.door;
    player.gridX = door.x; player.gridY = door.y;
    return "跑去門口幫大家拿包裹，表現得很積極！";
  },
  "c17": (game, player, target) => {
    player.gridX = OFFICE_LAYOUT.door.x; player.gridY = OFFICE_LAYOUT.door.y;
    game.colleagues.forEach(c => {
      c.stats.modifyStress(-20);
      triggerNPCDialogue(c, "珍奶萬歲！謝謝你！", 3000);
    });
    return "珍奶外送到了！全辦公室都聞到了幸福的味道 🥤";
  },
  "c18": (game, player, target) => {
    player.gridX = game.plant.gridX; player.gridY = game.plant.gridY;
    game.plant.boostTimer = 10000; // 光環持續 10 秒
    return "你幫植物澆了水，空氣中充滿了芬多精！(周圍壓力持續下降)";
  }
};
