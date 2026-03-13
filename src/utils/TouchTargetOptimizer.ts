/**
 * 觸控目標優化器
 * 確保所有互動元素符合WCAG觸控目標標準
 * 提供自動調整和驗證功能
 */

import { LayoutMode } from './responsiveConfig';
import { TouchInteractionManager } from './TouchInteraction';

// 觸控目標類型
export type TouchTargetType = 'button' | 'link' | 'input' | 'card' | 'icon' | 'custom';

// 觸控目標配置
export interface TouchTargetConfig {
  type: TouchTargetType;
  minWidth: number;
  minHeight: number;
  minSpacing: number;
  padding: number;
  requiresVisualFeedback: boolean;
  feedbackDuration: number; // 視覺回饋持續時間（毫秒）
}

// 觸控目標狀態
export interface TouchTargetState {
  element: HTMLElement;
  originalWidth: number;
  originalHeight: number;
  originalPadding: string;
  originalMargin: string;
  isOptimized: boolean;
  hasVisualFeedback: boolean;
}

// 預設配置
const DEFAULT_CONFIGS: Record<TouchTargetType, TouchTargetConfig> = {
  button: {
    type: 'button',
    minWidth: 44,
    minHeight: 44,
    minSpacing: 8,
    padding: 12,
    requiresVisualFeedback: true,
    feedbackDuration: 200
  },
  link: {
    type: 'link',
    minWidth: 44,
    minHeight: 44,
    minSpacing: 8,
    padding: 8,
    requiresVisualFeedback: true,
    feedbackDuration: 150
  },
  input: {
    type: 'input',
    minWidth: 44,
    minHeight: 44,
    minSpacing: 8,
    padding: 8,
    requiresVisualFeedback: true,
    feedbackDuration: 100
  },
  card: {
    type: 'card',
    minWidth: 60,
    minHeight: 60,
    minSpacing: 12,
    padding: 16,
    requiresVisualFeedback: true,
    feedbackDuration: 250
  },
  icon: {
    type: 'icon',
    minWidth: 44,
    minHeight: 44,
    minSpacing: 8,
    padding: 8,
    requiresVisualFeedback: true,
    feedbackDuration: 150
  },
  custom: {
    type: 'custom',
    minWidth: 44,
    minHeight: 44,
    minSpacing: 8,
    padding: 8,
    requiresVisualFeedback: true,
    feedbackDuration: 200
  }
};

/**
 * 觸控目標優化器
 * 自動調整互動元素以符合觸控標準
 */
export class TouchTargetOptimizer {
  private layoutMode: LayoutMode;
  private optimizedElements: Map<HTMLElement, TouchTargetState>;
  private touchInteractionManager?: TouchInteractionManager;

  constructor(layoutMode: LayoutMode = 'desktop') {
    this.layoutMode = layoutMode;
    this.optimizedElements = new Map();
  }

  /**
   * 設置佈局模式
   */
  public setLayoutMode(layoutMode: LayoutMode): void {
    this.layoutMode = layoutMode;
    this.updateAllOptimizations();
  }

  /**
   * 設置觸控互動管理器
   */
  public setTouchInteractionManager(manager: TouchInteractionManager): void {
    this.touchInteractionManager = manager;
  }

  /**
   * 根據裝置類型獲取配置
   */
  private getConfigForDevice(type: TouchTargetType): TouchTargetConfig {
    const baseConfig = DEFAULT_CONFIGS[type];
    const deviceMultiplier = this.getDeviceMultiplier();

    return {
      ...baseConfig,
      minWidth: baseConfig.minWidth * deviceMultiplier,
      minHeight: baseConfig.minHeight * deviceMultiplier,
      minSpacing: baseConfig.minSpacing * deviceMultiplier,
      padding: baseConfig.padding * deviceMultiplier
    };
  }

  /**
   * 獲取裝置乘數
   */
  private getDeviceMultiplier(): number {
    switch (this.layoutMode) {
      case 'mobile':
        return 1.2; // 手機上觸控目標更大
      case 'tablet':
        return 1.1; // 平板上適中
      case 'desktop':
        return 1.0; // 桌面標準
      case 'wide':
        return 0.9; // 寬螢幕稍小
      case 'ultra-wide':
        return 0.8; // 超寬螢幕更小
      default:
        return 1.0;
    }
  }

  /**
   * 優化單個元素
   */
  public optimizeElement(
    element: HTMLElement,
    type: TouchTargetType = 'custom',
    customConfig?: Partial<TouchTargetConfig>
  ): TouchTargetState {
    // 如果已經優化過，先恢復原始狀態
    if (this.optimizedElements.has(element)) {
      this.restoreElement(element);
    }

    const config = { ...this.getConfigForDevice(type), ...customConfig };
    const computedStyle = window.getComputedStyle(element);

    // 保存原始狀態
    const originalState: TouchTargetState = {
      element,
      originalWidth: element.offsetWidth,
      originalHeight: element.offsetHeight,
      originalPadding: computedStyle.padding,
      originalMargin: computedStyle.margin,
      isOptimized: false,
      hasVisualFeedback: false
    };

    // 檢查是否需要優化
    const needsWidthOptimization = element.offsetWidth < config.minWidth;
    const needsHeightOptimization = element.offsetHeight < config.minHeight;

    if (needsWidthOptimization || needsHeightOptimization) {
      // 應用優化
      this.applyOptimization(element, config, needsWidthOptimization, needsHeightOptimization);

      // 添加視覺回饋
      if (config.requiresVisualFeedback) {
        this.addVisualFeedback(element, config);
        originalState.hasVisualFeedback = true;
      }

      originalState.isOptimized = true;
    }

    // 保存狀態
    this.optimizedElements.set(element, originalState);

    // 添加互動事件監聽器
    this.addInteractionListeners(element, config);

    return originalState;
  }

