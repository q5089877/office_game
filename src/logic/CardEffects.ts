import { GameManager, Character } from "./GameClasses";
import { OFFICE_LAYOUT } from "../constants";

export type CardEffectFn = (game: GameManager, player: Character, target: Character, originalId: string) => string;

export const CARD_EFFECT_HANDLERS: Record<string, CardEffectFn> = {
  "c1": () => "手速爆發！老闆完全沒發現你在看動畫。",
  "c2": () => "戴上耳機，全世界都以為你在開會 (其實在睡覺)。",
  "c3": (game, player, target) => {
    if (target.id !== player.id) {
      player.move(target.gridX, target.gridY);
      return `你湊到 ${target.name} 耳邊說：「聽說老闆其實...」`;
    }
    return "你在自言自語講八卦。";
  },
  "c4": (game, player) => {
    const vending = OFFICE_LAYOUT.objects.find(o => o.id === 'vending');
    if (vending) player.move(vending.x, vending.y);
    return "咕嚕咕嚕... 珍珠才是本體！";
  },
  "c5": (game, player) => {
    const rx = Math.floor(Math.random() * OFFICE_LAYOUT.gridSize.x);
    const ry = Math.floor(Math.random() * OFFICE_LAYOUT.gridSize.y);
    player.move(rx, ry);
    return "喔喔喔喔！椅子輪子噴火啦！";
  },
  "c6": (game, player) => {
    game.boss.move(player.gridX, player.gridY);
    return "老闆瞬移過來拍拍你：「我看好你喔 (眼神死)」。";
  },
  "c7": (game, player) => {
    player.move(game.plant.gridX, game.plant.gridY);
    return "對著綠色植物深呼吸，心情平靜了許多。";
  },
  "c10": (game, player) => {
    const toilet = OFFICE_LAYOUT.objects.find(o => o.id === 'toilet');
    if (toilet) player.move(toilet.x, toilet.y);
    return "進入薪水傳送門 (廁所)，開始滑手機...。";
  },
  "c11": (game, player) => {
    const dir = [[0,1],[0,-1],[1,0],[-1,0]][Math.floor(Math.random()*4)];
    player.move(Math.max(0,Math.min(10,player.gridX+dir[0])), Math.max(0,Math.min(6,player.gridY+dir[1])));
    return "殘影閃現！同事以為見鬼了。";
  },
  "c12": (game, player, target) => {
    if (target.id !== player.id) {
      player.stats.modifyStress(-15);
      return `你把報告丟給 ${target.name}：「這部分你比較熟」。`;
    }
    return "這鍋甩不掉啊！";
  },
  "c13": (game, player, target) => {
    if (target.id !== player.id) {
      player.charisma += 5;
      return `你請 ${target.name} 喝星 X 克，關係變好了！`;
    }
    return "你給自己買了杯咖啡。";
  },
  "c14": (game, player, target) => {
    return `你偷偷在 ${target.name} 的滑鼠感應器貼了膠帶。嘿嘿！`;
  },
  "c15": (game, player, target) => {
    if (target.id !== player.id) {
      const rx = Math.floor(Math.random() * OFFICE_LAYOUT.gridSize.x);
      const ry = Math.floor(Math.random() * OFFICE_LAYOUT.gridSize.y);
      target.move(rx, ry);
      return `你突然在 ${target.name} 背後大喊，他嚇到整個人彈飛了！`;
    }
    return "你被自己的影子嚇到了。";
  },
  "c16": (game, player) => {
    const door = OFFICE_LAYOUT.door;
    player.move(door.x, door.y);
    player.charisma += 3;
    return "跑去門口幫大家拿包裹，表現得很積極！";
  },    "c17": (game, player) => {
    // 門口拿外送
    player.move(OFFICE_LAYOUT.door.x, OFFICE_LAYOUT.door.y);

    // 全體同事受益
    game.colleagues.forEach(c => {
      c.stats.modifyStress(-20);
    });

    player.charisma += 10;
    return "珍奶外送到了！全辦公室都聞到了幸福的味道 🥤";
    }
    };
