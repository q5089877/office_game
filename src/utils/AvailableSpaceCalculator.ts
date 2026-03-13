/**
 * 可用空間計算器
 * 計算和分配可用空間給不同UI元素
 * 提供智慧空間分配算法
 */

import { BREAKPOINTS, LayoutMode } from './responsiveConfig';

// 空間分配策略
export type SpaceAllocationStrategy =
  | 'equal'          // 平均分配
  | 'proportional'   // 按比例分配
  | 'priority'       // 按優先級分配
  | 'adaptive'       // 自適應分配
  | 'fixed'          // 固定大小
  | 'minimal'        // 最小化分配
  | 'maximal';       // 最大化分配

// UI元素類型
export type UIElementType =
  | 'canvas'         // 遊戲畫布
  | 'sidebar'        // 側邊欄
  | 'cardArea'       // 卡片區域
  | 'header'         // 標頭
  | 'footer'         // 頁尾
  | 'navigation'     // 導航
  | 'controls'       // 控制項
  | 'infoPanel'      // 資訊面板
  | 'dialog'         // 對話框
  | 'overlay';       // 疊加層

// 空間配置
export interface SpaceConfig {
  elementType: UIElementType;
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
  preferredWidth: number;
  preferredHeight: number;
  priority: number; // 1-10，10為最高優先級
  strategy: SpaceAllocationStrategy;
  isVisible: boolean;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

// 空間分配結果
export interface SpaceAllocationResult {
  elementType: UIElementType;
  allocatedWidth: number;
  allocatedHeight: number;
  x: number;
  y: number;
  isOptimal: boolean;
  constraints: {
    meetsMinWidth: boolean;
    meetsMinHeight: boolean;
    withinMaxWidth: boolean;
    withinMaxHeight: boolean;
  };
  warnings: string[];
}

// 可用空間計算結果
export interface AvailableSpaceResult {
  totalWidth: number;
  totalHeight: number;
  usableWidth: number;
  usableHeight: number;
  safeArea: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  allocations: SpaceAllocationResult[];
  efficiency: number; // 空間利用率 0-1
  recommendations: string[];
}

// 預設空間配置
const DEFAULT_SPACE_CONFIGS: Record<UIElementType, SpaceConfig> = {
  canvas: {
    elementType: 'canvas',
    minWidth: 300,
    minHeight: 300,
    maxWidth: 1920,
    maxHeight: 1080,
    preferredWidth: 800,
    preferredHeight: 600,
    priority: 10, // 畫布最高優先級
    strategy: 'maximal',
    isVisible: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    padding: { top: 0, right: 0, bottom: 0, left: 0 }
  },
  sidebar: {
    elementType: 'sidebar',
    minWidth: 200,
    minHeight: 400,
    maxWidth: 400,
    maxHeight: 1080,
    preferredWidth: 300,
    preferredHeight: 800,
    priority: 7,
    strategy: 'adaptive',
    isVisible: true,
    margin: { top: 10, right: 10, bottom: 10, left: 10 },
    padding: { top: 20, right: 20, bottom: 20, left: 20 }
  },
  cardArea: {
    elementType: 'cardArea',
    minWidth: 400,
    minHeight: 150,
    maxWidth: 1920,
    maxHeight: 300,
    preferredWidth: 800,
    preferredHeight: 200,
    priority: 8,
    strategy: 'adaptive',
    isVisible: true,
    margin: { top: 10, right: 10, bottom: 10, left: 10 },
    padding: { top: 15, right: 15, bottom: 15, left: 15 }
  },
  header: {
    elementType: 'header',
    minWidth: 300,
    minHeight: 50,
    maxWidth: 1920,
    maxHeight: 100,
    preferredWidth: 1200,
    preferredHeight: 80,
    priority: 5,
    strategy: 'fixed',
    isVisible: true,
    margin: { top: 0, right: 0, bottom: 10, left: 0 },
    padding: { top: 10, right: 20, bottom: 10, left: 20 }
  },
  footer: {
    elementType: 'footer',
    minWidth: 300,
    minHeight: 40,
    maxWidth: 1920,
    maxHeight: 80,
    preferredWidth: 1200,
    preferredHeight: 60,
    priority: 3,
    strategy: 'fixed',
    isVisible: true,
    margin: { top: 10, right: 0, bottom: 0, left: 0 },
    padding: { top: 10, right: 20, bottom: 10, left: 20 }
  },
  navigation: {
    elementType: 'navigation',
    minWidth: 200,
    minHeight: 50,
    maxWidth: 400,
    maxHeight: 80,
    preferredWidth: 300,
    preferredHeight: 60,
    priority: 6,
    strategy: 'fixed',
    isVisible: true,
    margin: { top: 10, right: 10, bottom: 10, left: 10 },
    padding: { top: 10, right: 15, bottom: 10, left: 15 }
  },
  controls: {
    elementType: 'controls',
    minWidth: 150,
    minHeight: 100,
    maxWidth: 300,
    maxHeight: 200,
    preferredWidth: 200,
    preferredHeight: 150,
    priority: 4,
    strategy: 'minimal',
    isVisible: true,
    margin: { top: 10, right: 10, bottom: 10, left: 10 },
    padding: { top: 10, right: 10, bottom: 10, left: 10 }
  },
  infoPanel: {
    elementType: 'infoPanel',
    minWidth: 180,
    minHeight: 120,
    maxWidth: 350,
    maxHeight: 250,
    preferredWidth: 250,
    preferredHeight: 180,
    priority: 5,
    strategy: 'adaptive',
    isVisible: true,
    margin: { top: 10, right: 10, bottom: 10, left: 10 },
    padding: { top: 15, right: 15, bottom: 15, left: 15 }
  },
  dialog: {
    elementType: 'dialog',
    minWidth: 300,
    minHeight: 200,
    maxWidth: 600,
    maxHeight: 500,
    preferredWidth: 400,
    preferredHeight: 300,
    priority: 9, // 對話框高優先級
    strategy: 'fixed',
    isVisible: false, // 預設隱藏
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    padding: { top: 30, right: 30, bottom: 30, left: 30 }
  },
  overlay: {
    elementType: 'overlay',
    minWidth: 100,
    minHeight: 100,
    maxWidth: 1920,
    maxHeight: 1080,
    preferredWidth: 1920,
    preferredHeight: 1080,
    priority: 2,
    strategy: 'maximal',
    isVisible: false, // 預設隱藏
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    padding: { top: 0, right: 0, bottom: 0, left: 0 }
  }
};

/**
 * 可用空間計算器
 * 計算和分配可用空間給不同UI元素
 */
export class AvailableSpaceCalculator {
  private layoutMode: LayoutMode;
  private containerWidth: number;
  private containerHeight: number;
  private safeArea: { top: number; right: number; bottom: number; left: number };
  private elementConfigs: Map<UIElementType, SpaceConfig>;
  private customConfigs: Map<UIElementType, Partial<SpaceConfig>>;

