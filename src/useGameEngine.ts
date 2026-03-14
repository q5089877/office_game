/**
 * useGameEngine Hook
 * 簡化版：精力與壓力系統
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { GameManager, Character, Stats } from './logic/GameClasses';
import { OFFICE_LAYOUT, EVENT_POOL, SHOP_ITEMS } from './constants';
import { CARD_EFFECT_HANDLERS } from './logic/CardEffects';
import { PlayerRole, ActionCategory, EntityType, Gender, ItemType } from './types';
import { PositionService, OfficeEntity } from './utils/PositionService';
import { DialogueManager } from './logic/DialogueManager';

const ACTION_COOLDOWN = 800; // 延長冷卻至 800ms

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
    const fullPool = OFFICE_LAYOUT.clusters.flatMap(c =>
      c.desks
        .filter(d => d.id !== 'player-desk' && d.owner !== null)
        .map(d => new Character(d.id, d.label, EntityType.COLLEAGUE, undefined, d.x, d.y, d.gender))
    );
    
    const manager = new GameManager(player, [], undefined, undefined, 1, 0, fullPool);
    manager.refreshAttendance(); // 第一天也要顯示所有缺席者
    
    return manager;
  });

  const lastActionTimeRef = useRef(0);
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

  const executeAction = useCallback((category: ActionCategory) => {
    const now = Date.now();
    if (now - lastActionTimeRef.current < ACTION_COOLDOWN) return;
    lastActionTimeRef.current = now;

    setManager(prev => {
      const next = prev.clone();
      const p = next.player;
      
      // 特殊處理：場景物件互動 (INTERACT)
      if (category === ActionCategory.INTERACT) {
        // 尋找相鄰或同一格的物件
        const nearbyObject = OFFICE_LAYOUT.objects.find(obj => 
          Math.abs(obj.x - p.gridX) <= 1 && Math.abs(obj.y - p.gridY) <= 1
        );

        if (!nearbyObject) {
           next.addNotification("❌ 周圍沒有可以互動的物件。");
           return next;
        }

        switch (nearbyObject.id) {
          case 'coffee':
            p.stats.modifyEnergy(30);
            next.chaosLevel += 15; // 增加被老闆注意的風險
            next.addNotification("☕【泡夢幻咖啡】穩定回復 30 精力！但咖啡香引人注目 (混亂+15)");
            break;
          case 'printer':
            next.chaosLevel += 30;
            if (Math.random() > 0.5) {
               next.colleagues.filter(c => Math.abs(c.gridX - p.gridX) <= 2).forEach(c => {
                  c.stats.modifyStress(25);
                  c.chatMessage = "又卡紙！？";
                  c.chatTimer = 3000;
               });
               next.addNotification("🔥【印表機卡紙】引發巨大混亂！周邊同事壓力飆升！");
            } else {
               next.addNotification("🖨️【偷印履歷】完美犯罪，混亂度暴增但無人發現。");
            }
            break;
          case 'toilet':
            p.stats.modifyStress(-25);
            next.addNotification("🧻【精神時光屋】薪水傳送門為你擋下一切煩惱。壓力 -25");
            break;
          case 'vending':
            if (p.stats.money >= 50) {
               p.stats.modifyMoney(-50);
               next.colleagues.filter(c => Math.abs(c.gridX - p.gridX) <= 1).forEach(c => {
                  c.stats.modifyStress(-30);
                  c.chatMessage = "謝謝乾爹！";
                  c.chatTimer = 3000;
               });
               next.addNotification("🥤【請喝水】花費 $50 收買人心，周圍同事壓力大減！");
            } else {
               next.addNotification("❌ 金錢不足，連水都買不起。");
            }
            break;
          case 'plant':
            if (p.stats.energy >= 15) {
               p.stats.modifyEnergy(-15);
               next.addNotification("🪴【澆水】花費 15 精力，植物非常開心！");
            } else {
               next.addNotification("❌ 精力不足以照顧植物。");
            }
            break;
        }
        
        next.activityThisDay += 1;
        return next;
      }

      // 常規隨機事件 (SLACK / PRANK / EVADE)
      const possibleEvents = EVENT_POOL.filter(e => e.category === category);
      if (possibleEvents.length === 0) return next;
      
      const eventTemplate = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
      
      const hasEnergyDiscount = p.ownedItemIds.includes('hidden_earbuds');
      const actualCost = Math.max(0, eventTemplate.energyCost + prev.currentEvent.energyCostMod - (hasEnergyDiscount ? 1 : 0));

      if (p.stats.energy < actualCost) {
        next.addNotification("❌ 精力不足！無法執行此行動。");
        return next;
      }

      p.stats.modifyEnergy(-actualCost);

      const targetCharacter = p; // 簡化機制：目前事件描述中已統一由 handler 內部處理目標
      
      // 套用基礎數值
      if (eventTemplate.stressChange) p.stats.modifyStress(eventTemplate.stressChange);
      if (eventTemplate.savingsChange) p.stats.modifyMoney(eventTemplate.savingsChange);

      let chaosGain = eventTemplate.chaosGain || 0;
      if (p.ownedItemIds.includes('privacy_filter')) {
        chaosGain = Math.floor(chaosGain * 0.7);
      }
      next.chaosLevel += chaosGain;

      // 靜音紅軸鍵盤出牌效果：15% 機率自動微幅降壓
      if (p.ownedItemIds.includes('silent_keyboard') && Math.random() < 0.15) {
         p.stats.modifyStress(-2);
         next.addNotification("✨ ⌨️ 靜音紅軸：完美敲擊，壓力 -2");
      }

      p.xp += (eventTemplate.xpGain || 10);
      next.activityThisDay += 1;
      next.performance += 15;

      const handler = CARD_EFFECT_HANDLERS[eventTemplate.id];
      const eventMsg = handler ? handler(next, p, targetCharacter, eventTemplate.id) : `執行了 [${eventTemplate.name}]！`;
      
      next.addNotification(`💬 ${eventMsg} (${category} | 精力 -${actualCost})`);

      if (p.xp >= 100) {
          p.xp = 0; p.level += 1; p.stats.maxEnergy += 10; p.stats.energy = p.stats.maxEnergy;
          next.addNotification(`🎉 升職！現在是 LV.${p.level}！`);
          // 真正的重大事件才推給 lastEvent
          next.lastEvent = "🎉 升級啦！精力上限提升！";
      }

      return next;
    });
  }, []); // 移除 lastActionTime 依賴，改用 ref 內部獲取

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
    bossPosition: PositionService.getNPCDisplayPosition(manager.boss.displayX, manager.boss.displayY),
    bossChatMessage: manager.boss.chatMessage,
    coffeePrice: (SHOP_ITEMS.find(i => i.id === 'specialty_coffee')?.price || 1500) + coffeeInflation,
    plantPosition: PositionService.gridToPixel(manager.plant.gridX, manager.plant.gridY, OfficeEntity.PLANT)
  };

  // NPC 互動：點擊 NPC 時觸發對話
  const interactWithNPC = useCallback((npcId: string) => {
    setManager(prev => {
      const next = prev.clone();
      
      // 不處理玩家自己
      if (npcId === 'player') return next;

      // 找同事
      let targetNPC = next.colleagues.find(c => c.id === npcId);
      
      // 若找不到，可能是點了老闆
      if (!targetNPC && npcId === 'boss') {
          targetNPC = next.boss as any; // 簡單轉型或處理
          
          if (next.boss) {
             next.boss.chatMessage = "專心工作！別盯著我看！";
             next.boss.chatTimer = 3000;
             // 老闆被點擊會增加一點壓力
             next.player.stats.modifyStress(5);
             next.addNotification("⚠️ 【警告】你一直盯著老闆看，引起了不滿... 壓力 +5");
             return next;
          }
      }

      if (targetNPC) {
        // 使用 DialogueManager 取得一句話
        targetNPC.chatMessage = DialogueManager.getContextualQuote(targetNPC, next.player, next);
        targetNPC.chatTimer = 3000;
        
        // 稍微打斷他們的行動
        targetNPC.idleTimer = 3000;
        if (targetNPC.behaviorState === 'WORKING') {
           next.addNotification(`💬 拍了拍 ${targetNPC.name} 的肩膀，打斷了他們的工作。`);
        }
      }
      return next;
    });
  }, []);

  return {
    gameState: gameState,
    executeAction,
    buyItem,
    clockOut,
    interactWithNPC
  };
};
