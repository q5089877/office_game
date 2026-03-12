# NPC 主動攻擊機制與菜鳥改名實施計劃

## 概述
本計劃旨在實現兩個主要功能：
1. 將玩家名稱從「新進員工」改為「菜鳥」
2. 實現 NPC 主動攻擊玩家的機制，增加遊戲互動性

## 目前程式分析

### 遊戲架構
- **遊戲類型**：辦公室生存模擬遊戲
- **核心系統**：精力/壓力管理、卡片系統、NPC 對話系統
- **NPC 類型**：同事 NPC（Lynn、Karen、Felicity、Andy 等）
- **目前互動**：NPC 會隨機走動、對話，但沒有主動攻擊功能

### 程式結構
- `src/useGameEngine.ts` - 遊戲引擎核心邏輯
- `src/logic/GameClasses.ts` - 遊戲類別定義（Character, GameManager）
- `src/logic/CardEffects.ts` - 卡片效果處理
- `src/constants.ts` - 遊戲常數與對話池
- `src/logic/DialogueManager.ts` - 對話管理系統

## 實施細節

### 1. 玩家名稱修改

**修改位置：**
1. `src/useGameEngine.ts` 第 17 行：
   ```typescript
   // 修改前
   const player = new Character('player', '新進員工', EntityType.PLAYER, undefined, 1, 1, Gender.MALE);

   // 修改後
   const player = new Character('player', '菜鳥', EntityType.PLAYER, undefined, 1, 1, Gender.MALE);
   ```

2. `src/useGameEngine.ts` 第 173 行：
   ```typescript
   // 修改前
   role: c.id === 'player' ? '新進員工' : '同事',

   // 修改後
   role: c.id === 'player' ? '菜鳥' : '同事',
   ```

### 2. NPC 主動攻擊機制

#### 2.1 擴展 Character 類別
在 `src/logic/GameClasses.ts` 的 `Character` 類別中添加：
```typescript
export class Character extends BaseEntity {
  // 現有屬性...
  public lastAttackTime: number = 0; // 上次攻擊時間戳
  public attackCooldown: number = 30000; // 攻擊冷卻時間（30秒）

  // 新增方法：檢查是否可以攻擊
  canAttack(): boolean {
    return Date.now() - this.lastAttackTime > this.attackCooldown;
  }

  // 新增方法：執行攻擊
  attack(target: Character): string {
    this.lastAttackTime = Date.now();
    const stressDamage = 10 + Math.floor(Math.random() * 11); // 10-20 壓力傷害
    target.stats.modifyStress(stressDamage);
    return `攻擊了 ${target.name}，造成 ${stressDamage} 點壓力`;
  }
}
```

#### 2.2 新增攻擊對話池
在 `src/constants.ts` 的 `DIALOGUE_POOL` 中添加：
```typescript
export const DIALOGUE_POOL = {
  // 現有對話池...

  // 攻擊對話
  ATTACK: [
    "菜鳥，這份報告你來做！",
    "新人就是要多學點，這個交給你處理",
    "我這邊忙不過來，你幫我一下",
    "這個很簡單，你應該很快就能做完",
    "老闆說要訓練新人，這個任務給你",
    "你剛來，多接觸不同工作對你有幫助",
    "我教你怎麼做，然後你來完成",
    "這個急件，你優先處理一下",
    "你的能力應該可以勝任這個",
    "幫忙分擔一下，團隊合作嘛"
  ],
};
```

#### 2.3 擴展 DialogueManager
在 `src/logic/DialogueManager.ts` 中添加攻擊對話方法：
```typescript
export class DialogueManager {
  // 現有方法...

  public static getAttackQuote(): string {
    return this.pickRandom(DIALOGUE_POOL.ATTACK);
  }
}
```

#### 2.4 實現攻擊邏輯
在 `GameManager.tick()` 方法中添加攻擊檢查（約在第 230 行後）：
```typescript
tick() {
  // 現有 tick 邏輯...

  // NPC 主動攻擊檢查
  this.colleagues.forEach(colleague => {
    // 檢查冷卻時間
    if (!colleague.canAttack()) return;

    // 檢查距離（相鄰格或同一格）
    const distance = Math.abs(colleague.gridX - this.player.gridX) +
                     Math.abs(colleague.gridY - this.player.gridY);

    // 攻擊觸發條件：距離 <= 2 且隨機機率
    if (distance <= 2 && Math.random() < 0.001) { // 每天約 0.1% 機率
      // 執行攻擊
      colleague.attack(this.player);

      // 顯示攻擊對話
      colleague.chatMessage = DialogueManager.getAttackQuote();
      colleague.chatTimer = 3000;

      // 添加通知
      this.addNotification(`⚠️ ${colleague.name} 把工作丟給你了！壓力 +${stressDamage}`);

      // 更新攻擊時間
      colleague.lastAttackTime = Date.now();
    }
  });
}
```