  /**
   * 應用優化
   */
  private applyOptimization(
    element: HTMLElement,
    config: TouchTargetConfig,
    needsWidth: boolean,
    needsHeight: boolean
  ): void {
    const style = element.style;

    // 保存原始樣式
    const originalMinWidth = style.minWidth;
    const originalMinHeight = style.minHeight;
    const originalPadding = style.padding;

    // 設置最小尺寸
    if (needsWidth) {
      style.minWidth = `${config.minWidth}px`;
    }

    if (needsHeight) {
      style.minHeight = `${config.minHeight}px`;
    }

    // 添加內邊距以增加觸控區域
    const currentPadding = parseFloat(window.getComputedStyle(element).padding);
    if (currentPadding < config.padding) {
      style.padding = `${config.padding}px`;
    }

    // 添加觸控目標類別
    element.classList.add('touch-target-optimized');
    element.classList.add(`touch-target-${config.type}`);

    // 設置資料屬性以便追蹤
    element.dataset.touchOptimized = 'true';
    element.dataset.touchType = config.type;

    // 保存原始值以便恢復
    element.dataset.originalMinWidth = originalMinWidth;
    element.dataset.originalMinHeight = originalMinHeight;
    element.dataset.originalPadding = originalPadding;
  }

  /**
   * 添加視覺回饋
   */
  private addVisualFeedback(element: HTMLElement, config: TouchTargetConfig): void {
    // 添加CSS類別
    element.classList.add('touch-feedback-enabled');

    // 添加互動樣式
    const style = document.createElement('style');
    style.id = `touch-feedback-${Date.now()}`;
    style.textContent = `
      .touch-feedback-enabled {
        transition: all ${config.feedbackDuration}ms ease;
      }
      .touch-feedback-enabled:active {
        transform: scale(0.95);
        opacity: 0.8;
      }
      .touch-feedback-enabled:hover {
        opacity: 0.9;
      }
    `;

    document.head.appendChild(style);

    // 保存樣式參考
    element.dataset.feedbackStyleId = style.id;
  }

  /**
   * 添加互動事件監聽器
   */
  private addInteractionListeners(element: HTMLElement, config: TouchTargetConfig): void {
    // 使用觸控互動管理器（如果可用）
    if (this.touchInteractionManager) {
      this.touchInteractionManager.on('tap', (event) => {
        if (event.target === element) {
          this.handleTapFeedback(element, config);
        }
      });
    } else {
      // 回退到標準事件監聽器
      element.addEventListener('mousedown', () => this.handleTapFeedback(element, config));
      element.addEventListener('touchstart', () => this.handleTapFeedback(element, config));
    }

    // 添加懸停效果
    element.addEventListener('mouseenter', () => {
      element.classList.add('touch-hover');
    });

    element.addEventListener('mouseleave', () => {
      element.classList.remove('touch-hover');
    });
  }

  /**
   * 處理點擊回饋
   */
  private handleTapFeedback(element: HTMLElement, config: TouchTargetConfig): void {
    if (!config.requiresVisualFeedback) return;

    // 添加點擊類別
    element.classList.add('touch-active');

    // 定時移除
    setTimeout(() => {
      element.classList.remove('touch-active');
    }, config.feedbackDuration);
  }

  /**
   * 恢復元素到原始狀態
   */
  public restoreElement(element: HTMLElement): boolean {
    const state = this.optimizedElements.get(element);
    if (!state) return false;

    const style = element.style;

    // 恢復尺寸
    if (element.dataset.originalMinWidth !== undefined) {
      style.minWidth = element.dataset.originalMinWidth;
      delete element.dataset.originalMinWidth;
    }

    if (element.dataset.originalMinHeight !== undefined) {
      style.minHeight = element.dataset.originalMinHeight;
      delete element.dataset.originalMinHeight;
    }

    // 恢復內邊距
    if (element.dataset.originalPadding !== undefined) {
      style.padding = element.dataset.originalPadding;
      delete element.dataset.originalPadding;
    }

    // 移除類別
    element.classList.remove('touch-target-optimized');
    element.classList.remove(`touch-target-${state.hasVisualFeedback ? 'with-feedback' : 'no-feedback'}`);
    element.classList.remove('touch-feedback-enabled');
    element.classList.remove('touch-hover');
    element.classList.remove('touch-active');

    // 移除資料屬性
    delete element.dataset.touchOptimized;
    delete element.dataset.touchType;

    // 移除動態樣式
    if (element.dataset.feedbackStyleId) {
      const styleElement = document.getElementById(element.dataset.feedbackStyleId);
      if (styleElement) {
        styleElement.remove();
      }
      delete element.dataset.feedbackStyleId;
    }

    // 從映射中移除
    this.optimizedElements.delete(element);

    return true;
  }