  constructor(
    containerWidth: number,
    containerHeight: number,
    layoutMode: LayoutMode = 'desktop',
    safeArea?: { top: number; right: number; bottom: number; left: number }
  ) {
    this.containerWidth = containerWidth;
    this.containerHeight = containerHeight;
    this.layoutMode = layoutMode;
    this.safeArea = safeArea || this.getDefaultSafeArea();
    this.elementConfigs = new Map();
    this.customConfigs = new Map();

    this.initializeDefaultConfigs();
  }

  /**
   * 初始化預設配置
   */
  private initializeDefaultConfigs(): void {
    Object.entries(DEFAULT_SPACE_CONFIGS).forEach(([type, config]) => {
      this.elementConfigs.set(type as UIElementType, { ...config });
    });
  }

  /**
   * 獲取預設安全區域
   */
  private getDefaultSafeArea(): { top: number; right: number; bottom: number; left: number } {
    switch (this.layoutMode) {
      case 'mobile':
        return { top: 20, right: 10, bottom: 20, left: 10 }; // 手機安全區域較大
      case 'tablet':
        return { top: 15, right: 15, bottom: 15, left: 15 }; // 平板適中
      case 'desktop':
        return { top: 10, right: 20, bottom: 10, left: 20 }; // 桌面標準
      case 'wide':
        return { top: 10, right: 30, bottom: 10, left: 30 }; // 寬螢幕較大
      case 'ultra-wide':
        return { top: 10, right: 40, bottom: 10, left: 40 }; // 超寬螢幕最大
      default:
        return { top: 10, right: 20, bottom: 10, left: 20 };
    }
  }

