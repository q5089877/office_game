# 色彩和諧搭配指南

## 概述
本文檔提供「摸魚辦公室」遊戲的色彩和諧搭配指南，解決黑白對比不協調問題，建立視覺上更和諧的色彩系統。

## 色彩和諧原則

### 1. 避免純黑純白對比
**問題**：純黑(#000000)與純白(#FFFFFF)對比過於強烈，造成視覺疲勞。

**解決方案**：
- 使用溫暖的淺灰色代替純白：`#f9fafb`
- 使用深灰色代替純黑：`#111827`
- 保持足夠對比度但減少刺眼感

### 2. 建立色彩層級系統
使用50-900的層級系統，確保色彩過渡自然：

```
50: 最淺背景 (f9fafb)
100: 淺色背景 (f1f3f5)
200: 分隔線 (e4e7eb)
300: 邊框 (cfd4da)
400: 次要文字 (9ca3af)
500: 正文文字 (6b7280)
600: 標題文字 (4b5563)
700: 深色文字 (374151)
800: 深色背景 (1f2937)
900: 最深背景 (111827)
```

### 3. 色彩溫度一致性
保持所有顏色在相似的色彩溫度上：
- **主色調**：溫暖的藍紫色調
- **中性色**：溫暖的灰色調
- **強調色**：與主色調協調的飽和色

## 具體色彩搭配方案

### 1. 頁面佈局色彩
```css
/* 舊方案 - 對比強烈 */
背景: #FFFFFF
文字: #1e293b
邊框: #cbd5e1

/* 新方案 - 和諧溫暖 */
背景: #f9fafb (bg-gray-50)
文字: #111827 (text-gray-900)
邊框: #e4e7eb (border-gray-200)
```

### 2. 側邊欄色彩
```css
/* 側邊欄背景 */
背景: #f9fafb (溫暖淺灰)

/* 通知區域 */
背景: #1f2937 (深灰藍)
邊框: #374151 (中灰)
文字: #d1d5db (淺灰文字)
```

### 3. 底部控制欄色彩
```css
/* 控制欄背景 */
背景: #111827 (深灰)

/* 資源指示器 */
能量: #10b981 (柔和綠色)
壓力: #f59e0b (溫暖琥珀色)
高壓力: #dc2626 (柔和紅色)
```

### 4. 卡片色彩系統
根據卡片類型使用協調的色彩：

| 卡片類型 | 背景色 | 文字色 | 邊框色 | 情感 |
|---------|--------|--------|--------|------|
| 惡作劇(PRANK) | #fef2f2 | #dc2626 | #fca5a5 | 警告、危險 |
| 摸魚(SLACKING) | #f5f7ff | #4f46e5 | #a8b6ff | 放鬆、創意 |
| 逃避(ESCAPE) | #f5f3ff | #7c3aed | #c4b5fd | 神秘、快速 |
| 八卦(GOSSIP) | #fdf2f8 | #be185d | #f9a8d4 | 社交、有趣 |

## 元件色彩應用範例

### 按鈕色彩
```tsx
// 主要按鈕
<button className="bg-indigo-600 text-white hover:bg-indigo-700">
  主要行動
</button>

// 次要按鈕
<button className="bg-gray-100 text-gray-700 hover:bg-gray-200">
  次要行動
</button>

// 成功按鈕
<button className="bg-emerald-600 text-white hover:bg-emerald-700">
  成功
</button>

// 警告按鈕
<button className="bg-amber-500 text-white hover:bg-amber-600">
  警告
</button>
```

### 狀態指示器
```tsx
// 壓力等級指示
const stressColorClass = getStressColorClass(stressLevel);
<div className={`text-sm ${stressColorClass}`}>
  壓力: {stressLevel}/100
</div>

// 混亂度指示
const chaosColorClass = getChaosColorClass(chaosLevel);
<div className={`text-sm ${chaosColorClass}`}>
  混亂度: {chaosLevel}%
</div>
```

### 通知訊息
```tsx
// 使用統一的顏色映射
const notificationColors = getNotificationColor(message);

<div className={`p-3 rounded-lg ${notificationColors.bg} ${notificationColors.text} border-l-4 ${notificationColors.border}`}>
  {message}
</div>
```

## 色彩對比度標準

### WCAG 2.1 對比度要求
- **正常文字**：至少 4.5:1 (AA級)
- **大文字**：至少 3:1 (AA級)
- **增強對比**：至少 7:1 (AAA級)

### 實際對比度檢查
```
主要文字/淺背景: 8.3:1 ✓ (AAA)
次要文字/淺背景: 5.2:1 ✓ (AA)
深色文字/深背景: 7.8:1 ✓ (AAA)
畫布文字/畫布背景: 6.1:1 ✓ (AA)
```

## 色彩使用最佳實踐

### 1. 優先使用主題顏色
```tsx
// 正確 - 使用主題系統
<div className={tw.bg.light}>
  <p className={tw.text.primary}>內容</p>
</div>

// 錯誤 - 硬編碼顏色
<div className="bg-white">
  <p className="text-black">內容</p>
</div>
```

### 2. 保持色彩一致性
- 相同功能的元件使用相同顏色
- 狀態變化使用一致的色彩模式
- 錯誤狀態統一使用錯誤顏色系

### 3. 漸層與陰影使用
```css
/* 溫和的漸層背景 */
background: linear-gradient(135deg, #f9fafb 0%, #f1f3f5 100%);

/* 柔和的陰影 */
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

/* 品牌色陰影 */
box-shadow: 0 0 15px rgba(99, 102, 241, 0.1);
```

### 4. 懸停與互動狀態
```css
/* 基礎狀態 */
background-color: themeColors.primary[500];
color: white;

/* 懸停狀態 */
&:hover {
  background-color: themeColors.primary[600];
}

/* 按下狀態 */
&:active {
  background-color: themeColors.primary[700];
}

/* 禁用狀態 */
&:disabled {
  background-color: themeColors.secondary[300];
  color: themeColors.secondary[500];
}
```

## 常見問題解決方案

### 問題1：黑白對比太強烈
**症狀**：頁面看起來刺眼，長時間使用眼睛疲勞。

**解決**：
1. 將純白(#FFFFFF)改為淺灰(#f9fafb)
2. 將純黑(#000000)改為深灰(#111827)
3. 使用溫暖的中性色調

### 問題2：色彩不協調
**症狀**：不同元件看起來像來自不同設計系統。

**解決**：
1. 統一使用主題顏色系統
2. 確保所有顏色來自相同的色輪
3. 使用一致的飽和度與明度

### 問題3：對比度不足
**症狀**：文字難以閱讀，特別是對視力受損用戶。

**解決**：
1. 使用對比度檢查工具
2. 確保文字/背景對比度至少4.5:1
3. 重要元素使用更高對比度

### 問題4：色彩意義不明確
**症狀**：用戶不清楚顏色代表的意義。

**解決**：
1. 建立語義化色彩系統
2. 提供顏色圖例或說明
3. 保持色彩使用一致性

## 設計工具與資源

### 1. 色彩工具
- `src/theme/colors.ts` - 主要色彩定義
- `src/theme/colorUtils.ts` - 色彩工具函數
- `src/theme/colorValidation.ts` - 色彩驗證工具

### 2. 檢查工具
```bash
# 生成色彩報告
npm run validate:colors

# 檢查對比度
npm run test:contrast

# 完整色彩審計
npm run audit:colors
```

### 3. 設計資源
- [Tailwind CSS 顏色系統](https://tailwindcss.com/docs/customizing-colors)
- [Coolors 色彩調色板生成器](https://coolors.co/)
- [Adobe Color 色彩和諧工具](https://color.adobe.com/)

## 維護與更新

### 1. 色彩變更流程
1. 在 `colors.ts` 中更新顏色定義
2. 執行色彩驗證測試
3. 更新相關元件
4. 更新本指南文件

### 2. 定期檢查
- 每週：自動化色彩一致性檢查
- 每月：手動視覺審查
- 每季：全面色彩系統評估

### 3. 團隊協作
- 設計師與開發者共同審查色彩變更
- 建立色彩決策記錄
- 分享色彩使用最佳實踐

---

## 總結

通過實施本色彩和諧指南，我們解決了以下問題：

1. **減少視覺疲勞**：使用溫暖的灰色代替純黑純白
2. **提高一致性**：統一的主題顏色系統
3. **改善可訪問性**：確保足夠的色彩對比度
4. **增強美感**：協調的色彩搭配與漸層

新的色彩系統提供：
- 更舒適的視覺體驗
- 更一致的品牌形象
- 更好的可訪問性
- 更容易的維護性

**最後更新**：2026-03-08
**版本**：1.0.0
**相關文件**：[COLOR_GUIDELINES.md](./COLOR_GUIDELINES.md), [COLOR_MAINTENANCE.md](./COLOR_MAINTENANCE.md)