  /**
   * 更新所有優化
   */
  private updateAllOptimizations(): void {
    for (const [element, state] of this.optimizedElements.entries()) {
      // 先恢復
      this.restoreElement(element);

      // 重新優化（使用原始類型）
      const type = element.dataset.touchType as TouchTargetType || 'custom';
      this.optimizeElement(element, type);
    }
  }

  /**
   * 批量優化元素
   */
  public optimizeElements(
    elements: HTMLElement[],
    type: TouchTargetType = 'custom',
    customConfig?: Partial<TouchTargetConfig>
  ): TouchTargetState[] {
    return elements.map(element =>
      this.optimizeElement(element, type, customConfig)
    );
  }

  /**
   * 優化選擇器匹配的所有元素
   */
  public optimizeBySelector(
    selector: string,
    type: TouchTargetType = 'custom',
    customConfig?: Partial<TouchTargetConfig>
  ): TouchTargetState[] {
    const elements = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
    return this.optimizeElements(elements, type, customConfig);
  }

  /**
   * 驗證元素是否符合觸控標準
   */
  public validateElement(element: HTMLElement, type: TouchTargetType = 'custom'): {
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const config = this.getConfigForDevice(type);
    const issues: string[] = [];
    const recommendations: string[] = [];

    // 檢查寬度
    if (element.offsetWidth < config.minWidth) {
      issues.push(`寬度不足：${element.offsetWidth}px < ${config.minWidth}px`);
      recommendations.push(`增加寬度至至少 ${config.minWidth}px`);
    }

    // 檢查高度
    if (element.offsetHeight < config.minHeight) {
      issues.push(`高度不足：${element.offsetHeight}px < ${config.minHeight}px`);
      recommendations.push(`增加高度至至少 ${config.minHeight}px`);
    }

    // 檢查間距
    const computedStyle = window.getComputedStyle(element);
    const margin = parseFloat(computedStyle.margin);
    if (margin < config.minSpacing) {
      issues.push(`間距不足：${margin}px < ${config.minSpacing}px`);
      recommendations.push(`增加外邊距至至少 ${config.minSpacing}px`);
    }

    // 檢查視覺回饋
    if (config.requiresVisualFeedback) {
      const hasTransition = computedStyle.transition !== 'none';
      const hasActiveState = element.style.transform.includes('scale') ||
                            element.style.opacity !== '';

      if (!hasTransition && !hasActiveState) {
        issues.push('缺少視覺回饋');
        recommendations.push('添加點擊狀態的視覺回饋（縮放、透明度變化等）');
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations
    };
  }

  /**
   * 生成觸控目標報告
   */
  public generateReport(): {
    totalElements: number;
    optimizedElements: number;
    validationResults: Array<{
      element: HTMLElement;
      type: TouchTargetType;
      isValid: boolean;
      issues: string[];
    }>;
  } {
    const validationResults: Array<{
      element: HTMLElement;
      type: TouchTargetType;
      isValid: boolean;
      issues: string[];
    }> = [];

    for (const [element, state] of this.optimizedElements.entries()) {
      const type = element.dataset.touchType as TouchTargetType || 'custom';
      const validation = this.validateElement(element, type);

      validationResults.push({
        element,
        type,
        isValid: validation.isValid,
        issues: validation.issues
      });
    }

    return {
      totalElements: this.optimizedElements.size,
      optimizedElements: Array.from(this.optimizedElements.values())
        .filter(state => state.isOptimized).length,
      validationResults
    };
  }

  /**
   * 銷毀優化器
   */
  public destroy(): void {
    // 恢復所有元素
    for (const [element] of this.optimizedElements.entries()) {
      this.restoreElement(element);
    }

    this.optimizedElements.clear();
  }

  /**
   * 靜態方法：創建適合裝置的觸控目標配置
   */
  static createConfigForDevice(
    type: TouchTargetType,
    layoutMode: LayoutMode
  ): TouchTargetConfig {
    const optimizer = new TouchTargetOptimizer(layoutMode);
    return optimizer.getConfigForDevice(type);
  }

  /**
   * 靜態方法：快速優化頁面上的所有互動元素
   */
  static optimizePage(layoutMode: LayoutMode = 'desktop'): TouchTargetOptimizer {
    const optimizer = new TouchTargetOptimizer(layoutMode);

    // 優化常見的互動元素
    optimizer.optimizeBySelector('button', 'button');
    optimizer.optimizeBySelector('a[href]', 'link');
    optimizer.optimizeBySelector('input, textarea, select', 'input');
    optimizer.optimizeBySelector('[role="button"]', 'button');
    optimizer.optimizeBySelector('[data-touch-target]', 'custom');

    return optimizer;
  }
}