  /**
   * 設置佈局模式
   */
  public setLayoutMode(layoutMode: LayoutMode): void {
    this.layoutMode = layoutMode;
    this.safeArea = this.getDefaultSafeArea();
    this.updateConfigsForLayoutMode();
  }

  /**
   * 更新配置以適應佈局模式
   */
  private updateConfigsForLayoutMode(): void {
    const multiplier = this.getLayoutMultiplier();

    for (const [type, config] of this.elementConfigs.entries()) {
      const updatedConfig = { ...config };

      // 根據佈局模式調整配置
      updatedConfig.minWidth = Math.round(config.minWidth * multiplier);
      updatedConfig.minHeight = Math.round(config.minHeight * multiplier);
      updatedConfig.preferredWidth = Math.round(config.preferredWidth * multiplier);
      updatedConfig.preferredHeight = Math.round(config.preferredHeight * multiplier);

      // 調整邊距和內邊距
      updatedConfig.margin = {
        top: Math.round(config.margin.top * multiplier),
        right: Math.round(config.margin.right * multiplier),
        bottom: Math.round(config.margin.bottom * multiplier),
        left: Math.round(config.margin.left * multiplier)
      };

      updatedConfig.padding = {
        top: Math.round(config.padding.top * multiplier),
        right: Math.round(config.padding.right * multiplier),
        bottom: Math.round(config.padding.bottom * multiplier),
        left: Math.round(config.padding.left * multiplier)
      };

      this.elementConfigs.set(type, updatedConfig);
    }
  }

  /**
   * 獲取佈局乘數
   */
  private getLayoutMultiplier(): number {
    switch (this.layoutMode) {
      case 'mobile':
        return 0.8; // 手機上元素較小
      case 'tablet':
        return 0.9; // 平板上適中
      case 'desktop':
        return 1.0; // 桌面標準
      case 'wide':
        return 1.1; // 寬螢幕稍大
      case 'ultra-wide':
        return 1.2; // 超寬螢幕最大
      default:
        return 1.0;
    }
  }

  /**
   * 設置容器尺寸
   */
  public setContainerSize(width: number, height: number): void {
    this.containerWidth = width;
    this.containerHeight = height;
  }

  /**
   * 設置安全區域
   */
  public setSafeArea(safeArea: { top: number; right: number; bottom: number; left: number }): void {
    this.safeArea = safeArea;
  }

  /**
   * 註冊自定義配置
   */
  public registerCustomConfig(
    elementType: UIElementType,
    config: Partial<SpaceConfig>
  ): void {
    this.customConfigs.set(elementType, config);

    // 更新現有配置
    const baseConfig = this.elementConfigs.get(elementType) || DEFAULT_SPACE_CONFIGS[elementType];
    const updatedConfig = { ...baseConfig, ...config };
    this.elementConfigs.set(elementType, updatedConfig);
  }

  /**
   * 獲取元素配置
   */
  public getElementConfig(elementType: UIElementType): SpaceConfig {
    const baseConfig = this.elementConfigs.get(elementType);
    const customConfig = this.customConfigs.get(elementType);

    if (!baseConfig) {
      throw new Error(`Unknown element type: ${elementType}`);
    }

    return {
      ...baseConfig,
      ...customConfig
    };
  }

  /**
   * 計算可用空間
   */
  public calculateAvailableSpace(): {
    usableWidth: number;
    usableHeight: number;
    safeArea: { top: number; right: number; bottom: number; left: number };
  } {
    const usableWidth = this.containerWidth - this.safeArea.left - this.safeArea.right;
    const usableHeight = this.containerHeight - this.safeArea.top - this.safeArea.bottom;

    return {
      usableWidth: Math.max(0, usableWidth),
      usableHeight: Math.max(0, usableHeight),
      safeArea: { ...this.safeArea }
    };
  }

