/**
 * useGameEngine Hook
 * 負責封裝遊戲邏輯與狀態管理
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { GameManager, Character, Stats } from './logic/GameClasses';
import { OFFICE_LAYOUT, CARD_POOL } from './constants';
import { CARD_EFFECT_HANDLERS } from './logic/CardEffects';
import { PlayerRole, CardType, EntityType, Gender } from './types';

const ACTION_COOLDOWN = 500;

export const useGameEngine = () => {
  const [manager, setManager] = useState(() => {
    // 修正構造函數：id, name, type, stats, x, y, gender
    const player = new Character('player', '新進員工', EntityType.PLAYER, undefined, 1, 1, Gender.MALE);
    
    const colleagues = OFFICE_LAYOUT.clusters.flatMap(c => 
      c.desks.filter(d => d.id !== 'player-desk').map(d => {
        const gender = Math.random() > 0.5 ? Gender.MALE : Gender.FEMALE;
        const char = new Character(d.id, d.label, EntityType.COLLEAGUE, undefined, d.x, d.y, gender);
        return char;
      })
    );

    const m = new GameManager(player, colleagues);
    m.handIds = []; // 初始化手牌
    return m;
  });

  const [lastActionTime, setLastActionTime] = useState(0);
  const requestRef = useRef<number | undefined>(undefined);

  // 遊戲循環
  const animate = useCallback((time: number) => {
    setManager(prev => {
      const next = prev.clone();
      next.tick();
      return next;
    });
    requestRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [animate]);

  const playCard = useCallback((uniqueCardId: string, targetPlayerId: string) => {
    if (Date.now() - lastActionTime < ACTION_COOLDOWN) return;
    setLastActionTime(Date.now());

    setManager(prev => {
      const originalId = uniqueCardId.split('_')[0];
      const cardTemplate = CARD_POOL.find(c => c.id === originalId);
      if (!cardTemplate) return prev;

      const isSelfOnly = originalId.startsWith('c1');
      const finalTargetId = isSelfOnly ? prev.player.id : targetPlayerId;

      const actualCost = cardTemplate.mpCost + prev.currentEvent.mpCostMod;
      if (prev.player.mp < actualCost) {
        const next = prev.clone();
        next.lastEvent = `⚠️ MP 不足！需要 ${actualCost} MP。`;
        return next;
      }

      const next = prev.clone();
      const np = next.player;
      np.mp -= actualCost;

      const target = next.player.id === finalTargetId ? next.player : next.colleagues.find(c => c.id === finalTargetId);
      if (target) {
          target.stats.modifyStress(cardTemplate.stressChange);
          target.stats.modifyEnergy(cardTemplate.hpChange || 0);
          if (cardTemplate.savingsChange) next.player.stats.modifyMoney(cardTemplate.savingsChange);
          next.chaosLevel += cardTemplate.chaosGain || 0;
          np.xp += 15;
          next.activityThisDay += 1;

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
      } else if (!isSelfOnly) {
          next.player.mp += actualCost; 
          next.lastEvent = "⚠️ 請先鎖定目標！";
          return next;
      }

      const cardIdx = next.handIds.indexOf(uniqueCardId);
      if (cardIdx > -1) next.handIds.splice(cardIdx, 1);
      return next;
    });
  }, [lastActionTime]);

  const drawCard = useCallback(() => {
    if (Date.now() - lastActionTime < ACTION_COOLDOWN) return;
    setLastActionTime(Date.now());

    setManager(prev => {
      const p = prev.player;
      const actualDrawCost = 1 + prev.currentEvent.mpCostMod;
      if (p.mp < actualDrawCost || prev.handIds.length >= 5) return prev;

      const next = prev.clone();
      const currentCardTypeIds = next.handIds.map(uId => uId.split('_')[0]);
      const availableTemplates = CARD_POOL.filter(c => !currentCardTypeIds.includes(c.id));
      if (availableTemplates.length === 0) return next;

      const template = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
      const uniqueId = `${template.id}_${Date.now()}`;
      next.handIds.push(uniqueId);
      next.player.mp -= actualDrawCost;
      next.lastEvent = `🎴 抽到了 [${template.name}]！`;
      return next;
    });
  }, [lastActionTime]);

  const clockOut = useCallback(() => {
    let summary = null;
    setManager(prev => {
      if (prev.activityThisDay < 3) return prev;
      const next = prev.clone();
      summary = next.endDay(); // 調用 GameManager 的結算邏輯
      next.player.mp = next.player.maxMp;
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
            p.stats.modifyMoney(-200); p.stats.modifyEnergy(30);
            next.lastEvent = "💰 恢復 30 HP！";
          } break;
        case 'mp_pot':
          if (p.stats.money >= 300) {
            p.stats.modifyMoney(-300); p.mp = Math.min(p.maxMp, p.mp + 50);
            next.lastEvent = "💰 恢復 50 MP！";
          } break;
        case 'luck_up':
          if (p.stats.money >= 500) {
            p.stats.modifyMoney(-500); p.luck += 2;
            next.lastEvent = "💰 幸運 +2！";
          } break;
      }
      return next;
    });
  }, []);

  const player = manager.player;
  const gameState = {
    players: [manager.player, ...manager.colleagues].map(c => ({
      id: c.id,
      name: c.name,
      role: c.id === 'player' ? '新進員工' : '同事',
      stats: {
        hp: c.stats.energy, mp: c.mp, maxMp: c.maxMp, xp: c.xp, level: c.level,
        stress: c.stats.stress, savings: c.stats.money, luck: c.luck, charisma: c.charisma
      },
      gender: c.gender, gridX: c.gridX, gridY: c.gridY, chatMessage: c.chatMessage,
      position: { x: c.displayX * 98 + 49, y: c.displayY * 85 + 42.5 + 80 }
    })),
    day: manager.day,
    performance: manager.performance,
    chaosLevel: manager.chaosLevel,
    activityThisDay: manager.activityThisDay,
    lastEvent: manager.lastEvent,
    currentEvent: manager.currentEvent,
    hand: manager.handIds.map(uId => {
      const tid = uId.split('_')[0];
      const t = CARD_POOL.find(c => c.id === tid)!;
      return { ...t, id: uId };
    }),
    deck: [],
    discardPile: [],
    bossPosition: { x: manager.boss.displayX * 98 + 49, y: manager.boss.displayY * 85 + 42.5 + 80 },
    plantPosition: { x: manager.plant.gridX, y: manager.plant.gridY }
  };

  return { gameState, player, playCard, drawCard, clockOut, buyItem };
};
