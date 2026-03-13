/**
 * 性能優化器
 * 提供響應式系統的性能優化工具和建議
 * 包括渲染優化、記憶體管理和效能監控
 */

import { LayoutMode } from './responsiveConfig';

// 性能指標
export interface PerformanceMetrics {
  fps: number; // 幀率
  memoryUsage: number; // 記憶體使用量（MB）
  renderTime: number; // 渲染時間（毫秒）
  layoutTime: number; // 佈局計算時間（毫秒）
  touchResponseTime: number; // 觸控回應時間（毫秒）
  resizeHandlingTime: number; // 大小變化處理時間（毫秒）
}

// 性能優化配置
export interface PerformanceConfig {
  enableThrottling: boolean; // 啟用節流
  enableDebouncing: boolean; // 啟用防抖
  enableLazyLoading: boolean; // 啟用懶加載
  enableMemoryOptimization: boolean; // 啟用記憶體優化
  enableRenderOptimization: boolean; // 啟用渲染優化
  maxFPS: number; // 最大幀率限制
  memoryThreshold: number; // 記憶體閾值（MB）
  renderThreshold: number; // 渲染時間閾值（毫秒）
}

// 性能優化建議
export interface PerformanceRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  impact: 'low' | 'medium' | 'high';
  implementation: string;
  estimatedImprovement: string;
}

// 預設配置
const DEFAULT_CONFIG: PerformanceConfig = {
  enableThrottling: true,
  enableDebouncing: true,
  enableLazyLoading: true,
  enableMemoryOptimization: true,
  enableRenderOptimization: true,
  maxFPS: 60,
  memoryThreshold: 100, // 100MB
  renderThreshold: 16 // 60fps對應的16.67ms
};

/**
 * 性能優化器
 * 提供響應式系統的性能優化工具和建議
 */
export class PerformanceOptimizer {
  private config: PerformanceConfig;
  private metrics: PerformanceMetrics;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private frameCount: number = 0;
  private lastFrameTime: number = 0;
  private lastMemoryCheck: number = 0;
  private recommendations: PerformanceRecommendation[] = [];

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.metrics = this.createInitialMetrics();

