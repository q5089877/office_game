/**
 * 響應式系統測試檔案
 * 測試響應式系統的各個組件和功能
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, afterAll, vi } from 'vitest';

// 導入要測試的組件
import { ResponsiveLayout } from '../components/Layout/ResponsiveLayout';
import { ResponsiveText } from '../components/shared/ResponsiveText';
import { GameResponsiveDemo } from '../components/Layout/GameResponsiveDemo';

// 導入工具函數
import {
  isTouchDevice,
  getCurrentLayoutMode,
  getDeviceType,
  calculateResponsiveFontSize
} from '../utils/responsive';

// 模擬視窗大小
const mockWindowSize = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width
  });

  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height
  });

  // 觸發resize事件
  window.dispatchEvent(new Event('resize'));
};

// 模擬觸控裝置
const mockTouchDevice = (isTouch: boolean) => {
  Object.defineProperty(window, 'ontouchstart', {
    writable: true,
    configurable: true,
    value: isTouch ? {} : undefined
  });

  Object.defineProperty(navigator, 'maxTouchPoints', {
    writable: true,
    configurable: true,
    value: isTouch ? 10 : 0
  });
};

describe('響應式系統工具函數', () => {
  beforeEach(() => {
    // 重置模擬
    mockWindowSize(1024, 768);
    mockTouchDevice(false);
  });

  afterEach(() => {
    // 清理
    jest.restoreAllMocks();
  });

  it('應該正確檢測觸控裝置', () => {
    // 測試非觸控裝置
    mockTouchDevice(false);
    expect(isTouchDevice()).toBe(false);

    // 測試觸控裝置
    mockTouchDevice(true);
    expect(isTouchDevice()).toBe(true);
  });

  it('應該根據視窗寬度返回正確的佈局模式', () => {
    // 測試手機模式
    mockWindowSize(320, 568);
    expect(getCurrentLayoutMode()).toBe('mobile');

    // 測試平板模式
    mockWindowSize(768, 1024);
    expect(getCurrentLayoutMode()).toBe('tablet');

    // 測試桌面模式
    mockWindowSize(1024, 768);
    expect(getCurrentLayoutMode()).toBe('desktop');

    // 測試寬螢幕模式
    mockWindowSize(1280, 720);
    expect(getCurrentLayoutMode()).toBe('wide');

    // 測試超寬螢幕模式
    mockWindowSize(1920, 1080);
    expect(getCurrentLayoutMode()).toBe('ultra-wide');
  });

  it('應該計算正確的響應式文字大小', () => {
    const baseSize = 16;

    // 測試不同佈局模式下的文字大小
    expect(calculateResponsiveFontSize(baseSize, 'mobile')).toBeCloseTo(14); // 16 * 0.85 = 13.6 ≈ 14
    expect(calculateResponsiveFontSize(baseSize, 'tablet')).toBeCloseTo(15); // 16 * 0.95 = 15.2 ≈ 15
    expect(calculateResponsiveFontSize(baseSize, 'desktop')).toBe(16); // 16 * 1.0 = 16
    expect(calculateResponsiveFontSize(baseSize, 'wide')).toBeCloseTo(17); // 16 * 1.05 = 16.8 ≈ 17
    expect(calculateResponsiveFontSize(baseSize, 'ultra-wide')).toBeCloseTo(18); // 16 * 1.1 = 17.6 ≈ 18
  });
});

describe('ResponsiveText 組件', () => {
  it('應該正確渲染文字內容', () => {
    render(
      <ResponsiveText type="body" testId="test-text">
        測試文字內容
      </ResponsiveText>
    );

    const textElement = screen.getByTestId('test-text');
    expect(textElement).toBeInTheDocument();
    expect(textElement).toHaveTextContent('測試文字內容');
  });

  it('應該應用正確的文字類型樣式', () => {
    render(
      <ResponsiveText type="heading1" testId="heading-text">
        標題文字
      </ResponsiveText>
    );

    const headingElement = screen.getByTestId('heading-text');
    expect(headingElement).toHaveClass('text-type-heading1');
  });

  it('應該響應點擊事件', () => {
    const handleClick = vi.fn();

    render(
      <ResponsiveText
        type="body"
        onClick={handleClick}
        testId="clickable-text"
      >
        可點擊文字
      </ResponsiveText>
    );

    const textElement = screen.getByTestId('clickable-text');
    fireEvent.click(textElement);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('應該在互動時添加正確的類別', () => {
    render(
      <ResponsiveText
        type="body"
        onClick={() => {}}
        testId="interactive-text"
      >
        互動文字
      </ResponsiveText>
    );

    const textElement = screen.getByTestId('interactive-text');
    expect(textElement).toHaveClass('interactive-text');
  });
});

describe('ResponsiveLayout 組件', () => {
  it('應該正確渲染子組件', () => {
    render(
      <ResponsiveLayout testId="test-layout">
        <div data-testid="child-1">子組件 1</div>
        <div data-testid="child-2">子組件 2</div>
      </ResponsiveLayout>
    );

    const layoutElement = screen.getByTestId('test-layout');
    expect(layoutElement).toBeInTheDocument();

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });

  it('應該應用正確的佈局模式類別', () => {
    mockWindowSize(768, 1024); // 平板尺寸

    render(
      <ResponsiveLayout testId="tablet-layout">
        內容
      </ResponsiveLayout>
    );

    const layoutElement = screen.getByTestId('tablet-layout');
    expect(layoutElement).toHaveAttribute('data-layout-mode', 'tablet');
  });

  it('應該處理自定義配置', () => {
    const customConfig = {
      baseWidth: 800,
      baseHeight: 600,
      enableTouchOptimization: false
    };

    render(
      <ResponsiveLayout
        config={customConfig}
        testId="custom-layout"
      >
        自定義配置內容
      </ResponsiveLayout>
    );

    const layoutElement = screen.getByTestId('custom-layout');
    expect(layoutElement).toBeInTheDocument();
  });
});

describe('GameResponsiveDemo 組件', () => {
  it('應該正確渲染演示組件', () => {
    render(
      <GameResponsiveDemo
        showDebugInfo={true}
        enableTouchDemo={true}
        enableLayoutDemo={true}
        enableTextDemo={true}
        testId="game-demo"
      />
    );

    const demoElement = screen.getByTestId('game-demo');
    expect(demoElement).toBeInTheDocument();
  });

  it('應該根據配置顯示或隱藏調試資訊', () => {
    // 測試顯示調試資訊
    const { rerender } = render(
      <GameResponsiveDemo
        showDebugInfo={true}
        testId="demo-with-debug"
      />
    );

    expect(screen.getByText('響應式系統調試')).toBeInTheDocument();

    // 測試隱藏調試資訊
    rerender(
      <GameResponsiveDemo
        showDebugInfo={false}
        testId="demo-without-debug"
      />
    );

    expect(screen.queryByText('響應式系統調試')).not.toBeInTheDocument();
  });

  it('應該處理佈局模式切換', async () => {
    render(
      <GameResponsiveDemo
        showDebugInfo={true}
        testId="demo-layout-switch"
      />
    );

    // 查找佈局模式選擇器按鈕
    const mobileButton = screen.getByText('mobile');
    const desktopButton = screen.getByText('desktop');

    // 初始應該是桌面模式（預設）
    expect(screen.getByTestId('demo-layout-switch')).toHaveAttribute('data-layout-mode', 'desktop');

    // 點擊手機模式按鈕
    fireEvent.click(mobileButton);

    // 等待並檢查佈局模式是否改變
    await waitFor(() => {
      expect(screen.getByTestId('demo-layout-switch')).toHaveAttribute('data-layout-mode', 'mobile');
    });

    // 點擊桌面模式按鈕
    fireEvent.click(desktopButton);

    await waitFor(() => {
      expect(screen.getByTestId('demo-layout-switch')).toHaveAttribute('data-layout-mode', 'desktop');
    });
  });
});

describe('跨裝置兼容性測試', () => {
  const testCases = [
    { name: '手機縱向', width: 375, height: 667, expectedMode: 'mobile' },
    { name: '手機橫向', width: 667, height: 375, expectedMode: 'mobile' },
    { name: '平板縱向', width: 768, height: 1024, expectedMode: 'tablet' },
    { name: '平板橫向', width: 1024, height: 768, expectedMode: 'tablet' },
    { name: '桌面標準', width: 1024, height: 768, expectedMode: 'desktop' },
    { name: '寬螢幕', width: 1366, height: 768, expectedMode: 'wide' },
    { name: '超寬螢幕', width: 1920, height: 1080, expectedMode: 'ultra-wide' },
    { name: '4K螢幕', width: 3840, height: 2160, expectedMode: 'ultra-wide' }
  ];

  testCases.forEach(({ name, width, height, expectedMode }) => {
    it(`應該在${name} (${width}x${height}) 上使用 ${expectedMode} 模式`, () => {
      mockWindowSize(width, height);

      render(
        <ResponsiveLayout testId={`layout-${name.replace(/\s+/g, '-')}`}>
          測試內容
        </ResponsiveLayout>
      );

      const layoutElement = screen.getByTestId(`layout-${name.replace(/\s+/g, '-')}`);
      expect(layoutElement).toHaveAttribute('data-layout-mode', expectedMode);
    });
  });
});

describe('性能測試', () => {
  it('應該高效處理視窗大小變化', async () => {
    const { container } = render(
      <ResponsiveLayout testId="performance-layout">
        <div>性能測試內容</div>
      </ResponsiveLayout>
    );

    const startTime = performance.now();

    // 模擬多次視窗大小變化
    for (let i = 0; i < 10; i++) {
      mockWindowSize(800 + i * 100, 600 + i * 50);
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // 期望在合理時間內完成（例如1秒內）
    expect(duration).toBeLessThan(1000);
  });

  it('應該避免記憶體洩漏', () => {
    const initialMemory = performance.memory?.usedJSHeapSize || 0;

    // 創建並銷毀多個組件實例
    for (let i = 0; i < 10; i++) {
      const { unmount } = render(
        <ResponsiveLayout key={i} testId={`memory-test-${i}`}>
          記憶體測試 {i}
        </ResponsiveLayout>
      );

      unmount();
    }

    // 強制垃圾回收（如果可用）
    if (global.gc) {
      global.gc();
    }

    const finalMemory = performance.memory?.usedJSHeapSize || 0;
    const memoryIncrease = finalMemory - initialMemory;

    // 期望記憶體增加在合理範圍內
    // 注意：這個測試可能不準確，因為垃圾回收時間不確定
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // 少於10MB
  });
});

describe('可訪問性測試', () => {
  it('應該提供適當的ARIA屬性', () => {
    render(
      <ResponsiveText
        type="body"
        ariaLabel="測試文字標籤"
        role="article"
        testId="accessible-text"
      >
        可訪問性測試文字
      </ResponsiveText>
    );

    const textElement = screen.getByTestId('accessible-text');
    expect(textElement).toHaveAttribute('aria-label', '測試文字標籤');
    expect(textElement).toHaveAttribute('role', 'article');
  });

  it('應該確保觸控目標足夠大', () => {
    render(
      <ResponsiveText
        type="button"
        onClick={() => {}}
        testId="touch-target-text"
      >
        觸控目標測試
      </ResponsiveText>
    );

    const textElement = screen.getByTestId('touch-target-text');
    const style = window.getComputedStyle(textElement);

    // 檢查最小尺寸（WCAG標準：44x44像素）
    const minWidth = parseFloat(style.minWidth) || 0;
    const minHeight = parseFloat(style.minHeight) || 0;

    // 期望有適當的最小尺寸
    expect(minWidth).toBeGreaterThanOrEqual(40);
    expect(minHeight).toBeGreaterThanOrEqual(40);
  });

  it('應該在高對比度模式下保持可讀性', () => {
    // 模擬高對比度模式
    const mediaQueryMock = vi.fn().mockReturnValue({ matches: true });
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query.includes('prefers-contrast: high'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(
      <ResponsiveText
        type="body"
        testId="high-contrast-text"
      >
        高對比度測試文字
      </ResponsiveText>
    );

    const textElement = screen.getByTestId('high-contrast-text');
    const style = window.getComputedStyle(textElement);

    // 在高對比度模式下，文字應該有足夠的字重
    const fontWeight = style.fontWeight;
    expect(parseInt(fontWeight)).toBeGreaterThanOrEqual(400);
  });
});

// 清理測試環境
afterAll(() => {
  vi.restoreAllMocks();
});
