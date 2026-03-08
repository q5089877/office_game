/**
 * PixelPlant 組件
 * 像素風格的植物渲染 - 恢復原始精美設計
 */

import React from 'react';
import { Group, Rect, Circle, Text } from 'react-konva';
import { GridCalculator, CANVAS_CONFIG } from '../../config/canvasConfig';

interface PixelPlantProps {
  x: number;
  y: number;
}

const PixelPlant: React.FC<PixelPlantProps> = ({ x, y }) => {
  return (
    <Group x={x} y={y}>
      {/* 陰影效果 */}
      <Circle radius={15} fill="rgba(0,0,0,0.05)" scaleY={0.5} y={5} />

      {/* 花盆 */}
      <Rect
        width={30}
        height={25}
        fill="#78350f"
        x={-15}
        y={-20}
        cornerRadius={4}
        stroke="#1a1a1a"
        strokeWidth={1.5}
      />

      {/* 植物標籤 - 移到更高的地方 */}
      <Group y={-80} scaleX={0.9} scaleY={0.9}>
        <Rect width={60} height={18} fill="rgba(255,255,255,0.7)" x={-30} cornerRadius={6} stroke="#1a1a1a" strokeWidth={1.5} />
        <Text
          text="舒壓植栽"
          fontSize={CANVAS_CONFIG.TEXT_SIZE.NPC.NAME_LABEL}
          fill="#166534"
          fontStyle="bold"
          width={60}
          align="center"
          x={-30}
          y={2.5}
        />
      </Group>

      {/* 植物表情符號 - 微調位置使其看起來像種在盆裡 */}
      <Text
        text="🪴"
        fontSize={CANVAS_CONFIG.TEXT_SIZE.OTHER.PLANT_EMOJI}
        x={-15}
        y={-42}
      />
    </Group>
  );
};

export default PixelPlant;