    this.initializeMonitoring();
    this.generateRecommendations();
  }

  /**
   * 創建初始性能指標
   */
  private createInitialMetrics(): PerformanceMetrics {
    return {
      fps: 60,
      memoryUsage: 0,
      renderTime: 0,
      layoutTime: 0,
      touchResponseTime: 0,
      resizeHandlingTime: 0
    };
  }

  /**
   * 初始化性能監控
   */
  private initializeMonitoring(): void {
    if (typeof window === 'undefined') return;

    // 監控幀率
    this.startFPSCounter();

    // 監控記憶體使用
    this.startMemoryMonitoring();

    // 監控渲染性能
    this.startRenderMonitoring();
  }

  /**
   * 開始幀率計數
   */
  private startFPSCounter(): void {
    let lastTime = performance.now();
    let frames = 0;

    const countFPS = () => {
      const currentTime = performance.now();
      frames++;

      if (currentTime >= lastTime + 1000) {
        this.metrics.fps = Math.round((frames * 1000) / (currentTime - lastTime));
        frames = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(countFPS);
    };

    requestAnimationFrame(countFPS);
  }

  /**
   * 開始記憶體監控
   */
  private startMemoryMonitoring(): void {
    // performance.memory 是Chrome特有的API，需要檢查是否存在
    const hasMemoryAPI = typeof performance !== 'undefined' &&
                        (performance as any).memory !== undefined;

    if (!hasMemoryAPI) return;

    const checkMemory = () => {
      const now = Date.now();

      // 每5秒檢查一次記憶體
      if (now - this.lastMemoryCheck >= 5000) {
        const memory = (performance as any).memory;
        this.metrics.memoryUsage = Math.round(memory.usedJSHeapSize / (1024 * 1024));
        this.lastMemoryCheck = now;

        // 檢查記憶體閾值
        if (this.metrics.memoryUsage > this.config.memoryThreshold) {
          this.addMemoryOptimizationRecommendation();
        }
      }

      setTimeout(checkMemory, 1000);
    };

    checkMemory();
  }

  /**
   * 開始渲染監控
   */
  private startRenderMonitoring(): void {
    // 使用PerformanceObserver監聽渲染性能
    if (typeof PerformanceObserver !== 'undefined') {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.entryType === 'measure') {
              this.handlePerformanceMeasure(entry);
            }
          });
        });

        observer.observe({ entryTypes: ['measure'] });
      } catch (error) {
        console.warn('Performance monitoring not supported:', error);
      }
    }
  }

  /**
   * 處理性能測量
   */
  private handlePerformanceMeasure(entry: PerformanceEntry): void {
    const duration = entry.duration;

    if (entry.name.includes('render')) {
      this.metrics.renderTime = duration;

      if (duration > this.config.renderThreshold) {
        this.addRenderOptimizationRecommendation(duration);
      }
    } else if (entry.name.includes('layout')) {
      this.metrics.layoutTime = duration;
    } else if (entry.name.includes('touch')) {
      this.metrics.touchResponseTime = duration;
    } else if (entry.name.includes('resize')) {
      this.metrics.resizeHandlingTime = duration;
    }
  }

  /**
   * 添加記憶體優化建議
   */
  private addMemoryOptimizationRecommendation(): void {
    const existing = this.recommendations.find(r => r.id === 'memory-optimization');

    if (!existing) {
      this.recommendations.push({
        id: 'memory-optimization',
        title: '記憶體使用過高',
        description: `當前記憶體使用量為 ${this.metrics.memoryUsage}MB，超過建議閾值 ${this.config.memoryThreshold}MB。`,
        priority: 'high',
        impact: 'high',
        implementation: '考慮實施以下優化：\n1. 使用懶加載載入資源\n2. 及時釋放不再使用的物件\n3. 使用物件池重用物件\n4. 減少DOM節點數量',
        estimatedImprovement: '可減少20-50%的記憶體使用'
      });
    }
  }

  /**
   * 添加渲染優化建議
   */
  private addRenderOptimizationRecommendation(renderTime: number): void {
    const existing = this.recommendations.find(r => r.id === 'render-optimization');

    if (!existing) {
      this.recommendations.push({
        id: 'render-optimization',
        title: '渲染時間過長',
        description: `當前渲染時間為 ${renderTime.toFixed(2)}ms，超過建議閾值 ${this.config.renderThreshold}ms。`,
        priority: 'medium',
        impact: 'medium',
        implementation: '考慮實施以下優化：\n1. 使用CSS硬體加速\n2. 減少重繪和回流\n3. 使用虛擬滾動\n4. 優化圖片和媒體資源',
        estimatedImprovement: '可減少30-60%的渲染時間'
      });
    }
  }

  /**
   * 生成性能優化建議
   */
  private generateRecommendations(): void {
    // 基礎建議
    const baseRecommendations: PerformanceRecommendation[] = [
      {
        id: 'throttle-resize',
        title: '節流視窗大小變化事件',
        description: '視窗大小變化事件可能觸發頻繁，影響性能。',
        priority: 'high',
        impact: 'high',
        implementation: '使用節流函數限制resize事件的處理頻率。',
        estimatedImprovement: '可減少80%的佈局計算'
      },
      {
        id: 'optimize-touch-targets',
        title: '優化觸控目標',
        description: '觸控目標過小或過多可能影響觸控性能。',
        priority: 'medium',
        impact: 'medium',
        implementation: '確保觸控目標最小為44×44像素，合併相近的觸控區域。',
        estimatedImprovement: '可提高20%的觸控準確性'
      },
      {
        id: 'lazy-load-components',
        title: '懶加載非關鍵組件',
        description: '一次性載入所有組件可能導致初始載入緩慢。',
        priority: 'medium',
        impact: 'medium',
        implementation: '使用React.lazy()和Suspense懶加載非關鍵組件。',
        estimatedImprovement: '可減少30%的初始載入時間'
      },
      {
        id: 'optimize-images',
        title: '優化圖片資源',
        description: '未優化的圖片可能佔用大量頻寬和記憶體。',
        priority: 'low',
        impact: 'high',
        implementation: '使用適當的圖片格式、壓縮和響應式圖片。',
        estimatedImprovement: '可減少50-80%的圖片載入時間'
      },
      {
        id: 'reduce-dom-nodes',
        title: '減少DOM節點數量',
        description: '過多的DOM節點可能影響渲染性能。',
        priority: 'medium',
        impact: 'medium',
        implementation: '合併相似的DOM元素，使用CSS代替多個元素。',
        estimatedImprovement: '可提高10-30%的渲染性能'
      }
    ];

    this.recommendations.push(...baseRecommendations);
  }

  /**
   * 獲取性能指標
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * 獲取性能優化建議
   */
  public getRecommendations(): PerformanceRecommendation[] {
    return [...this.recommendations];
  }

  /**
   * 獲取針對特定裝置的優化建議
   */
  public getDeviceSpecificRecommendations(layoutMode: LayoutMode): PerformanceRecommendation[] {
    const deviceRecommendations: PerformanceRecommendation[] = [];

    switch (layoutMode) {
      case 'mobile':
        deviceRecommendations.push({
          id: 'mobile-render-optimization',
          title: '行動裝置渲染優化',
          description: '行動裝置的GPU和CPU性能有限，需要特別優化。',
          priority: 'high',
          impact: 'high',
          implementation: '1. 減少陰影和模糊效果\n2. 使用較小的圖片解析度\n3. 限制動畫複雜度\n4. 使用CSS transform代替top/left',
          estimatedImprovement: '可提高50%的行動裝置性能'
        });
        break;

      case 'tablet':
        deviceRecommendations.push({
          id: 'tablet-battery-optimization',
          title: '平板裝置電池優化',
          description: '平板裝置對電池使用敏感，需要優化功耗。',
          priority: 'medium',
          impact: 'medium',
          implementation: '1. 減少不必要的動畫\n2. 使用requestAnimationFrame代替setInterval\n3. 在背景時暫停非關鍵任務',
          estimatedImprovement: '可減少20%的電池消耗'
        });
        break;

      case 'desktop':
      case 'wide':
      case 'ultra-wide':
        deviceRecommendations.push({
          id: 'desktop-memory-optimization',
          title: '桌面裝置記憶體優化',
          description: '桌面裝置通常有更多記憶體，但仍需優化管理。',
          priority: 'low',
          impact: 'low',
          implementation: '1. 使用Web Workers處理計算密集型任務\n2. 實施記憶體快取\n3. 使用IndexedDB儲存大量數據',
          estimatedImprovement: '可提高整體應用穩定性'
        });
        break;
    }

    return [...this.recommendations, ...deviceRecommendations];
  }

  /**
   * 應用性能優化
   */
  public applyOptimizations(): void {
    if (this.config.enableThrottling) {
      this.applyThrottling();
    }

    if (this.config.enableDebouncing) {
      this.applyDebouncing();
    }

    if (this.config.enableLazyLoading) {
      this.applyLazyLoading();
    }

    if (this.config.enableMemoryOptimization) {
      this.applyMemoryOptimization();
    }

    if (this.config.enableRenderOptimization) {
      this.applyRenderOptimization();
    }
  }

  /**
   * 應用節流優化
   */
  private applyThrottling(): void {
    // 節流resize事件
    const throttle = (func: Function, limit: number) => {
      let inThrottle: boolean;
      return function(this: any) {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    };

    // 應用節流到resize事件
    const handleResize = () => {
      performance.mark('resize-start');
      // 處理resize邏輯
      performance.mark('resize-end');
      performance.measure('resize-handling', 'resize-start', 'resize-end');
    };

    window.addEventListener('resize', throttle(handleResize, 100));
  }

  /**
   * 應用防抖優化
   */
  private applyDebouncing(): void {
    // 防抖scroll事件
    const debounce = (func: Function, wait: number) => {
      let timeout: NodeJS.Timeout;
      return function(this: any) {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
      };
    };

    // 應用防抖到scroll事件
    const handleScroll = () => {
      // 處理scroll邏輯
    };

    window.addEventListener('scroll', debounce(handleScroll, 50));
  }

  /**
   * 應用懶加載
   */
  private applyLazyLoading(): void {
    // 懶加載圖片
    const lazyLoadImages = () => {
      const images = document.querySelectorAll('img[data-src]');

      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src || '';
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
    };

    // 初始執行
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', lazyLoadImages);
    } else {
      lazyLoadImages();
    }
  }

  /**
   * 應用記憶體優化
   */
  private applyMemoryOptimization(): void {
    // 監聽頁面可見性變化，在背景時釋放資源
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // 頁面不可見時，釋放非關鍵資源
        this.releaseNonCriticalResources();
      }
    });

    // 定期清理未使用的資源
    setInterval(() => {
      this.cleanupUnusedResources();
    }, 30000); // 每30秒清理一次
  }

  /**
   * 釋放非關鍵資源
   */
  private releaseNonCriticalResources(): void {
    // 暫停非關鍵動畫
    // 釋放非可見區域的資源
    // 減少定時器頻率
  }

  /**
   * 清理未使用的資源
   */
  private cleanupUnusedResources(): void {
    // 清理未使用的快取
    // 釋放未引用的物件
    // 清理臨時數據
  }

  /**
   * 應用渲染優化
   */
  private applyRenderOptimization(): void {
    // 使用CSS硬體加速
    const optimizeCSS = () => {
      const style = document.createElement('style');
      style.textContent = `
        .render-optimized {
          transform: translateZ(0);
          backface-visibility: hidden;
          perspective: 1000px;
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `;
      document.head.appendChild(style);
    };

    optimizeCSS();
  }

  /**
   * 生成性能報告
   */
  public generateReport(): {
    metrics: PerformanceMetrics;
    recommendations: PerformanceRecommendation[];
    score: number; // 性能分數 0-100
    status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  } {
    // 計算性能分數
    let score = 100;

    // 根據幀率扣分
    if (this.metrics.fps < 30) score -= 30;
    else if (this.metrics.fps < 45) score -= 15;
    else if (this.metrics.fps < 55) score -= 5;

    // 根據記憶體使用扣分
    if (this.metrics.memoryUsage > 200) score -= 30;
    else if (this.metrics.memoryUsage > 150) score -= 20;
    else if (this.metrics.memoryUsage > 100) score -= 10;

    // 根據渲染時間扣分
    if (this.metrics.renderTime > 50) score -= 20;
    else if (this.metrics.renderTime > 30) score -= 10;
    else if (this.metrics.renderTime > 16) score -= 5;

    // 確定狀態
    let status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    if (score >= 90) status = 'excellent';
    else if (score >= 75) status = 'good';
    else if (score >= 60) status = 'fair';
    else if (score >= 40) status = 'poor';
    else status = 'critical';

    return {
      metrics: { ...this.metrics },
      recommendations: [...this.recommendations],
      score,
      status
    };
  }

  /**
   * 檢查性能閾值
   */
  public checkThresholds(): {
    fps: { value: number; threshold: number; passed: boolean };
    memory: { value: number; threshold: number; passed: boolean };
    render: { value: number; threshold: number; passed: boolean };
  } {
    return {
      fps: {
        value: this.metrics.fps,
        threshold: 30, // 最低可接受的幀率
        passed: this.metrics.fps >= 30
      },
      memory: {
        value: this.metrics.memoryUsage,
        threshold: this.config.memoryThreshold,
        passed: this.metrics.memoryUsage <= this.config.memoryThreshold
      },
      render: {
        value: this.metrics.renderTime,
        threshold: this.config.renderThreshold,
        passed: this.metrics.renderTime <= this.config.renderThreshold
      }
    };
  }

  /**
   * 獲取性能優化提示
   */
  public getPerformanceTips(layoutMode: LayoutMode): string[] {
    const tips: string[] = [];

    // 通用提示
    tips.push('使用CSS硬體加速提高渲染性能');
    tips.push('壓縮圖片和媒體資源以減少載入時間');
    tips.push('使用適當的圖片格式（WebP、AVIF）');

    // 裝置特定提示
    switch (layoutMode) {
      case 'mobile':
        tips.push('行動裝置上減少陰影和模糊效果');
        tips.push('使用較小的圖片解析度以節省頻寬');
        tips.push('限制動畫複雜度以節省電池');
        break;
      case 'tablet':
        tips.push('平板裝置上優化觸控目標大小');
        tips.push('使用響應式圖片適應不同方向');
        tips.push('考慮平板的多任務處理特性');
        break;
      case 'desktop':
      case 'wide':
      case 'ultra-wide':
        tips.push('桌面裝置上可以使用更高解析度的資源');
        tips.push('利用更大的螢幕空間優化佈局');
        tips.push('考慮多視窗和多任務場景');
        break;
    }

    // 根據當前性能指標添加特定提示
    if (this.metrics.fps < 45) {
      tips.push('當前幀率較低，考慮減少動畫數量或複雜度');
    }

    if (this.metrics.memoryUsage > this.config.memoryThreshold) {
      tips.push('記憶體使用較高，考慮實施懶加載和資源釋放');
    }

    if (this.metrics.renderTime > this.config.renderThreshold) {
      tips.push('渲染時間較長，考慮優化DOM結構和CSS');
    }

    return tips;
  }

  /**
   * 銷毀性能優化器
   */
  public destroy(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    // 清理性能標記
    performance.clearMarks();
    performance.clearMeasures();
  }

  /**
   * 靜態方法：快速檢查性能
   */
  static quickCheck(): {
    isPerformanceGood: boolean;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // 檢查幀率
    let isPerformanceGood = true;

    // 檢查記憶體API是否可用（Chrome特有）
    const hasMemoryAPI = typeof performance !== 'undefined' &&
                        (performance as any).memory !== undefined;

    if (hasMemoryAPI) {
      const memory = (performance as any).memory;
      const usedMB = Math.round(memory.usedJSHeapSize / (1024 * 1024));

      if (usedMB > 100) {
        issues.push(`記憶體使用較高: ${usedMB}MB`);
        suggestions.push('考慮實施記憶體優化策略');
        isPerformanceGood = false;
      }
    }

    // 檢查是否支援硬體加速
    const testElement = document.createElement('div');
    testElement.style.cssText = 'transform: translateZ(0);';
    const hasHardwareAcceleration = !!(testElement.style.transform);

    if (!hasHardwareAcceleration) {
      issues.push('可能不支援CSS硬體加速');
      suggestions.push('使用兼容性更好的動畫技術');
    }

    // 檢查觸控支援
    const hasTouchSupport = 'ontouchstart' in window ||
                           navigator.maxTouchPoints > 0;

    if (hasTouchSupport) {
      suggestions.push('檢測到觸控裝置，請確保觸控目標足夠大');
    }

    return {
      isPerformanceGood,
      issues,
      suggestions
    };
  }

  /**
   * 靜態方法：獲取性能基準
   */
  static getPerformanceBenchmarks(): Record<string, {
    mobile: number;
    tablet: number;
    desktop: number;
    description: string;
  }> {
    return {
      fps: {
        mobile: 30,
        tablet: 45,
        desktop: 60,
        description: '幀率（幀/秒）'
      },
      memory: {
        mobile: 50,
        tablet: 75,
        desktop: 100,
        description: '記憶體使用（MB）'
      },
      renderTime: {
        mobile: 33, // 對應30fps
        tablet: 22, // 對應45fps
        desktop: 16, // 對應60fps
        description: '渲染時間（毫秒）'
      },
      loadTime: {
        mobile: 3000,
        tablet: 2000,
        desktop: 1000,
        description: '載入時間（毫秒）'
      }
    };
  }
}
