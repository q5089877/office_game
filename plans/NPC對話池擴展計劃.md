# NPC 對話池擴展計劃

## 概述
為辦公室生存遊戲創建一個全面且多樣化的對話池，包含至少 30 個不同的對話行，分類為不同的遊戲功能和情感語氣。

## 對話池設計原則

1. **情境相關性**：符合辦公室環境和遊戲設定
2. **玩家名稱整合**：適當引用「菜鳥」玩家名稱
3. **多樣性**：不同長度、強度和語氣
4. **功能性**：服務不同的遊戲功能（攻擊、壓力、互動等）
5. **動態性**：創造不可預測的 NPC 行為

## 擴展對話池（共 40 個對話行）

### 1. 主動攻擊對話（8 個）
用於 NPC 主動攻擊玩家時：
1. "菜鳥，這份報告你來做！明天早上我要看到結果。"
2. "新人就是要多學點，這個急件交給你處理。"
3. "我這邊忙不過來，你幫我整理這些資料。"
4. "老闆說要訓練新人，這個專案給你負責。"
5. "你的能力應該可以勝任這個，試試看吧。"
6. "幫忙分擔一下，團隊合作嘛。"
7. "這個很簡單，你應該很快就能做完。"
8. "我教你怎麼做，然後你來完成剩下的部分。"

### 2. 被動攻擊性對話（7 個）
辦公室中常見的微妙攻擊：
9. "菜鳥今天看起來很閒啊，是不是工作太簡單了？"
10. "我像你這麼新的時候，一天可以處理三倍的工作量。"
11. "慢慢來，反正我們也不急...（諷刺語氣）"
12. "你確定這樣做對嗎？算了，新人嘛。"
13. "這個錯誤我十年前就不會犯了。"
14. "你的方法...很有創意，雖然不是標準做法。"
15. "沒關係，多做幾次就會了，雖然時間不等人。"

### 3. 工作壓力對話（6 個）
增加玩家壓力的對話：
16. "Deadline 是今天下班前，你應該沒問題吧？"
17. "老闆剛剛問起這個，我說你在處理了。"
18. "這個客戶很難搞，祝你好運。"
19. "上次做這個的人已經離職了，原因不明。"
20. "這個專案很重要，千萬不能搞砸。"
21. "壓力大嗎？這只是開始而已。"

### 4. 假同情對話（5 個）
表面關心實則施壓：
22. "看你這麼辛苦，要不要休息一下？不過這個要先做完。"
23. "我知道這很難，但大家都經歷過這個階段。"
24. "別太有壓力，雖然這個做不好會影響整個部門。"
25. "慢慢來，品質比較重要...但今天一定要完成。"
26. "你臉色不太好，是不是太累了？做完這個就可以休息了。"

### 5. 反手讚美對話（5 個）
表面讚美實則貶低：
27. "以新人來說，你做得還不錯。"
28. "這次比上次好多了，雖然還是有進步空間。"
29. "你的簡報技巧...很有個人風格。"
30. "至少你很努力，這點值得肯定。"
31. "想法不錯，如果實際一點會更好。"

### 6. 直接侮辱對話（4 個）
較強烈的攻擊性對話：
32. "菜鳥就是菜鳥，連這個都不會。"
33. "你是來上班還是來實習的？"
34. "這種水準是怎麼通過面試的？"
35. "我來做可能比較快，你只會拖累進度。"

### 7. 居高臨下建議對話（5 個）
以導師姿態給予「建議」：
36. "讓我教你職場第一課：效率比完美重要。"
37. "在我們部門，主動加班是基本態度。"
38. "與其問問題，不如自己先試試看。"
39. "真正的專業是即使不會也要裝作會。"
40. "你的問題在於想太多，做就對了。"

## 對話分類與觸發條件

### 分類系統
```typescript
export const DIALOGUE_CATEGORIES = {
  ACTIVE_ATTACK: "ACTIVE_ATTACK",      // 主動攻擊
  PASSIVE_AGGRESSIVE: "PASSIVE_AGGRESSIVE", // 被動攻擊
  WORK_PRESSURE: "WORK_PRESSURE",      // 工作壓力
  FAKE_SYMPATHY: "FAKE_SYMPATHY",      // 假同情
  BACKHANDED_COMPLIMENT: "BACKHANDED_COMPLIMENT", // 反手讚美
  DIRECT_INSULT: "DIRECT_INSULT",      // 直接侮辱
  CONDESCENDING_ADVICE: "CONDESCENDING_ADVICE", // 居高臨下建議
};
```

