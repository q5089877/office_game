/**
 * Canvas 配置常數集中管理
 * 統一管理所有與畫布尺寸、網格系統相關的常數
 */

import { OFFICE_LAYOUT } from '../constants';

// 基礎畫布尺寸
export const CANVAS_CONFIG = {
  // 基礎尺寸（與 OFFICE_LAYOUT 保持一致）
  BASE_WIDTH: OFFICE_LAYOUT.width,      // 1080
  BASE_HEIGHT: OFFICE_LAYOUT.height,    // 700

  // 網格系統
  GRID: {
    COLUMNS: OFFICE_LAYOUT.gridSize.x,  // 11
    ROWS: OFFICE_LAYOUT.gridSize.y,     // 7
    CELL_WIDTH: OFFICE_LAYOUT.cellWidth, // 98
    CELL_HEIGHT: OFFICE_LAYOUT.cellHeight, // 85
  },

  // 偏移量常數
  OFFSETS: {
    // 單元格中心點偏移
    CELL_CENTER_X: OFFICE_LAYOUT.cellWidth / 2,   // 49
    CELL_CENTER_Y: OFFICE_LAYOUT.cellHeight / 2,  // 42.5

    // 頂部偏移（用於將畫布內容向下移動）
    TOP_OFFSET: 80,

    // 物件特定偏移
    DESK: {
      X_OFFSET: -45,    // 桌子X軸偏移
      Y_OFFSET: 8.5,    // 桌子Y軸偏移
    },

    OBJECT: {
      X_OFFSET: -35,    // 物件X軸偏移
      Y_OFFSET: 4.5,    // 物件Y軸偏移
    },

    PLANT: {
      Y_OFFSET: 42.5,   // 植物Y軸偏移
    },
  },

  // UI 佈局常數
  UI: {
    SIDEBAR_WIDTH: 288,     // 側邊欄寬度
    BOTTOM_HEIGHT: 200,     // 底部區域高度
  },

  // 縮放配置
  SCALE: {
    MIN_SCALE: 0.35,        // 最小縮放比例
    MAX_SCALE: 2.0,         // 最大縮放比例
    PADDING_FACTOR: 0.98,   // 緩衝係數
    DEBOUNCE_MS: 150,       // 防抖動時間（毫秒）
  },

  // 寬高比配置
  ASPECT_RATIO: {
    BASE: OFFICE_LAYOUT.width / OFFICE_LAYOUT.height, // 1.542857
    WIDE_SCREEN_THRESHOLD: 1.1,  // 較寬螢幕閾值
    ULTRA_WIDE_THRESHOLD: 1.3,   // 超寬螢幕閾值
    WIDE_ADJUSTMENT: 1.05,       // 寬螢幕調整係數
  },
} as const;

// 工具函數：計算網格位置
export const GridCalculator = {
  /**
   * 計算網格單元格的中心X座標
   */
  getCellCenterX(gridX: number): number {
    return gridX * CANVAS_CONFIG.GRID.CELL_WIDTH + CANVAS_CONFIG.OFFSETS.CELL_CENTER_X;
  },

  /**
   * 計算網格單元格的中心Y座標（包含頂部偏移）
   */
  getCellCenterY(gridY: number): number {
    return gridY * CANVAS_CONFIG.GRID.CELL_HEIGHT + CANVAS_CONFIG.OFFSETS.CELL_CENTER_Y + CANVAS_CONFIG.OFFSETS.TOP_OFFSET;
  },

  /**
   * 計算桌子的位置
   */
  getDeskPosition(gridX: number, gridY: number) {
    return {
      x: this.getCellCenterX(gridX) + CANVAS_CONFIG.OFFSETS.DESK.X_OFFSET,
      y: gridY * CANVAS_CONFIG.GRID.CELL_HEIGHT + CANVAS_CONFIG.OFFSETS.DESK.Y_OFFSET + CANVAS_CONFIG.OFFSETS.TOP_OFFSET,
    };
  },

  /**
   * 計算物件的位置
   */
  getObjectPosition(gridX: number, gridY: number) {
    return {
      x: this.getCellCenterX(gridX) + CANVAS_CONFIG.OFFSETS.OBJECT.X_OFFSET,
      y: gridY * CANVAS_CONFIG.GRID.CELL_HEIGHT + CANVAS_CONFIG.OFFSETS.OBJECT.Y_OFFSET + CANVAS_CONFIG.OFFSETS.TOP_OFFSET,
    };
  },

  /**
   * 計算植物的位置
   */
  getPlantPosition(gridX: number, gridY: number) {
    return {
      x: this.getCellCenterX(gridX),
      y: gridY * CANVAS_CONFIG.GRID.CELL_HEIGHT + CANVAS_CONFIG.OFFSETS.PLANT.Y_OFFSET + CANVAS_CONFIG.OFFSETS.TOP_OFFSET,
    };
  },

  /**
   * 計算網格點的位置（用於網格視覺化）
   */
  getGridPointPosition(gridX: number, gridY: number) {
    return {
      x: this.getCellCenterX(gridX),
      y: this.getCellCenterY(gridY),
    };
  },
};

// 類型定義
export type CanvasConfig = typeof CANVAS_CONFIG;
export type GridPosition = { x: number; y: number };
