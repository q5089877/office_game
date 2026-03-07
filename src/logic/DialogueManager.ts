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
}
