/**
 * useGameEngine Hook
 * 簡化版：精力與壓力系統
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { GameManager, Character, Stats } from './logic/GameClasses';
import { OFFICE_LAYOUT, CARD_POOL, SHOP_ITEMS } from './constants';
import { CARD_EFFECT_HANDLERS } from './logic/CardEffects';
import { PlayerRole, CardType, EntityType, Gender, ItemType } from './types';
import { PositionService, OfficeEntity } from './utils/PositionService';

const ACTION_COOLDOWN = 500;

export const useGameEngine = () => {
  const [manager, setManager] = useState(() => {
    // 獲取隨機空位子
    const getRandomEmptyDesk = () => {
      const emptyDesks = OFFICE_LAYOUT.clusters.flatMap(c =>
        c.desks.filter(d => d.label === "" && d.owner === null)
      );
      if (emptyDesks.length === 0) {
        return { x: 1, y: 1 }; // 備用位置
      }
      const randomDesk = emptyDesks[Math.floor(Math.random() * emptyDesks.length)];
      return { x: randomDesk.x, y: randomDesk.y };
    };

    const randomDesk = getRandomEmptyDesk();
    const player = new Character('player', '菜鳥', EntityType.PLAYER, undefined, randomDesk.x, randomDesk.y, Gender.MALE);
    const colleagues = OFFICE_LAYOUT.clusters.flatMap(c =>
      c.desks
        .filter(d => d.id !== 'player-desk' && d.owner !== null)
        .map(d => new Character(d.id, d.label, EntityType.COLLEAGUE, undefined, d.x, d.y, d.gender))
    );
    return new GameManager(player, colleagues);
  });

  const [lastActionTime, setLastActionTime] = useState(0);
  const [coffeeInflation, setCoffeeInflation] = useState(0); // 每買一杯咖啡增加的額外負擔
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
    const selfOnlyCards = ['c1', 'c2', 'c4', 'c5', 'c6', 'c7', 'c10', 'c11', 'c16', 'c18'];
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
      const actualCost = Math.max(0, cardTemplate.energyCost + prev.currentEvent.energyCostMod - (hasEnergyDiscount ? 1 : 0));

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
          if (next.player.ownedItemIds.includes('privacy_filter')) {
            chaosGain = Math.floor(chaosGain * 0.7); // 從 0.8 改為 0.7
          }
          next.chaosLevel += chaosGain;

          // 靜音紅軸鍵盤出牌效果：15% 機率回 1 精力
          if (next.player.ownedItemIds.includes('silent_keyboard') && Math.random() < 0.15) {
            p.stats.modifyEnergy(1);
            next.addNotification("⌨️ 靜音紅軸：完美敲擊，精力 +1");
          }

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
    const requiredDays = 3 + Math.floor((manager.day - 1) / 2);
    const limitDays = Math.min(8, requiredDays);

    if (manager.activityThisDay < limitDays) {
      setManager(prev => {
        const next = prev.clone();
        next.addNotification(`❌ 工作進度不足，下班需完成 ${limitDays} 件事！`);
        return next;
      });
      return undefined;
    }
    const nextManager = manager.clone();
    const summary = nextManager.endDay();
    setManager(nextManager);
    return summary;
  }, [manager]);

  const buyItem = useCallback((itemId: string) => {
    setManager(prev => {
      const item = SHOP_ITEMS.find(i => i.id === itemId);
      if (!item) return prev;

      let currentPrice = item.price;
      if (itemId === 'specialty_coffee') {
        currentPrice += coffeeInflation;
      }

      if (prev.player.stats.money < currentPrice) {
        const next = prev.clone();
        next.addNotification(`❌ 餘額不足！(需要 $${currentPrice})`);
        return next;
      }
      
      // 非消耗品且已擁有則不動作
      if (item.type !== ItemType.CONSUMABLE && prev.player.ownedItemIds.includes(itemId)) {
        return prev;
      }

      const next = prev.clone();
      next.player.stats.modifyMoney(-currentPrice);

      if (item.type === ItemType.CONSUMABLE) {
          // 這裡目前只有咖啡
          if (itemId === 'specialty_coffee') {
            next.player.stats.modifyEnergy(30);
            next.player.stats.modifyStress(-40);
            setCoffeeInflation(c => c + 300); // 每次購買漲 300
            next.addNotification(`☕ 喝下特調咖啡！壓力大減，且咖啡變得更貴了...`);
          }
      } else {
        next.player.ownedItemIds.push(itemId);
        next.addNotification(`💎 已裝備神器！[${item.name}] 效果已啟動！`);
      }
      
      return next;
    });
  }, [coffeeInflation]);

  const player = manager.player;
  const gameState = {
    players: [manager.player, ...manager.colleagues].map(c => ({
      id: c.id,
      name: c.name,
      role: c.id === 'player' ? '菜鳥' : '同事',
      stats: {
        energy: c.stats.energy,
        maxEnergy: c.stats.maxEnergy,
        stress: c.stats.stress,
        savings: c.stats.money,
        xp: c.xp,
        level: c.level,
        luck: c.luck
      },
      gender: c.gender, gridX: c.gridX, gridY: c.gridY, chatMessage: c.chatMessage,
      position: PositionService.getNPCDisplayPosition(c.displayX, c.displayY),
      ownedItemIds: c.ownedItemIds
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
    bossPosition: PositionService.getNPCDisplayPosition(manager.boss.displayX, manager.boss.displayY),
    bossChatMessage: manager.boss.chatMessage,
    coffeePrice: (SHOP_ITEMS.find(i => i.id === 'specialty_coffee')?.price || 1500) + coffeeInflation,
    plantPosition: PositionService.gridToPixel(manager.plant.gridX, manager.plant.gridY, OfficeEntity.PLANT)
  };

  return { gameState, player, playCard, drawCard, clockOut, buyItem };
};
