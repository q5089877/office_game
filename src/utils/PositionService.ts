/**
 * 統一的坐標服務
 * 確保所有辦公室實體（桌子、NPC、物件）使用一致的坐標計算
 */

import { CANVAS_CONFIG, GridCalculator } from '../config/canvasConfig';
import { EntityType } from '../types';

export type GridPosition = { x: number; y: number };
export type PixelPosition = { x: number; y: number };

/**
 * 辦公室實體類型
 */
export enum OfficeEntity {
  DESK = 'DESK',
  NPC = 'NPC',
  PLAYER = 'PLAYER',
  BOSS = 'BOSS',
  PLANT = 'PLANT',
  OBJECT = 'OBJECT',
  GRID_POINT = 'GRID_POINT'
}

/**
 * 統一的坐標轉換服務
 */
export class PositionService {
  /**
   * 將網格坐標轉換為像素坐標
   * @param gridX 網格X坐標 (0-10)
   * @param gridY 網格Y坐標 (0-6)
   * @param entityType 實體類型
   * @returns 像素坐標 {x, y}
   */
  static gridToPixel(gridX: number, gridY: number, entityType: OfficeEntity): PixelPosition {
    switch (entityType) {
      case OfficeEntity.DESK:
        return GridCalculator.getDeskPosition(gridX, gridY);

      case OfficeEntity.NPC:
      case OfficeEntity.PLAYER:
        // NPC和玩家使用單元格中心點，與桌子對齊
        return {
          x: GridCalculator.getCellCenterX(gridX),
          y: GridCalculator.getCellCenterY(gridY)
        };

      case OfficeEntity.BOSS:
        // 老闆也使用單元格中心點
        return {
          x: GridCalculator.getCellCenterX(gridX),
          y: GridCalculator.getCellCenterY(gridY)
        };

      case OfficeEntity.PLANT:
        return GridCalculator.getPlantPosition(gridX, gridY);

      case OfficeEntity.OBJECT:
        return GridCalculator.getObjectPosition(gridX, gridY);

      case OfficeEntity.GRID_POINT:
        return GridCalculator.getGridPointPosition(gridX, gridY);

      default:
        // 預設返回單元格中心點
        return {
          x: GridCalculator.getCellCenterX(gridX),
          y: GridCalculator.getCellCenterY(gridY)
        };
    }
  }

  /**
   * 計算NPC的顯示位置（考慮移動動畫）
   * @param displayX 顯示X坐標（可能包含小數）
   * @param displayY 顯示Y坐標（可能包含小數）
   * @returns 像素坐標 {x, y}
   */
  static getNPCDisplayPosition(displayX: number, displayY: number): PixelPosition {
    // 使用與gridToPixel相同的計算邏輯，但使用displayX/Y而不是整數gridX/Y
    return {
      x: GridCalculator.getCellCenterX(displayX),
      y: GridCalculator.getCellCenterY(displayY)
    };
  }

  /**
   * 獲取桌子標籤位置（桌子上的名牌位置）
   * @param gridX 網格X坐標
   * @param gridY 網格Y坐標
   * @returns 像素坐標 {x, y}
   */
  static getDeskLabelPosition(gridX: number, gridY: number): PixelPosition {
    const deskPos = GridCalculator.getDeskPosition(gridX, gridY);
    // 標籤在桌子內部，稍微偏移
    return {
      x: deskPos.x + 45, // 桌子寬度90的一半
      y: deskPos.y + 60  // 桌子高度70的底部附近
    };
  }

  /**
   * 計算兩個位置之間的距離（像素）
   */
  static distance(pos1: PixelPosition, pos2: PixelPosition): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 檢查NPC是否在桌子旁邊（視覺對齊驗證）
   * @param npcPos NPC像素位置
   * @param deskPos 桌子像素位置
   * @param threshold 允許的最大偏移（像素）
   * @returns 是否對齊
   */
  static isNPCAlignedWithDesk(
    npcPos: PixelPosition,
    deskPos: PixelPosition,
    threshold: number = 20
  ): boolean {
    // NPC應該在桌子的上方或旁邊
    const dx = Math.abs(npcPos.x - (deskPos.x + 45)); // 桌子中心X
    const dy = Math.abs(npcPos.y - (deskPos.y - 10)); // 桌子稍微上方

    return dx <= threshold && dy <= threshold;
  }

  /**
   * 獲取所有桌子的預計算位置（用於除錯）
   */
  static getAllDeskPositions(): Array<{id: string, gridX: number, gridY: number, pixel: PixelPosition}> {
    const { OFFICE_LAYOUT } = require('../constants');
    const positions = [];

    for (const cluster of OFFICE_LAYOUT.clusters) {
      for (const desk of cluster.desks) {
        if (desk.owner) {
          positions.push({
            id: desk.id,
            gridX: desk.x,
            gridY: desk.y,
            pixel: this.gridToPixel(desk.x, desk.y, OfficeEntity.DESK)
          });
        }
      }
    }

    return positions;
  }

  /**
   * 獲取除錯資訊（用於開發模式）
   */
  static getDebugInfo(gridX: number, gridY: number): Record<string, any> {
    return {
      grid: { x: gridX, y: gridY },
      cellCenter: {
        x: GridCalculator.getCellCenterX(gridX),
        y: GridCalculator.getCellCenterY(gridY)
      },
      desk: GridCalculator.getDeskPosition(gridX, gridY),
      npc: this.gridToPixel(gridX, gridY, OfficeEntity.NPC),
      offsets: {
        gridOffset: CANVAS_CONFIG.OFFSETS.GRID_OFFSET,
        cellCenter: {
          x: CANVAS_CONFIG.OFFSETS.CELL_CENTER_X,
          y: CANVAS_CONFIG.OFFSETS.CELL_CENTER_Y
        },
        deskOffset: CANVAS_CONFIG.OFFSETS.DESK,
        topExtra: CANVAS_CONFIG.OFFSETS.TOP_EXTRA_OFFSET
      }
    };
  }
}

/**
 * 簡化的輔助函數
 */
export const position = {
  desk: (gridX: number, gridY: number) => PositionService.gridToPixel(gridX, gridY, OfficeEntity.DESK),
  npc: (gridX: number, gridY: number) => PositionService.gridToPixel(gridX, gridY, OfficeEntity.NPC),
  player: (gridX: number, gridY: number) => PositionService.gridToPixel(gridX, gridY, OfficeEntity.PLAYER),
  object: (gridX: number, gridY: number) => PositionService.gridToPixel(gridX, gridY, OfficeEntity.OBJECT),
  plant: (gridX: number, gridY: number) => PositionService.gridToPixel(gridX, gridY, OfficeEntity.PLANT)
};