  /**
   * 分配空間給單個元素
   */
  public allocateSpaceForElement(
    elementType: UIElementType,
    availableWidth?: number,
    availableHeight?: number
  ): SpaceAllocationResult {
    const config = this.getElementConfig(elementType);
    const space = this.calculateAvailableSpace();

    const width = availableWidth !== undefined ? availableWidth : space.usableWidth;
    const height = availableHeight !== undefined ? availableHeight : space.usableHeight;

    let allocatedWidth = 0;
    let allocatedHeight = 0;

    // 根據策略分配空間
    switch (config.strategy) {
      case 'equal':
        allocatedWidth = width;
        allocatedHeight = height;
        break;

      case 'proportional':
        allocatedWidth = Math.min(width, config.preferredWidth);
        allocatedHeight = Math.min(height, config.preferredHeight);
        break;

      case 'priority':
        // 優先級越高，分配的空間越多
        const priorityFactor = config.priority / 10;
        allocatedWidth = Math.min(width, config.preferredWidth * priorityFactor);
        allocatedHeight = Math.min(height, config.preferredHeight * priorityFactor);
        break;

      case 'adaptive':
        allocatedWidth = this.calculateAdaptiveWidth(config, width);
        allocatedHeight = this.calculateAdaptiveHeight(config, height);
        break;

      case 'fixed':
        allocatedWidth = config.preferredWidth;
        allocatedHeight = config.preferredHeight;
        break;

      case 'minimal':
        allocatedWidth = config.minWidth;
        allocatedHeight = config.minHeight;
        break;

      case 'maximal':
        allocatedWidth = Math.min(width, config.maxWidth);
        allocatedHeight = Math.min(height, config.maxHeight);
        break;

      default:
        allocatedWidth = config.preferredWidth;
        allocatedHeight = config.preferredHeight;
    }

    // 應用約束
    allocatedWidth = this.applyWidthConstraints(allocatedWidth, config);
    allocatedHeight = this.applyHeightConstraints(allocatedHeight, config);

    // 檢查約束
    const constraints = {
      meetsMinWidth: allocatedWidth >= config.minWidth,
      meetsMinHeight: allocatedHeight >= config.minHeight,
      withinMaxWidth: allocatedWidth <= config.maxWidth,
      withinMaxHeight: allocatedHeight <= config.maxHeight
    };

    // 生成警告
    const warnings: string[] = [];
    if (!constraints.meetsMinWidth) {
      warnings.push(`寬度不足：${allocatedWidth}px < ${config.minWidth}px`);
    }
    if (!constraints.meetsMinHeight) {
      warnings.push(`高度不足：${allocatedHeight}px < ${config.minHeight}px`);
    }
    if (!constraints.withinMaxWidth) {
      warnings.push(`寬度超出限制：${allocatedWidth}px > ${config.maxWidth}px`);
    }
    if (!constraints.withinMaxHeight) {
      warnings.push(`高度超出限制：${allocatedHeight}px > ${config.maxHeight}px`);
    }

    return {
      elementType,
      allocatedWidth,
      allocatedHeight,
      x: this.safeArea.left,
      y: this.safeArea.top,
      isOptimal: warnings.length === 0,
      constraints,
      warnings
    };
  }

  /**
   * 計算自適應寬度
   */
  private calculateAdaptiveWidth(config: SpaceConfig, availableWidth: number): number {
    // 自適應算法：根據可用空間和元素需求計算
    if (availableWidth >= config.preferredWidth) {
      return Math.min(availableWidth, config.maxWidth);
    } else if (availableWidth >= config.minWidth) {
      return availableWidth;
    } else {
      return config.minWidth;
    }
  }

  /**
   * 計算自適應高度
   */
  private calculateAdaptiveHeight(config: SpaceConfig, availableHeight: number): number {
    // 自適應算法：根據可用空間和元素需求計算
    if (availableHeight >= config.preferredHeight) {
      return Math.min(availableHeight, config.maxHeight);
    } else if (availableHeight >= config.minHeight) {
      return availableHeight;
    } else {
      return config.minHeight;
    }
  }

  /**
   * 應用寬度約束
   */
  private applyWidthConstraints(width: number, config: SpaceConfig): number {
    return Math.max(config.minWidth, Math.min(config.maxWidth, width));
  }

  /**
   * 應用高度約束
   */
  private applyHeightConstraints(height: number, config: SpaceConfig): number {
    return Math.max(config.minHeight, Math.min(config.maxHeight, height));
  }

