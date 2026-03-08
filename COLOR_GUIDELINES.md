# 色彩統一性指南與規範

## 概述
本文件定義「摸魚辦公室」遊戲的色彩使用規範，確保整個應用程式的視覺一致性與可維護性。

## 色彩系統架構

### 1. 核心色彩檔案
- `src/theme/colors.ts` - 主要色彩定義
- `src/theme/colorUtils.ts` - 色彩工具函數（待創建）
- `src/index.css` - 全域CSS變數

### 2. 色彩層級系統
使用50-900的層級系統，數值越大顏色越深：
- 50: 最淺，用於背景
- 100-200: 淺色背景、懸停狀態
- 300-400: 邊框、分隔線
- 500: 主要品牌色、按鈕
- 600-700: 文字、重要元素
- 800-900: 深色背景、標題文字

## 色彩分類與使用規範

### 主色調 (Primary)
```typescript
primary: {
  50: '#eef2ff',  // 最淺背景
  100: '#e0e7ff', // 淺色背景
  200: '#c7d2fe', // 邊框、懸停
  300: '#a5b4fc', // 次要邊框
  400: '#818cf8', // 次要按鈕
  500: '#6366f1', // 主要品牌色 ★
  600: '#4f46e5', // 懸停狀態
  700: '#4338ca', // 按下狀態
  800: '#3730a3', // 深色文字
  900: '#312e81', // 標題文字
}
```
**使用場景**：主要按鈕、品牌元素、重要互動

### 次要色調 (Secondary)
```typescript
secondary: {
  50: '#f8fafc',  // 頁面背景
  100: '#f1f5f9', // 卡片背景
  200: '#e2e8f0', // 分隔線
  300: '#cbd5e1', // 邊框
  400: '#94a3b8', // 次要文字
  500: '#64748b', // 正文文字
  600: '#475569', // 標題文字
  700: '#334155', // 重要標題
  800: '#1e293b', // 深色模式文字
  900: '#0f172a', // 深色背景
}
```
**使用場景**：文字、背景、邊框、中性元素

### 語義化色彩

#### 成功 (Success)
- 50-100: 成功背景
- 500: 成功文字、圖標
- 600: 成功按鈕
**使用場景**：購買成功、狀態良好、正面反饋

#### 警告 (Warning)
- 50-100: 警告背景
- 500: 警告文字
- 600: 警告按鈕
**使用場景**：中等壓力、需要注意的狀態

#### 錯誤 (Error)
- 50-100: 錯誤背景
- 500: 錯誤文字
- 600: 錯誤按鈕
**使用場景**：高壓力、錯誤狀態、負面反饋

### 遊戲特定顏色
```typescript
game: {
  player: '#4f46e5',     // 玩家角色
  colleague: '#10b981',  // 同事角色
  boss: '#ef4444',       // 老闆角色
  plant: '#22c55e',      // 植物
  cardPrank: '#ef4444',  // 惡作劇卡片
  cardSlacking: '#3b82f6', // 摸魚卡片
  cardEscape: '#8b5cf6', // 逃避卡片
  cardGossip: '#ec4899', // 八卦卡片
}
```

## 使用規範

### 1. 禁止事項
- ❌ 禁止硬編碼十六進位顏色值（如 `#F8FAFC`）
- ❌ 禁止使用未定義的Tailwind顏色類名
- ❌ 禁止在元件中直接定義顏色常數

### 2. 推薦做法
- ✅ 優先使用 `themeColors` 中的顏色常數
- ✅ 使用 `getThemeColor` 工具函數獲取顏色
- ✅ 使用語義化顏色名稱而非具體色值
- ✅ 遵循層級系統選擇適當的顏色深淺

### 3. 元件使用範例

#### 錯誤範例：
```tsx
<div className="bg-slate-50 text-slate-800 border-slate-200">
  <button className="bg-indigo-600 text-white">按鈕</button>
</div>
```

