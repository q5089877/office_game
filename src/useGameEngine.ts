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
      c.desks
        .filter(d => d.id !== 'player-desk' && d.owner !== null) // 只選擇有owner的桌子（有名字的NPC）
        .map(d => {
          const gender = d.gender || (Math.random() > 0.5 ? Gender.MALE : Gender.FEMALE);
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

  /**
   * 智慧自動選擇最合適的目標NPC
   * 根據卡片類型、NPC狀態和位置進行智慧選擇
   */
  const selectAutoTarget = useCallback((game: GameManager, cardId: string): Character => {
    const cardTemplate = CARD_POOL.find(c => c.id === cardId);
    if (!cardTemplate) return game.player;

    // 1. 自我效果卡片 - 總是選擇玩家自己
    const selfOnlyCards = ['c1', 'c2', 'c4', 'c5', 'c6', 'c7', 'c10', 'c11', 'c16'];
    if (selfOnlyCards.includes(cardId)) {
      return game.player;
    }

    // 2. 群體效果卡片 - 返回玩家作為代表（實際效果會影響全體）
    if (cardId === 'c17') {
      return game.player;
    }

    // 3. 沒有同事時選擇自己
    if (game.colleagues.length === 0) {
      return game.player;
    }

    // 4. 根據卡片類型進行智慧選擇
    switch(cardId) {
      case 'c3': // 傳播八卦 - 完全隨機選擇同事
        return selectRandomColleague(game);

      case 'c12': // 無情甩鍋 - 選擇壓力最低的同事（比較不會反抗）
        return selectLeastStressedColleague(game);

      case 'c13': // 請喝咖啡 - 完全隨機選擇同事
        return selectRandomColleague(game);

      case 'c14': // 滑鼠貼膠帶 - 選擇距離最近且正在工作的同事（保持原有邏輯）
        return selectNearestWorkingColleague(game);

      case 'c15': // 背後突襲 - 選擇隨機但不在植物旁的同事
        return selectRandomColleagueAwayFromPlant(game);

      default:
        // 默認：完全隨機選擇同事（與所有NPC亂數互動）
        return selectRandomColleague(game);
    }
  }, []);

  /**
   * 選擇壓力最高的同事
   */
  const selectMostStressedColleague = useCallback((game: GameManager, considerDistance: boolean = false, randomSelection: boolean = false): Character => {
    let candidates = game.colleagues;

    if (considerDistance) {
      // 排除距離太遠的同事（超過3格）
      const playerGridX = game.player.gridX;
      const playerGridY = game.player.gridY;
      candidates = candidates.filter(colleague =>
        Math.abs(colleague.gridX - playerGridX) <= 3 &&
        Math.abs(colleague.gridY - playerGridY) <= 3
      );

      if (candidates.length === 0) {
        candidates = game.colleagues; // 如果沒有附近同事，使用全部
      }
    }

    // 如果沒有候選人，返回玩家
    if (candidates.length === 0) {
      return game.player;
    }

    // 如果啟用隨機選擇，從壓力最高的前3名中隨機選擇
    if (randomSelection && candidates.length > 1) {
      // 按壓力值排序（從高到低）
      const sorted = [...candidates].sort((a, b) => b.stats.stress - a.stats.stress);
      // 取壓力最高的前3名（或更少如果候選人不足）
      const topCount = Math.min(3, sorted.length);
      const topCandidates = sorted.slice(0, topCount);
      // 隨機選擇一個
      return topCandidates[Math.floor(Math.random() * topCandidates.length)];
    }

    // 默認：選擇壓力最高的同事
    return candidates.reduce((max, colleague) =>
      colleague.stats.stress > max.stats.stress ? colleague : max
    );
  }, []);

  /**
   * 選擇壓力最低的同事
   */
  const selectLeastStressedColleague = useCallback((game: GameManager): Character => {
    return game.colleagues.reduce((min, colleague) =>
      colleague.stats.stress < min.stats.stress ? colleague : min
    );
  }, []);

  /**
   * 選擇距離最近的同事
   */
  const selectNearestColleague = useCallback((game: GameManager): Character => {
    const playerGridX = game.player.gridX;
    const playerGridY = game.player.gridY;

    return game.colleagues.reduce((closest, colleague) => {
      const distCurrent = Math.abs(colleague.gridX - playerGridX) + Math.abs(colleague.gridY - playerGridY);
      const distClosest = Math.abs(closest.gridX - playerGridX) + Math.abs(closest.gridY - playerGridY);
      return distCurrent < distClosest ? colleague : closest;
    });
  }, []);

  /**
   * 選擇距離最近且正在工作的同事（不在植物旁）
   */
  const selectNearestWorkingColleague = useCallback((game: GameManager): Character => {
    const playerGridX = game.player.gridX;
    const playerGridY = game.player.gridY;

    // 排除正在植物旁的同事（可能在休息）
    const workingColleagues = game.colleagues.filter(colleague =>
      !(colleague.gridX === game.plant.gridX && colleague.gridY === game.plant.gridY)
    );

    if (workingColleagues.length === 0) {
      return selectNearestColleague(game); // 如果沒有，返回最近的
    }

    return workingColleagues.reduce((closest, colleague) => {
      const distCurrent = Math.abs(colleague.gridX - playerGridX) + Math.abs(colleague.gridY - playerGridY);
      const distClosest = Math.abs(closest.gridX - playerGridX) + Math.abs(closest.gridY - playerGridY);
      return distCurrent < distClosest ? colleague : closest;
    });
  }, []);

  /**
   * 選擇隨機但不在植物旁的同事
   */
  const selectRandomColleagueAwayFromPlant = useCallback((game: GameManager): Character => {
    // 排除正在植物旁的同事
    const awayFromPlant = game.colleagues.filter(colleague =>
      !(colleague.gridX === game.plant.gridX && colleague.gridY === game.plant.gridY)
    );

    if (awayFromPlant.length === 0) {
      // 如果所有同事都在植物旁，隨機選擇一個
      const randomIndex = Math.floor(Math.random() * game.colleagues.length);
      return game.colleagues[randomIndex];
    }

    const randomIndex = Math.floor(Math.random() * awayFromPlant.length);
    return awayFromPlant[randomIndex];
  }, []);

  /**
   * 隨機選擇一個同事（完全隨機，與所有NPC互動）
   */
  const selectRandomColleague = useCallback((game: GameManager): Character => {
    if (game.colleagues.length === 0) {
      return game.player; // 如果沒有同事，返回玩家自己
    }

    const randomIndex = Math.floor(Math.random() * game.colleagues.length);
    return game.colleagues[randomIndex];
  }, []);

  const playCard = useCallback((uniqueCardId: string) => {
    if (Date.now() - lastActionTime < ACTION_COOLDOWN) return;
    setLastActionTime(Date.now());

    setManager(prev => {
      const originalId = uniqueCardId.split('_')[0];
      const cardTemplate = CARD_POOL.find(c => c.id === originalId);
      if (!cardTemplate) return prev;

      // 自動選擇目標
      const autoSelectedTarget = selectAutoTarget(prev, originalId);
      const finalTargetId = autoSelectedTarget.id;

      const actualCost = cardTemplate.mpCost + prev.currentEvent.mpCostMod;
      if (prev.player.mp < actualCost) {
        const next = prev.clone();
        next.lastEvent = `⚠️ MP 不足！需要 ${actualCost} MP。`;
        return next;
      }

      const next = prev.clone();
      const np = next.player;
      np.mp -= actualCost;

      const targetCharacter = next.player.id === finalTargetId ? next.player : next.colleagues.find(c => c.id === finalTargetId);
      if (targetCharacter) {
          targetCharacter.stats.modifyStress(cardTemplate.stressChange);
          targetCharacter.stats.modifyEnergy(cardTemplate.hpChange || 0);
          if (cardTemplate.savingsChange) next.player.stats.modifyMoney(cardTemplate.savingsChange);
          next.chaosLevel += cardTemplate.chaosGain || 0;
          np.xp += 15;
          next.activityThisDay += 1;

          const perfMap: Record<string, number> = { 'C': 10, 'B': 15, 'A': 25, 'S': 50 };
          next.performance += perfMap[cardTemplate.rarity] || 10;

          const handler = CARD_EFFECT_HANDLERS[originalId];
          let eventMsg = handler ? handler(next, np, targetCharacter, originalId) : `使用了 [${cardTemplate.name}]！`;

          // 處理升級邏輯
          let levelUpMsg = '';
          if (np.xp >= 100) {
              np.xp = 0; np.level += 1; np.maxMp += 1; np.mp = np.maxMp;
              levelUpMsg = `🎉 升職了！現在是 LV.${np.level}！`;
          }

          // 合併訊息：卡片效果 + 升級訊息（如果有）
          if (levelUpMsg) {
              next.lastEvent = `${eventMsg} ${levelUpMsg}`;
          } else {
              next.lastEvent = eventMsg;
          }
      } else {
          // 如果找不到目標（理論上不會發生，因為自動選擇總是會返回一個目標）
          next.player.mp += actualCost;
          next.lastEvent = "⚠️ 自動選擇目標失敗！";
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
    bossChatMessage: manager.boss.chatMessage,
    plantPosition: { x: manager.plant.gridX, y: manager.plant.gridY }
  };

  return { gameState, player, playCard, drawCard, clockOut, buyItem };
};