  /**
   * 分配空間給多個元素
   */
  public allocateSpaceForElements(
    elementTypes: UIElementType[],
    layout: 'horizontal' | 'vertical' | 'grid' = 'horizontal'
  ): SpaceAllocationResult[] {
    const space = this.calculateAvailableSpace();
    const results: SpaceAllocationResult[] = [];

    if (layout === 'horizontal') {
      // 水平佈局：元素並排
      let currentX = this.safeArea.left;
      const availableHeight = space.usableHeight;

      for (const elementType of elementTypes) {
        const config = this.getElementConfig(elementType);
        if (!config.isVisible) continue;

        // 計算元素寬度
        let elementWidth = 0;
        if (config.strategy === 'fixed' || config.strategy === 'minimal') {
          elementWidth = config.preferredWidth;
        } else {
          // 平均分配剩餘寬度
          const remainingElements = elementTypes.filter((t, i) =>
            i >= results.length && this.getElementConfig(t).isVisible
          ).length;
          elementWidth = Math.floor(space.usableWidth / remainingElements);
        }

        // 應用約束
        elementWidth = this.applyWidthConstraints(elementWidth, config);

        const result = this.allocateSpaceForElement(
          elementType,
          elementWidth,
          availableHeight
        );

        // 更新位置
        result.x = currentX;
        currentX += elementWidth + config.margin.right;

        results.push(result);
      }
    } else if (layout === 'vertical') {
      // 垂直佈局：元素堆疊
      let currentY = this.safeArea.top;
      const availableWidth = space.usableWidth;

      for (const elementType of elementTypes) {
        const config = this.getElementConfig(elementType);
        if (!config.isVisible) continue;

        // 計算元素高度
        let elementHeight = 0;
        if (config.strategy === 'fixed' || config.strategy === 'minimal') {
          elementHeight = config.preferredHeight;
        } else {
          // 平均分配剩餘高度
          const remainingElements = elementTypes.filter((t, i) =>
            i >= results.length && this.getElementConfig(t).isVisible
          ).length;
          elementHeight = Math.floor(space.usableHeight / remainingElements);
        }

        // 應用約束
        elementHeight = this.applyHeightConstraints(elementHeight, config);

        const result = this.allocateSpaceForElement(
          elementType,
          availableWidth,
          elementHeight
        );

        // 更新位置
        result.y = currentY;
        currentY += elementHeight + config.margin.bottom;

        results.push(result);
      }
    } else if (layout === 'grid') {
      // 網格佈局：元素排列在網格中
      const columns = Math.min(3, elementTypes.length);
      const rows = Math.ceil(elementTypes.length / columns);

      const cellWidth = Math.floor(space.usableWidth / columns);
      const cellHeight = Math.floor(space.usableHeight / rows);

      elementTypes.forEach((elementType, index) => {
        const config = this.getElementConfig(elementType);
        if (!config.isVisible) return;

        const row = Math.floor(index / columns);
        const col = index % columns;

        const x = this.safeArea.left + col * cellWidth;
        const y = this.safeArea.top + row * cellHeight;

        const result = this.allocateSpaceForElement(
          elementType,
          cellWidth - config.margin.left - config.margin.right,
          cellHeight - config.margin.top - config.margin.bottom
        );

        result.x = x + config.margin.left;
        result.y = y + config.margin.top;

        results.push(result);
      });
    }

    return results;
  }

  /**
   * 計算空間利用率
   */
  public calculateSpaceEfficiency(allocations: SpaceAllocationResult[]): number {
    if (allocations.length === 0) return 0;

    const totalAllocatedArea = allocations.reduce((sum, allocation) => {
      return sum + (allocation.allocatedWidth * allocation.allocatedHeight);
    }, 0);

    const totalAvailableArea = this.containerWidth * this.containerHeight;

    return Math.min(1, totalAllocatedArea / totalAvailableArea);
  }

  /**
   * 生成完整的空間分配報告
   */
  public generateAllocationReport(
    elementTypes: UIElementType[],
    layout: 'horizontal' | 'vertical' | 'grid' = 'horizontal'
  ): AvailableSpaceResult {
    const space = this.calculateAvailableSpace();
    const allocations = this.allocateSpaceForElements(elementTypes, layout);
    const efficiency = this.calculateSpaceEfficiency(allocations);

    // 生成建議
    const recommendations: string[] = [];

    // 檢查空間利用率
    if (efficiency < 0.6) {
      recommendations.push('空間利用率較低，考慮調整元素大小或佈局');
    }

    // 檢查約束違規
    allocations.forEach(allocation => {
      if (!allocation.isOptimal && allocation.warnings.length > 0) {
        recommendations.push(`${allocation.elementType}: ${allocation.warnings[0]}`);
      }
    });

    // 檢查重疊
    const hasOverlap = this.checkForOverlaps(allocations);
    if (hasOverlap) {
      recommendations.push('檢測到元素重疊，請調整佈局');
    }

    return {
      totalWidth: this.containerWidth,
      totalHeight: this.containerHeight,
      usableWidth: space.usableWidth,
      usableHeight: space.usableHeight,
      safeArea: { ...this.safeArea },
      allocations,
      efficiency,
      recommendations
    };
  }