#### 正確範例：
```tsx
import { getThemeColor, tw } from '../theme/colorUtils';

const Component = () => {
  return (
    <div className={tw.bg.sidebar + " " + tw.text.primary + " " + tw.border.light}>
      <button
        className="bg-indigo-600 text-white"
        style={{
          backgroundColor: getThemeColor.primary(600),
          color: getThemeColor.text.onDark()
        }}
      >
        按鈕
      </button>
    </div>
  );
};
```

### 4. Tailwind類名映射
使用預定義的Tailwind類名映射，確保一致性：

```typescript
// 文字顏色
text.primary: 'text-slate-900'
text.secondary: 'text-slate-600'
text.muted: 'text-slate-400'

// 背景顏色
bg.light: 'bg-white'
bg.dark: 'bg-slate-900'
bg.sidebar: 'bg-slate-50'

// 邊框顏色
border.light: 'border-slate-200'
border.medium: 'border-slate-300'
border.focus: 'border-indigo-500'
```

## 卡片類型色彩映射

| 卡片類型 | 背景色 | 文字色 | 邊框色 | 使用場景 |
|---------|--------|--------|--------|----------|
| PRANK | error.100 | error.700 | error.300 | 惡作劇卡片 |
| SLACKING | primary.100 | primary.700 | primary.300 | 摸魚卡片 |
| ESCAPE | purple.100 | purple.700 | purple.300 | 逃避卡片 |
| GOSSIP | pink.100 | pink.700 | pink.300 | 八卦卡片 |

## 狀態色彩映射

### 壓力等級
- 0-30: `success.500` (綠色)
- 31-60: `warning.500` (橙色)
- 61-80: `warning.700` (深橙色)
- 81-100: `error.600` (紅色)

### 混亂度
- 0-30: `success.400` (淺綠色)
- 31-60: `warning.400` (淺橙色)
- 61-100: `error.500` (紅色)

## 實施步驟

### 階段一：基礎建設
1. 擴展現有 `colors.ts` 檔案
2. 創建 `colorUtils.ts` 工具函數
3. 更新 `index.css` 加入CSS變數

### 階段二：元件遷移
1. 更新 `Sidebar.tsx` 使用統一色彩
2. 更新 `BottomCardArea.tsx` 使用統一色彩
3. 更新 `App.tsx` 使用統一色彩
4. 更新其他UI元件

### 階段三：驗證與優化
1. 視覺一致性檢查
2. 對比度測試
3. 可訪問性驗證
4. 性能優化

## 維護機制

### 1. 色彩審查
- 每週檢查新增元件是否遵循色彩規範
- 使用ESLint規則檢查硬編碼顏色值

### 2. 變更管理
- 色彩變更需要更新 `colors.ts` 檔案
- 重大變更需要設計審查
- 更新色彩指南文件

### 3. 測試驗證
- 視覺回歸測試
- 對比度自動化測試
- 色彩無障礙測試

## 附錄：常用色彩組合

### 淺色主題
```css
--bg-page: themeColors.secondary[50]
--bg-card: themeColors.secondary[100]
--text-primary: themeColors.secondary[900]
--text-secondary: themeColors.secondary[600]
--border: themeColors.secondary[200]
```

### 深色主題
```css
--bg-page: themeColors.secondary[900]
--bg-card: themeColors.secondary[800]
--text-primary: themeColors.secondary[50]
--text-secondary: themeColors.secondary[400]
--border: themeColors.secondary[700]
```

### 成功狀態
```css
--bg-success: themeColors.success[50]
--text-success: themeColors.success[700]
--border-success: themeColors.success[200]
```

### 錯誤狀態
```css
--bg-error: themeColors.error[50]
--text-error: themeColors.error[700]
--border-error: themeColors.error[200]
```

---

**最後更新**：2026-03-08
**負責人**：Roo (AI架構師)
**版本**：1.0.0
