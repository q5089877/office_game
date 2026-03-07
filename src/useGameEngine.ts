import { useState, useCallback, useEffect } from 'react';
import { GameManager, Character, Stats } from './logic/GameClasses';
import { PlayerRole, CardType, Gender, EntityType } from './types';
import { CARD_POOL, OFFICE_LAYOUT } from './constants';
import { CARD_EFFECT_HANDLERS } from './logic/CardEffects';

export function useGameEngine() {
  const [lastActionTime, setLastActionTime] = useState(0);
  const ACTION_COOLDOWN = 1500;

  const [manager, setManager] = useState<GameManager>(() => {
    // 找出所有可用的座位
    const allDesks = OFFICE_LAYOUT.clusters.flatMap(c => c.desks);
    const availableDesks = allDesks.filter(d => d.owner === null);

    // 隨機選一個空位作為玩家座位
    const randomIdx = Math.floor(Math.random() * availableDesks.length);
    const playerDesk = availableDesks[randomIdx];

    const player = new Character('player', '新進員工', EntityType.PLAYER, new Stats(100, 0, 1000, 100), playerDesk.x, playerDesk.y, Gender.MALE);
    player.xp = 0;
    player.level = 1;
    player.mp = 100;
    player.maxMp = 100;
    player.luck = 5;
    player.charisma = 10;

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
    if (Date.now() - lastActionTime < ACTION_COOLDOWN) {
      setManager(prev => {
        const next = prev.clone();
        next.lastEvent = "⚠️ 動作太快了，休息一下...";
        return next;
      });
      return;
    }
    setLastActionTime(Date.now());

    setManager(prev => {
      const originalId = uniqueCardId.split('_')[0];
      const cardTemplate = CARD_POOL.find(c => c.id === originalId);
      const p = prev.player;
      const currentEvent = prev.currentEvent;

      if (!cardTemplate) return prev;

      const actualCost = cardTemplate.mpCost + currentEvent.mpCostMod;

      if (p.mp < actualCost) {
        const next = prev.clone();
        next.lastEvent = `⚠️ MP 不足！需要 ${actualCost} MP，但你只有 ${p.mp} MP。`;
        return next;
      }

      const next = prev.clone();
      const np = next.player;
      np.mp -= actualCost;

      const target = next.player.id === targetPlayerId ? next.player : next.colleagues.find(c => c.id === targetPlayerId);
      if (target) {
          target.stats.modifyStress(cardTemplate.stressChange);
          target.stats.modifyEnergy(cardTemplate.hpChange || 0);
          if (cardTemplate.savingsChange) next.player.stats.modifyMoney(cardTemplate.savingsChange);
          next.chaosLevel += cardTemplate.chaosGain || 0;
          np.xp += 15;
          next.activityThisDay += 1;

          // 根據卡片等級增加績效
          const perfMap: Record<string, number> = { 'C': 10, 'B': 15, 'A': 25, 'S': 50 };
          next.performance += perfMap[cardTemplate.rarity] || 10;

          const handler = CARD_EFFECT_HANDLERS[originalId];
          let eventMsg = handler ? handler(next, np, target, originalId) : `使用了 [${cardTemplate.name}]！`;

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
  }, [lastActionTime]);

  const drawCard = useCallback(() => {
    if (Date.now() - lastActionTime < ACTION_COOLDOWN) {
      setManager(prev => {
        const next = prev.clone();
        next.lastEvent = "⚠️ 動作太快了，休息一下...";
        return next;
      });
      return;
    }
    setLastActionTime(Date.now());

    setManager(prev => {
      const p = prev.player;
      const currentEvent = prev.currentEvent;
      const actualDrawCost = 1 + currentEvent.mpCostMod;

      // 改為上限 5 張
      if (p.mp < actualDrawCost || prev.handIds.length >= 5) {
        if (prev.handIds.length >= 5) return prev;
        const next = prev.clone();
        next.lastEvent = `⚠️ MP 不足！抽牌需要 ${actualDrawCost} MP，但你只有 ${p.mp} MP。`;
        return next;
      }

      const next = prev.clone();

      // 找出目前手牌中已有的卡片種類 (originalId)
      const currentCardTypeIds = next.handIds.map(uId => uId.split('_')[0]);

      // 從卡池中過濾掉已有的種類
      const availableTemplates = CARD_POOL.filter(c => !currentCardTypeIds.includes(c.id));

      if (availableTemplates.length === 0) {
        next.lastEvent = "⚠️ 靈感枯竭！你已經拿到了所有種類的卡片。";
        return next;
      }

      next.player.mp -= actualDrawCost;
      next.activityThisDay += 1;

      const randomTemplate = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
      // 加入唯一後綴
      next.handIds.push(`${randomTemplate.id}_${Math.random()}`);
      next.lastEvent = `想到了一個壞點子：${randomTemplate.name}！`;
      return next;
    });
  }, [lastActionTime]);

  const endDay = useCallback(() => {
    let summary: { prevDay: number; moneyEarned: number; stressChange: number; performance: number; wasCaught: boolean; rank: string } | null = null;
    setManager(prev => {
      const p = prev.player;
      if (prev.activityThisDay < 5 || prev.performance < 50) {
        const next = prev.clone();
        next.lastEvent = `⚠️ 下班門檻未達：今日活動 ${prev.activityThisDay}/5，績效 ${prev.performance}/50`;
        return next;
      }

      const next = prev.clone();
      summary = next.endDay();
      next.player.mp = next.player.maxMp;
      next.lastEvent = `🌙 第 ${summary.prevDay} 天結束。又是平安(混)過的一天。`;
      return next;
    });
    return summary;
  }, []);

  const buyItem = useCallback((itemId: string) => {
    setManager(prev => {
      const next = prev.clone();
      const p = next.player;

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
      const stats = {
        hp: c.stats.energy || 0,
        mp: c.mp,
        maxMp: c.maxMp,
        xp: c.xp,
        level: c.level,
        stress: c.stats.stress || 0,
        savings: c.stats.money || 0,
        luck: c.luck,
        charisma: c.charisma
      };
      return {
        id: c.id,
        name: c.name,
        role: c.id === 'player' ? (stats.level < 3 ? PlayerRole.INTERN : stats.level < 6 ? PlayerRole.JUNIOR : PlayerRole.SENIOR) : "摸魚同事",
        stats,
        gender: c.gender,
        gridX: c.gridX,
        gridY: c.gridY,
        chatMessage: c.chatMessage,
        position: { x: c.displayX * 98 + 49, y: c.displayY * 85 + 42.5 + 80 }
      };
    }),
    day: manager.day,
    performance: manager.performance,
    chaosLevel: manager.chaosLevel,
    activityThisDay: manager.activityThisDay,
    lastEvent: manager.lastEvent,
    currentEvent: manager.currentEvent,
    hand: manager.handIds.map(uId => {
      const originalId = uId.split('_')[0];
      const template = CARD_POOL.find(c => c.id === originalId)!;
      return { ...template, id: uId }; // 保持唯一 ID
    }),
    deck: [],
    discardPile: [],
    bossPosition: { x: manager.boss.displayX * 98 + 49, y: manager.boss.displayY * 85 + 42.5 + 80 },
    plantPosition: { x: manager.plant.displayX, y: manager.plant.displayY }
  };

  return { gameState, playCard, drawCard, endDay, buyItem };
}