#### 2.5 調整攻擊平衡參數
- **攻擊距離**：2 格以內（相鄰或對角）
- **攻擊機率**：每 tick 0.1%（約每天 1-2 次攻擊）
- **攻擊傷害**：10-20 點壓力
- **攻擊冷卻**：30 秒

### 3. 增強玩家與 NPC 互動對話

#### 3.1 擴展現有對話池
在 `src/constants.ts` 中添加更多互動對話：
```typescript
// 在 GENERIC 陣列中添加更多辦公室相關對話
GENERIC: [
  // 現有對話...
  "菜鳥今天看起來很忙啊",
  "新人適應得怎麼樣？",
  "有問題可以問我，雖然我也不一定會",
  "辦公室政治比工作本身還難",
  "你覺得我們部門怎麼樣？",
  "中午要吃什麼？我推薦樓下的便當",
  "週末有什麼計畫嗎？",
  "這個月的績效考核快到了",
  "老闆今天心情好像不錯",
  "會議室又被預約滿了"
],

// 新增 RESPONSE 陣列（玩家對 NPC 的回應）
RESPONSE: [
  "好的，我來處理",
  "沒問題，交給我",
  "這個我需要一點時間",
  "我先研究一下怎麼做",
  "可以給我一些指引嗎？",
  "這個我之前沒做過",
  "我會盡快完成",
  "需要什麼時候交？",
  "有什麼特別要注意的嗎？",
  "我先排入我的待辦事項"
]
```

#### 3.2 添加雙向對話系統
擴展對話系統，讓玩家可以回應 NPC 的攻擊/對話：
1. 在卡片系統中添加回應卡片
2. 在 UI 中添加對話回應按鈕
3. 實現對話鏈系統

## 實施步驟

### 階段一：基礎修改（預計 1-2 小時）
1. 修改玩家名稱（菜鳥）
2. 添加攻擊對話池
3. 擴展 Character 類別

### 階段二：攻擊機制實現（預計 2-3 小時）
1. 實現攻擊邏輯
2. 添加攻擊通知
3. 調整遊戲平衡

### 階段三：增強互動（預計 3-4 小時）
1. 擴展對話系統
2. 添加更多互動對話
3. 實現雙向對話系統

### 階段四：測試與調整（預計 1-2 小時）
1. 單元測試
2. 整合測試
3. 遊戲平衡調整

## 技術考量

### 性能考量
- 攻擊檢查應在 tick 中進行，但機率要低以避免性能問題
- 使用時間戳記而非計數器來管理冷卻時間

### 遊戲平衡
- 攻擊頻率應隨遊戲天數增加而提高
- 攻擊傷害可與 NPC 壓力等級相關
- 玩家可透過道具或升級減少攻擊效果

### 擴展性
- 攻擊系統應設計為可擴展，未來可添加不同攻擊類型
- 對話系統應支援動態內容生成

## 風險與緩解

### 風險 1：遊戲難度過高
- **緩解**：初始攻擊機率設低，隨遊戲進展逐漸增加
- **緩解**：提供防禦性卡片或道具

### 風險 2：玩家體驗受影響
- **緩解**：攻擊應有明確視覺反饋和通知
- **緩解**：提供應對攻擊的策略選項

### 風險 3：程式複雜度增加
- **緩解**：保持程式模組化，新增獨立攻擊模組
- **緩解**：充分測試確保不影響現有功能

## 驗收標準

1. ✅ 玩家名稱正確顯示為「菜鳥」
2. ✅ NPC 會主動攻擊玩家（增加壓力）
3. ✅ 攻擊時顯示適當對話和通知
4. ✅ 攻擊有冷卻時間，不會過於頻繁
5. ✅ 遊戲平衡良好，難度適中
6. ✅ 玩家與 NPC 互動對話更加豐富

## 後續優化建議

1. **攻擊類型多樣化**：不同 NPC 有不同攻擊方式
2. **防禦機制**：玩家可學習技能或使用道具防禦攻擊
3. **關係系統**：攻擊影響 NPC 與玩家的關係值
4. **視覺特效**：攻擊時添加動畫效果
5. **音效系統**：添加攻擊音效和對話語音

## 檔案修改清單

1. `src/useGameEngine.ts` - 玩家名稱修改
2. `src/logic/GameClasses.ts` - Character 類別擴展
3. `src/constants.ts` - 對話池擴展
4. `src/logic/DialogueManager.ts` - 對話管理擴展
5. `src/logic/GameClasses.ts` - GameManager.tick() 攻擊邏輯

## 結論
本計劃提供了一個完整的 NPC 主動攻擊機制和玩家改名實施方案。透過系統化的修改和增強，將顯著提升遊戲的互動性和挑戰性，同時保持遊戲平衡和玩家體驗。
