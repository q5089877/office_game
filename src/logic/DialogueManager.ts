import { DIALOGUE_POOL } from "../constants";
import { DailyModifier } from "../types";

export class DialogueManager {
  /**
   * 根據角色狀態與環境事件，隨機生成一段對話
   * 使用 any 接收 npc 以切斷與 GameClasses 的循環引用
   */
  public static getRandomQuote(npc: any, currentEvent: DailyModifier): string {
    // 1. 特殊事件優先判定
    if (currentEvent.id === 'coffee_broken' && Math.random() < 0.4) {
      return DIALOGUE_POOL.EVENT_COFFEE;
    }
    if (currentEvent.id === 'friday' && Math.random() < 0.4) {
      return DIALOGUE_POOL.EVENT_FRIDAY;
    }
    if (currentEvent.id === 'deadline' && Math.random() < 0.4) {
      return DIALOGUE_POOL.EVENT_DEADLINE;
    }

    // 2. 壓力狀態判定 (假設 npc 有 stats.stress)
    if (npc.stats && npc.stats.stress > 60 && Math.random() < 0.5) {
      return this.pickRandom(DIALOGUE_POOL.STRESSED);
    }

    // 3. 通用吐槽
    return this.pickRandom(DIALOGUE_POOL.GENERIC);
  }

  private static pickRandom(list: string[]): string {
    return list[Math.floor(Math.random() * list.length)];
  }

  /**
   * 獲取攻擊對話
   */
  public static getAttackQuote(): string {
    return this.pickRandom(DIALOGUE_POOL.ATTACK);
  }

  /**
   * 根據情境獲取對話
   */
  public static getContextualQuote(npc: any, player: any, gameState: any): string {
    // 情境感知對話選擇
    if (npc.isAttacking) {
      return this.getAttackQuote();
    }

    if (player.stats && player.stats.stress > 70) {
      return this.pickRandom(DIALOGUE_POOL.FAKE_SYMPATHY);
    }

    if (npc.stats && npc.stats.stress > 80) {
      return this.pickRandom(DIALOGUE_POOL.DIRECT_INSULT);
    }

    if (gameState.day < 3) {
      return this.pickRandom(DIALOGUE_POOL.CONDESCENDING_ADVICE);
    }

    // 隨機選擇其他類別
    const categories = [
      DIALOGUE_POOL.PASSIVE_AGGRESSIVE,
      DIALOGUE_POOL.WORK_PRESSURE,
      DIALOGUE_POOL.BACKHANDED_COMPLIMENT,
      DIALOGUE_POOL.GENERIC
    ];
    const selectedPool = categories[Math.floor(Math.random() * categories.length)];
    return this.pickRandom(selectedPool);
  }
}
