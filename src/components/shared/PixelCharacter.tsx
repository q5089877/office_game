/**
 * PixelCharacter 組件
 * 像素風格的角色渲染 - 恢復原始精美可愛設計
 */

import React from 'react';
import { Group, Rect, Circle, Text } from 'react-konva';
import { CANVAS_CONFIG } from '../../config/canvasConfig';

interface PixelCharacterProps {
  name: string;
  color: string;
  isSelected: boolean;
  bobOffset: number;
  id: string;
  gender?: string;
  isDanger?: boolean; // 新增：是否處於危險/暴露狀態
  currentStatus?: string;
  opacity?: number;
}

const PixelCharacter: React.FC<PixelCharacterProps> = ({
  name,
  color,
  isSelected,
  bobOffset,
  id,
  gender,
  isDanger,
  currentStatus,
  opacity = 1
}) => {
  const isPlayer = id === 'player';
  const isBoss = id === 'boss';
  const isFemale = gender === 'FEMALE';

  // 性別/類型代表色方案
  const themeColor = isBoss ? "#ff4757" : (isFemale ? "#e06ee5" : "#45aaf2");
  const auraColor = isBoss ? "rgba(255, 71, 87, 0.2)" : (isFemale ? "rgba(224, 110, 229, 0.2)" : "rgba(69, 170, 242, 0.2)");

  // 縮放比例: Boss 稍微高大一點
  const charScale = isBoss ? 0.9 : 0.75;

  // 衣服顏色: Boss 使用代表色，其餘使用稍微淡一點的同色系或傳入顏色
  const clothesColor = isBoss ? "#991b1b" : (color || themeColor);

  // 髮型強化
  const hairColor = isBoss ? "#374151" : (isFemale ? "#b45309" : "#1a1a1a");
  const hairWidth = isFemale ? 12 : 9;
  const hairHeight = isFemale ? 40 : (isBoss ? 10 : 18);
  const hairRightX = 19.5 - hairWidth;

  const skinColor = "#fde68a";
  const blushColor = isFemale ? "#ff85a2" : "#fca5a5";
  const blushOpacity = isFemale ? 0.9 : 0.6;

  // 狀態燈顏色 (8x8 像素燈)
  // 綠色: 努力工作中, 橘色: 準備摸魚, 紅色: 被老闆盯上
  const statusColor = isDanger ? "#ef4444" : (isBoss ? "#ef4444" : (isPlayer ? "#f97316" : "#22c55e"));

  return (
    <Group y={bobOffset} scaleX={charScale} scaleY={charScale} opacity={opacity}>
      {/* 角色底座 (Aura) - 1.2倍大小 + 統一光影方向 */}
      <Circle radius={24} fill={auraColor} scaleY={0.5} y={3} />
      <Circle radius={15} fill="rgba(0,0,0,0.15)" scaleY={0.5} y={8} x={4} />

      {/* 警戒之眼 (Detection Meter) */}
      {isDanger && !isBoss && (
        <Group y={-85} x={0} scaleX={1.5} scaleY={1.5}>
          {/* 眼白 */}
          <Rect width={10} height={6} fill="#fff" x={-5} y={-3} cornerRadius={3} stroke="#ef4444" strokeWidth={1} />
          {/* 瞳孔 (紅色) */}
          <Rect width={4} height={4} fill="#ef4444" x={-2} y={-2} cornerRadius={2} />
          {/* 眼線 */}
          <Rect width={10} height={1} fill="#ef4444" x={-5} y={-4} />
        </Group>
      )}

      {/* 身體 */}
      <Rect width={39} height={45} fill={clothesColor} cornerRadius={6} x={-19.5} y={-45} stroke="#1a1a1a" strokeWidth={2.25} />
      
      {/* Boss 特別加成: 金色領帶 */}
      {isBoss && (
        <Group x={-3} y={-35}>
          <Rect width={6} height={12} fill="#fbbf24" stroke="#b45309" strokeWidth={1} />
          <Rect width={8} height={4} fill="#fbbf24" x={-1} y={0} stroke="#b45309" strokeWidth={1} />
        </Group>
      )}

      <Rect width={33} height={15} fill="rgba(0,0,0,0.1)" x={-16.5} y={-18} cornerRadius={3} />
      <Rect width={33} height={30} fill={skinColor} x={-16.5} y={-48} cornerRadius={4.5} stroke="#1a1a1a" strokeWidth={2.25} />

      {/* 頭髮 */}
      <Rect width={39} height={12} fill={hairColor} x={-19.5} y={-51} cornerRadius={6} stroke="#1a1a1a" strokeWidth={1.5} />
      <Rect width={hairWidth} height={hairHeight} fill={hairColor} x={-19.5} y={-45} cornerRadius={3} stroke="#1a1a1a" strokeWidth={1.5} />
      <Rect width={hairWidth} height={hairHeight} fill={hairColor} x={hairRightX} y={-45} cornerRadius={3} stroke="#1a1a1a" strokeWidth={1.5} />

      {/* Boss 特別加成: 金色皇冠 */}
      {isBoss && (
        <Group x={-15} y={-62}>
          <Rect width={30} height={8} fill="#f59e0b" stroke="#92400e" strokeWidth={1.5} cornerRadius={1} />
          <Rect width={6} height={6} fill="#f59e0b" x={0} y={-4} rotation={45} stroke="#92400e" strokeWidth={1} />
          <Rect width={6} height={6} fill="#f59e0b" x={12} y={-4} rotation={45} stroke="#92400e" strokeWidth={1} />
          <Rect width={6} height={6} fill="#f59e0b" x={24} y={-4} rotation={45} stroke="#92400e" strokeWidth={1} />
        </Group>
      )}

      {/* 眼睛 / 墨鏡 */}
      {isBoss ? (
        <Group y={-38}>
          <Rect width={28} height={10} fill="#1a1a1a" x={-14} cornerRadius={2} stroke="#fbbf24" strokeWidth={1} />
          <Rect width={32} height={2} fill="#1a1a1a" x={-16} y={2} />
        </Group>
      ) : (
        <Group>
          <Rect width={4.5} height={6} fill="#1a1a1a" x={-9} y={-37.5} cornerRadius={1.5} />
          <Rect width={4.5} height={6} fill="#1a1a1a" x={4.5} y={-37.5} cornerRadius={1.5} />
          <Rect width={1.5} height={1.5} fill="#fff" x={-7.5} y={-36} />
          <Rect width={1.5} height={1.5} fill="#fff" x={6} y={-36} />
        </Group>
      )}

      {/* 臉頰腮紅 */}
      {!isBoss && (
        <Group>
          <Rect width={6} height={3} fill={blushColor} x={-13.5} y={-30} opacity={blushOpacity} />
          <Rect width={6} height={3} fill={blushColor} x={7.5} y={-30} opacity={blushOpacity} />
        </Group>
      )}

      {/* 名字標籤 - 動態寬度計算 + 狀態燈 */}
      {(() => {
        const padding = 14;
        const charWidth = 12; // 估計每個字的寬度
        const dynamicWidth = Math.max(72, name.length * charWidth + padding * 2);
        const rectX = -dynamicWidth / 2;
        
        return (
          <Group y={-65} scaleX={1.2} scaleY={1.2}>
            <Rect 
              width={dynamicWidth} 
              height={18} 
              fill={isBoss ? "#fef3c7" : "rgba(255,255,255,0.95)"} 
              x={rectX} 
              cornerRadius={6} 
              stroke={isBoss ? "#d97706" : "#1a1a1a"} 
              strokeWidth={1.5} 
              shadowBlur={isSelected ? 10 : 0}
              shadowColor={themeColor}
            />
            {/* 性別裝飾小色塊 - 對齊左側 */}
            {!isBoss && (
              <Rect width={4} height={10} fill={themeColor} x={rectX + 4} y={4} cornerRadius={1} />
            )}
            {/* 狀態像素燈 (8x8) */}
            {!isBoss && (
              <Rect 
                width={8} height={8} fill={statusColor} 
                x={rectX + dynamicWidth - 12} y={5} cornerRadius={2} 
                stroke="#1a1a1a" strokeWidth={1} 
              />
            )}
            <Text
              text={name}
              fontSize={CANVAS_CONFIG.TEXT_SIZE.NPC.NAME_LABEL}
              fill={isBoss ? "#92400e" : "#1a1a1a"}
              fontStyle="bold"
              width={dynamicWidth}
              align="center"
              x={rectX}
              y={2.5}
            />
          </Group>
        );
      })()}

      {/* 選中效果 - 動態底座 (Active Base) */}
      {isSelected && (
        <Group y={3} scaleY={0.5}>
          {/* 核心光環 */}
          <Circle radius={35} stroke={themeColor} strokeWidth={2} opacity={0.6} />
          {/* 擴散外圈 (模擬呼吸感) */}
          <Circle radius={42} stroke={themeColor} strokeWidth={1} opacity={0.3} dash={[4, 4]} />
          {/* 底座填色 */}
          <Circle radius={35} fill={themeColor} opacity={0.1} />
        </Group>
      )}
    </Group>
  );
};

export default PixelCharacter;