### 觸發條件
1. **主動攻擊**：NPC 攻擊玩家時隨機選擇
2. **被動攻擊性**：NPC 壓力 > 50 時有機率觸發
3. **工作壓力**：遊戲天數 > 3 時增加觸發機率
4. **假同情**：玩家壓力 > 70 時觸發
5. **反手讚美**：玩家完成任務後觸發
6. **直接侮辱**：NPC 壓力 > 80 且玩家表現不佳時觸發
7. **居高臨下建議**：玩家等級 < 3 時有機率觸發

## 對話管理系統擴展

### 擴展 DialogueManager
```typescript
export class DialogueManager {
  public static getQuoteByCategory(category: string, npc?: any): string {
    const quotes = DIALOGUE_POOL[category] || DIALOGUE_POOL.GENERIC;
    return this.pickRandom(quotes);
  }

  public static getContextualQuote(npc: any, player: any, gameState: any): string {
    // 根據遊戲狀態選擇最合適的對話類別
    if (npc.isAttacking) {
      return this.getQuoteByCategory(DIALOGUE_CATEGORIES.ACTIVE_ATTACK);
    }

    if (player.stress > 70) {
      return this.getQuoteByCategory(DIALOGUE_CATEGORIES.FAKE_SYMPATHY);
    }

    if (npc.stress > 80) {
      return this.getQuoteByCategory(DIALOGUE_CATEGORIES.DIRECT_INSULT);
    }

    // 隨機選擇其他類別
    const categories = Object.values(DIALOGUE_CATEGORIES);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    return this.getQuoteByCategory(randomCategory);
  }
}
```

## 實施步驟

### 階段一：對話池擴展
1. 在 `src/constants.ts` 中新增對話池
2. 定義對話分類常數
3. 確保對話包含「菜鳥」引用

### 階段二：對話管理系統升級
1. 擴展 `DialogueManager` 類別
2. 實現情境感知對話選擇
3. 添加對話觸發條件邏輯

### 階段三：遊戲整合
1. 更新 NPC 對話觸發邏輯
2. 測試不同情境下的對話顯示
3. 調整對話頻率和多樣性

## 技術實現細節

### 對話池結構
```typescript
export const DIALOGUE_POOL = {
  ACTIVE_ATTACK: [
    // 8 個主動攻擊對話
  ],
  PASSIVE_AGGRESSIVE: [
    // 7 個被動攻擊性對話
  ],
  WORK_PRESSURE: [
    // 6 個工作壓力對話
  ],
  FAKE_SYMPATHY: [
    // 5 個假同情對話
  ],
  BACKHANDED_COMPLIMENT: [
    // 5 個反手讚美對話
  ],
  DIRECT_INSULT: [
    // 4 個直接侮辱對話
  ],
  CONDESCENDING_ADVICE: [
    // 5 個居高臨下建議對話
  ],

  // 保留現有對話池
  GENERIC: [...],
  STRESSED: [...],
  // 新增
  RESPONSE: [
    // 玩家回應對話（可選擴展）
  ]
};
```

### 對話權重系統
為增加動態性，可實現權重系統：
- 每條對話有基礎權重
- 根據遊戲狀態調整權重
- 最近使用過的對話權重降低
- 確保對話多樣性

## 預期效果

1. **豐富的 NPC 個性**：不同對話類別展現 NPC 的多面性
2. **動態遊戲體驗**：玩家無法預測 NPC 的下一句話
3. **增強沉浸感**：真實的辦公室對話環境
4. **遊戲難度曲線**：隨著遊戲進展，對話變得更加尖銳
5. **情感反應**：對話引發玩家的情感反應（挫折、憤怒、動力）

## 測試計劃

1. **對話顯示測試**：確保所有對話正確顯示
2. **觸發邏輯測試**：驗證不同情境下的對話選擇
3. **多樣性測試**：確保對話不會重複出現
4. **性能測試**：對話系統不影響遊戲性能
5. **玩家體驗測試**：收集玩家對對話系統的反饋

## 結論

這個擴展對話池將顯著提升遊戲的深度和沉浸感。通過 40 個精心設計的對話行和 7 個不同的對話類別，NPC 將展現更加豐富和不可預測的行為，增強辦公室生存遊戲的真實感和挑戰性。
