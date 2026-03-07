import { useState, useCallback, useEffect } from 'react';
import { GameManager, Character, EntityType, Stats, Gender } from './logic/GameClasses';
import { PlayerRole, CardType } from './types';
import { CARD_POOL, OFFICE_LAYOUT } from './constants';

export function useGameEngine() {
  const [manager, setManager] = useState<GameManager>(() => {
    // 找出所有可用的座位
    const allDesks = OFFICE_LAYOUT.clusters.flatMap(c => c.desks);
    const availableDesks = allDesks.filter(d => d.owner === null);
    
    // 隨機選一個空位作為玩家座位
    const randomIdx = Math.floor(Math.random() * availableDesks.length);
    const playerDesk = availableDesks[randomIdx];
    
    const player = new Character('player', '新進員工', EntityType.PLAYER, new Stats(100, 0, 1000, 100), playerDesk.x, playerDesk.y, Gender.MALE);
    (player as any).xp = 0;
    (player as any).level = 1;
    (player as any).mp = 100;
    (player as any).maxMp = 100;
    (player as any).luck = 5;
    (player as any).charisma = 10;

    const colleagues: Character[] = [];
    OFFICE_LAYOUT.clusters.forEach(cluster => {
      cluster.desks.forEach(desk => {
        if (desk.owner !== null && desk.id !== 'player') {
          colleagues.push(new Character(desk.id, desk.label, EntityType.COLLEAGUE, new Stats(80, 10, 500), desk.x, desk.y, desk.gender || Gender.MALE));
        }
      });
    });

    const m = new GameManager(player, colleagues);
    // 給予初始手牌，加上唯一後綴
    m.handIds = ["c1", "c2", "c11"].map(id => `${id}_${Math.random()}`);
    return m;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setManager(prev => {
        const next = prev.clone();
        next.tick();
        return next;
      });
    }, 33);
    return () => clearInterval(timer);
  }, []);

  const playCard = useCallback((uniqueCardId: string, targetPlayerId: string) => {
    setManager(prev => {
      const originalId = uniqueCardId.split('_')[0];
      const cardTemplate = CARD_POOL.find(c => c.id === originalId);
      const p = prev.player as any;

      if (!cardTemplate) return prev;
      
      if (p.mp < cardTemplate.mpCost) {
        const next = prev.clone();
        next.lastEvent = `⚠️ 摸魚值不足！需要 ${cardTemplate.mpCost} MP，但你只有 ${p.mp} MP。`;
        return next;
      }

      const next = prev.clone();
      const np = next.player as any;
      np.mp -= cardTemplate.mpCost;

      const target = next.player.id === targetPlayerId ? next.player : next.colleagues.find(c => c.id === targetPlayerId);
      if (target) {
          target.stats.modifyStress(cardTemplate.stressChange);
          target.stats.modifyEnergy(cardTemplate.hpChange || 0);
          if (cardTemplate.savingsChange) next.player.stats.modifyMoney(cardTemplate.savingsChange);
          next.chaosLevel += cardTemplate.chaosGain || 0;
          np.xp += 15;
          next.activityThisDay += 1;

          let eventMsg = `使用了 [${cardTemplate.name}]！`;
          const targetIsPlayer = target.id === 'player';

          // 增加角色互動邏輯：讓卡片效果具象化
          switch (originalId) {
            case "c1": // Alt-Tab
              eventMsg = "手速爆發！老闆完全沒發現你在看動畫。";
              break;
            case "c2": // 偽裝 Meeting
              eventMsg = "戴上耳機，全世界都以為你在開會 (其實在睡覺)。";
              break;
            case "c3": // 傳播八卦
              if (!targetIsPlayer) {
                next.player.move(target.gridX, target.gridY);
                eventMsg = `你湊到 ${target.name} 耳邊說：「聽說老闆其實...」`;
              }
              break;
            case "c4": // 偷喝珍奶
              const vending = OFFICE_LAYOUT.objects.find(o => o.id === 'vending');
              if (vending) next.player.move(vending.x, vending.y);
              eventMsg = "咕嚕咕嚕... 珍珠才是本體！";
              break;
            case "c5": // 椅子賽車
              const rx = Math.floor(Math.random() * OFFICE_LAYOUT.gridSize.x);
              const ry = Math.floor(Math.random() * OFFICE_LAYOUT.gridSize.y);
              next.player.move(rx, ry);
              eventMsg = "喔喔喔喔！椅子輪子噴火啦！";
              break;
            case "c6": // 主管讚賞
              next.boss.move(next.player.gridX, next.player.gridY);
              eventMsg = "老闆瞬移過來拍拍你：「我看好你喔 (眼神死)」。";
              break;
            case "c7": // 調戲貓咪
              next.player.move(next.cat.gridX, next.cat.gridY);
              eventMsg = "吸貓一口，精神百倍！貓咪覺得你很煩。";
              break;
            case "c10": // 廁所遁逃
              const toilet = OFFICE_LAYOUT.objects.find(o => o.id === 'toilet');
              if (toilet) next.player.move(toilet.x, toilet.y);
              eventMsg = "進入薪水傳送門 (廁所)，開始滑手機...。";
              break;
            case "c11": // 閃現走位
              const dir = [[0,1],[0,-1],[1,0],[-1,0]][Math.floor(Math.random()*4)];
              next.player.move(Math.max(0,Math.min(10,next.player.gridX+dir[0])), Math.max(0,Math.min(6,next.player.gridY+dir[1])));
              eventMsg = "殘影閃現！同事以為見鬼了。";
              break;
            case "c12": // 無情甩鍋
              if (!targetIsPlayer) {
                next.player.stats.modifyStress(-15);
                eventMsg = `你把報告丟給 ${target.name}：「這部分你比較熟」。`;
              }
              break;
            case "c13": // 請喝咖啡
              if (!targetIsPlayer) {
                np.charisma += 5;
                eventMsg = `你請 ${target.name} 喝星 X 克，關係變好了！`;
              }
              break;
            case "c14": // 滑鼠貼膠帶
              if (!targetIsPlayer) {
                eventMsg = `你偷偷在 ${target.name} 的滑鼠感應器貼了膠帶。嘿嘿！`;
              }
              break;
            case "c15": // 背後突襲
              if (!targetIsPlayer) {
                const rx = Math.floor(Math.random() * OFFICE_LAYOUT.gridSize.x);
                const ry = Math.floor(Math.random() * OFFICE_LAYOUT.gridSize.y);
                target.move(rx, ry);
                eventMsg = `你突然在 ${target.name} 背後大喊，他嚇到整個人彈飛了！`;
              }
              break;
            case "c16": // 代領包裹
              const door = OFFICE_LAYOUT.door;
              next.player.move(door.x, door.y);
              np.charisma += 3;
              eventMsg = "跑去門口幫大家拿包裹，表現得很積極！";
              break;
          }

          if (np.xp >= 100) {
              np.xp = 0; np.level += 1; np.maxMp += 1; np.mp = np.maxMp;
              next.lastEvent = `🎉 升職了！現在是 LV.${np.level}！`;
          } else {
              next.lastEvent = eventMsg;
          }
      }

      // 從手牌移除 (根據唯一 ID)
      const cardIdx = next.handIds.indexOf(uniqueCardId);
      if (cardIdx > -1) next.handIds.splice(cardIdx, 1);

      return next;
    });
  }, []);

  const drawCard = useCallback(() => {
    setManager(prev => {
      const p = prev.player as any;
      // 改為上限 5 張
      if (p.mp <= 0 || prev.handIds.length >= 5) return prev;

      const next = prev.clone();
      
      // 找出目前手牌中已有的卡片種類 (originalId)
      const currentCardTypeIds = next.handIds.map(uId => uId.split('_')[0]);
      
      // 從卡池中過濾掉已有的種類
      const availableTemplates = CARD_POOL.filter(c => !currentCardTypeIds.includes(c.id));
      
      if (availableTemplates.length === 0) {
        next.lastEvent = "⚠️ 靈感枯竭！你已經拿到了所有種類的卡片。";
        return next;
      }

      (next.player as any).mp -= 1;
      next.activityThisDay += 1;
      
      const randomTemplate = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
      // 加入唯一後綴
      next.handIds.push(`${randomTemplate.id}_${Math.random()}`);
      next.lastEvent = `想到了一個壞點子：${randomTemplate.name}！`;
      return next;
    });
  }, []);

  const endDay = useCallback(() => {
    setManager(prev => {
      const p = prev.player as any;
      if (prev.activityThisDay < 3 && p.mp > p.maxMp * 0.3) {
        const next = prev.clone();
        next.lastEvent = `⚠️ 你今天才「做了 ${prev.activityThisDay} 件事」，這樣早退會被抓的！ (至少要 3 件事或 MP 低於 30%)`;
        return next;
      }

      const next = prev.clone();
      next.endDay();
      (next.player as any).mp = (next.player as any).maxMp;
      next.lastEvent = `🌙 第 ${next.day-1} 天結束。又是平安(混)過的一天。`;
      return next;
    });
  }, []);

  const buyItem = useCallback((itemId: string) => {
    setManager(prev => {
      const next = prev.clone();
      const p = next.player as any;
      
      switch (itemId) {
        case 'hp_pot':
          if (p.stats.money >= 200) {
            p.stats.modifyMoney(-200);
            p.stats.modifyEnergy(30);
            next.lastEvent = "💰 喝了能量飲料，體力恢復 30！";
          } else next.lastEvent = "❌ 錢不夠買能量飲料...";
          break;
        case 'mp_pot':
          if (p.stats.money >= 300) {
            p.stats.modifyMoney(-300);
            p.mp = Math.min(p.maxMp, p.mp + 50);
            next.lastEvent = "💰 吃了提神薄荷，摸魚值恢復 50！";
          } else next.lastEvent = "❌ 錢不夠買提神薄荷...";
          break;
        case 'luck_up':
          if (p.stats.money >= 1000) {
            p.stats.modifyMoney(-1000);
            p.luck += 2;
            next.lastEvent = "💰 買了開運御守，幸運提升 2！";
          } else next.lastEvent = "❌ 錢不夠買御守...";
          break;
        case 'charm_up':
          if (p.stats.money >= 1500) {
            p.stats.modifyMoney(-1500);
            p.charisma += 5;
            next.lastEvent = "💰 換了一套高級西裝，魅力提升 5！";
          } else next.lastEvent = "❌ 錢不夠買西裝...";
          break;
      }
      return next;
    });
  }, []);

  const gameState = {
    players: [manager.player, ...manager.colleagues].map(c => {
      const p = c as any;
      const stats = {
        hp: c.stats.energy || 0,
        mp: p.mp !== undefined ? p.mp : 100,
        maxMp: p.maxMp || 100,
        xp: p.xp || 0,
        level: p.level || 1,
        stress: c.stats.stress || 0,
        savings: c.stats.money || 0,
        luck: p.luck || 5,
        charisma: p.charisma || 10
      };
      return {
        id: c.id, 
        name: c.name,
        role: c.id === 'player' ? (stats.level < 3 ? PlayerRole.INTERN : stats.level < 6 ? PlayerRole.JUNIOR : PlayerRole.SENIOR) : "摸魚同事",
        stats,
        gender: c.gender,
        position: { x: c.displayX * 98 + 49, y: c.displayY * 85 + 42.5 }
      };
    }),
    day: manager.day, 
    chaosLevel: manager.chaosLevel, 
    activityThisDay: manager.activityThisDay,
    lastEvent: manager.lastEvent,
    hand: manager.handIds.map(uId => {
      const originalId = uId.split('_')[0];
      const template = CARD_POOL.find(c => c.id === originalId)!;
      return { ...template, id: uId }; // 保持唯一 ID
    }),
    deck: [],
    discardPile: [],
    bossPosition: { x: manager.boss.displayX * 98 + 49, y: manager.boss.displayY * 85 + 42.5 },
    catPosition: { x: manager.cat.displayX, y: manager.cat.displayY }
  };

  return { gameState, playCard, drawCard, endDay, buyItem };
}
