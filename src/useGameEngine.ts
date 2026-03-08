/**
 * useGameEngine Hook
 * 簡化版：精力與壓力系統
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { GameManager, Character, Stats } from './logic/GameClasses';
import { OFFICE_LAYOUT, CARD_POOL, SHOP_ITEMS } from './constants';
import { CARD_EFFECT_HANDLERS } from './logic/CardEffects';
import { PlayerRole, CardType, EntityType, Gender, ItemType } from './types';

const ACTION_COOLDOWN = 500;

export const useGameEngine = () => {
  const [manager, setManager] = useState(() => {
    const player = new Character('player', '新進員工', EntityType.PLAYER, undefined, 1, 1, Gender.MALE);
    const colleagues = OFFICE_LAYOUT.clusters.flatMap(c =>
      c.desks
        .filter(d => d.id !== 'player-desk' && d.owner !== null)
        .map(d => new Character(d.id, d.label, EntityType.COLLEAGUE, undefined, d.x, d.y, d.gender))
    );
    return new GameManager(player, colleagues);
  });

  const [lastActionTime, setLastActionTime] = useState(0);
  const requestRef = useRef<number | undefined>(undefined);

  const animate = useCallback((time: number) => {
    setManager(prev => {
      const next = prev.clone();
      next.tick();
      
      // 靜音鍵盤效果：主動提示
      if (next.player.ownedItemIds.includes('silent_keyboard') && Math.random() < 0.001) {
        next.player.stats.modifyStress(-1);
        next.addNotification("⌨️ 靜音鍵盤：壓力微幅下降...");
      }

      return next;
    });
    requestRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [animate]);

  const selectAutoTarget = useCallback((game: GameManager, cardId: string): Character => {
    const cardTemplate = CARD_POOL.find(c => c.id === cardId);
    if (!cardTemplate) return game.player;
    const selfOnlyCards = ['c1', 'c2', 'c4', 'c5', 'c6', 'c7', 'c10', 'c11', 'c16'];
    if (selfOnlyCards.includes(cardId) || cardId === 'c17' || game.colleagues.length === 0) return game.player;
    return game.colleagues[Math.floor(Math.random() * game.colleagues.length)];
  }, []);

  const playCard = useCallback((uniqueCardId: string) => {
    if (Date.now() - lastActionTime < ACTION_COOLDOWN) return;
    setLastActionTime(Date.now());

    setManager(prev => {
      const originalId = uniqueCardId.split('_')[0];
      const cardTemplate = CARD_POOL.find(c => c.id === originalId);
      if (!cardTemplate) return prev;

      const hasEnergyDiscount = prev.player.ownedItemIds.includes('hidden_earbuds');
      const actualCost = Math.max(0, cardTemplate.mpCost + prev.currentEvent.energyCostMod - (hasEnergyDiscount ? 1 : 0));
      
      if (prev.player.stats.energy < actualCost) {
        const next = prev.clone();
        next.addNotification("❌ 精力不足！無法執行。");
        return next;
      }

      const next = prev.clone();
      const p = next.player;
      p.stats.modifyEnergy(-actualCost);

      const targetCharacter = next.player.id === selectAutoTarget(prev, originalId).id ? next.player : next.colleagues.find(c => c.id === selectAutoTarget(prev, originalId).id);
      
      if (targetCharacter) {
          // 將原本的 mpCost 邏輯轉為 energy
          targetCharacter.stats.modifyStress(cardTemplate.stressChange);
          if (cardTemplate.savingsChange) next.player.stats.modifyMoney(cardTemplate.savingsChange);
          
          let chaosGain = cardTemplate.chaosGain || 0;
          if (next.player.ownedItemIds.includes('privacy_filter')) chaosGain = Math.floor(chaosGain * 0.8);
          next.chaosLevel += chaosGain;

          p.xp += 15;
          next.activityThisDay += 1;
          const perfMap: Record<string, number> = { 'C': 10, 'B': 15, 'A': 25, 'S': 50 };
          next.performance += perfMap[cardTemplate.rarity] || 10;

          const handler = CARD_EFFECT_HANDLERS[originalId];
          const eventMsg = handler ? handler(next, p, targetCharacter, originalId) : `使用了 [${cardTemplate.name}]！`;
          next.lastEvent = eventMsg;
          next.addNotification(`🎴 出牌：${cardTemplate.name} (精力 -${actualCost})`);

          if (p.xp >= 100) {
              p.xp = 0; p.level += 1; p.stats.maxEnergy += 10; p.stats.energy = p.stats.maxEnergy;
              next.addNotification(`🎉 升職！現在是 LV.${p.level}！`);
          }
      }

      const cardIdx = next.handIds.indexOf(uniqueCardId);
      if (cardIdx > -1) next.handIds.splice(cardIdx, 1);
      return next;
    });
  }, [lastActionTime, selectAutoTarget]);

  const drawCard = useCallback(() => {
    if (Date.now() - lastActionTime < ACTION_COOLDOWN) return;
    setLastActionTime(Date.now());

    setManager(prev => {
      const actualDrawCost = 1 + prev.currentEvent.energyCostMod;
      if (prev.player.stats.energy < actualDrawCost || prev.handIds.length >= 5) {
        const next = prev.clone();
        if (prev.handIds.length >= 5) next.addNotification("⚠️ 手牌已滿！");
        else next.addNotification("❌ 精力不足，無法抽牌。");
        return next;
      }

      const next = prev.clone();
      const availableTemplates = CARD_POOL.filter(c => !next.handIds.map(uId => uId.split('_')[0]).includes(c.id));
      if (availableTemplates.length === 0) return next;

      const template = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
      next.handIds.push(`${template.id}_${Date.now()}`);
      next.player.stats.modifyEnergy(-actualDrawCost);
      next.addNotification(`🎴 抽到了 [${template.name}]`);
      return next;
    });
  }, [lastActionTime]);

  const clockOut = useCallback(() => {
    setManager(prev => {
      if (prev.activityThisDay < 3) {
        prev.addNotification("❌ 工作進度不足，不能下班！");
        return prev;
      }
      const next = prev.clone();
      next.endDay();
      return next;
    });
  }, []);

  const buyItem = useCallback((itemId: string) => {
    setManager(prev => {
      const item = SHOP_ITEMS.find(i => i.id === itemId);
      if (!item || prev.player.stats.money < item.price) {
        const next = prev.clone();
        next.addNotification("❌ 餘額不足！");
        return next;
      }
      if (prev.player.ownedItemIds.includes(itemId)) return prev;

      const next = prev.clone();
      next.player.stats.modifyMoney(-item.price);
      next.player.ownedItemIds.push(itemId);
      next.addNotification(`💰 購買成功：${item.name}`);
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
        energy: c.stats.energy,
        maxEnergy: c.stats.maxEnergy,
        stress: c.stats.stress,
        savings: c.stats.money,
        xp: c.xp,
        level: c.level
      },
      gender: c.gender, gridX: c.gridX, gridY: c.gridY, chatMessage: c.chatMessage,
      position: { x: c.displayX * 98 + 49, y: c.displayY * 85 + 42.5 + 80 }
    })),
    day: manager.day,
    performance: manager.performance,
    chaosLevel: manager.chaosLevel,
    activityThisDay: manager.activityThisDay,
    lastEvent: manager.lastEvent,
    notifications: manager.notifications,
    currentEvent: manager.currentEvent,
    hand: manager.handIds.map(uId => {
      const tid = uId.split('_')[0];
      const t = CARD_POOL.find(c => c.id === tid)!;
      return { ...t, id: uId };
    }),
    bossPosition: { x: manager.boss.displayX * 98 + 49, y: manager.boss.displayY * 85 + 42.5 + 80 },
    bossChatMessage: manager.boss.chatMessage,
    plantPosition: { x: manager.plant.gridX, y: manager.plant.gridY }
  };

  return { gameState, player, playCard, drawCard, clockOut, buyItem };
};