  /**
   * 檢查元素是否重疊
   */
  private checkForOverlaps(allocations: SpaceAllocationResult[]): boolean {
    for (let i = 0; i < allocations.length; i++) {
      for (let j = i + 1; j < allocations.length; j++) {
        const a = allocations[i];
        const b = allocations[j];

        const overlapX = a.x < b.x + b.allocatedWidth && a.x + a.allocatedWidth > b.x;
        const overlapY = a.y < b.y + b.allocatedHeight && a.y + a.allocatedHeight > b.y;

        if (overlapX && overlapY) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * 優化空間分配
   */
  public optimizeAllocation(
    elementTypes: UIElementType[],
    targetEfficiency: number = 0.8
  ): SpaceAllocationResult[] {
    // 簡單的優化算法：調整元素大小以達到目標利用率
    let allocations = this.allocateSpaceForElements(elementTypes, 'horizontal');
    let efficiency = this.calculateSpaceEfficiency(allocations);

    // 如果效率太低，嘗試調整元素大小
    if (efficiency < targetEfficiency) {
      const scaleFactor = Math.sqrt(targetEfficiency / efficiency);

      allocations = allocations.map(allocation => {
        const config = this.getElementConfig(allocation.elementType);

        return {
          ...allocation,
          allocatedWidth: this.applyWidthConstraints(
            Math.round(allocation.allocatedWidth * scaleFactor),
            config
          ),
          allocatedHeight: this.applyHeightConstraints(
            Math.round(allocation.allocatedHeight * scaleFactor),
            config
          )
        };
      });

      efficiency = this.calculateSpaceEfficiency(allocations);
    }

    return allocations;
  }

  /**
   * 靜態方法：創建適合裝置的空間計算器
   */
  static createForDevice(
    containerWidth: number,
    containerHeight: number,
    layoutMode: LayoutMode = 'desktop'
  ): AvailableSpaceCalculator {
    return new AvailableSpaceCalculator(containerWidth, containerHeight, layoutMode);
  }

  /**
   * 靜態方法：快速計算單個元素的空間
   */
  static calculateElementSpace(
    elementType: UIElementType,
    containerWidth: number,
    containerHeight: number,
    layoutMode: LayoutMode = 'desktop'
  ): SpaceAllocationResult {
    const calculator = new AvailableSpaceCalculator(containerWidth, containerHeight, layoutMode);
    return calculator.allocateSpaceForElement(elementType);
  }

  /**
   * 靜態方法：獲取建議的佈局配置
   */
  static getRecommendedLayout(
    deviceType: 'phone' | 'tablet' | 'desktop'
  ): {
    elementTypes: UIElementType[];
    layout: 'horizontal' | 'vertical' | 'grid';
    priorityOrder: UIElementType[];
  } {
    switch (deviceType) {
      case 'phone':
        return {
          elementTypes: ['canvas', 'cardArea', 'controls'],
          layout: 'vertical',
          priorityOrder: ['canvas', 'cardArea', 'controls']
        };
      case 'tablet':
        return {
          elementTypes: ['canvas', 'sidebar', 'cardArea'],
          layout: 'horizontal',
          priorityOrder: ['canvas', 'sidebar', 'cardArea']
        };
      case 'desktop':
        return {
          elementTypes: ['canvas', 'sidebar', 'cardArea', 'infoPanel'],
          layout: 'grid',
          priorityOrder: ['canvas', 'sidebar', 'cardArea', 'infoPanel']
        };
      default:
        return {
          elementTypes: ['canvas', 'sidebar', 'cardArea'],
          layout: 'horizontal',
          priorityOrder: ['canvas', 'sidebar', 'cardArea']
        };
    }
  }
}
