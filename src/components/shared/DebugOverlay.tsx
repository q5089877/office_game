/**
 * 調試疊層組件
 * 用於視覺驗證NPC與桌子坐標對齊情況
 */

import React from 'react';
import { Group, Rect, Text, Circle, Line } from 'react-konva';
import { PositionService, OfficeEntity } from '../../utils/PositionService';
import { OFFICE_LAYOUT } from '../../constants';
import { GameState } from '../../types';

interface DebugOverlayProps {
  gameState: GameState;
  showGrid?: boolean;
  showDeskPositions?: boolean;
  showNPCPositions?: boolean;
  showAlignmentLines?: boolean;
  showCoordinates?: boolean;
}

const DebugOverlay: React.FC<DebugOverlayProps> = ({
  gameState,
  showGrid = true,
  showDeskPositions = true,
  showNPCPositions = true,
  showAlignmentLines = true,
  showCoordinates = false,
}) => {
  // 只在開發模式顯示
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const elements = [];

  // 1. 網格線
  if (showGrid) {
    for (let x = 0; x <= OFFICE_LAYOUT.gridSize.x; x++) {
      const pos1 = PositionService.gridToPixel(x, 0, OfficeEntity.GRID_POINT);
      const pos2 = PositionService.gridToPixel(x, OFFICE_LAYOUT.gridSize.y, OfficeEntity.GRID_POINT);
      elements.push(
        <Line
          key={`vline-${x}`}
          points={[pos1.x, pos1.y, pos2.x, pos2.y]}
          stroke="#e2e8f0"
          strokeWidth={1}
          dash={[5, 5]}
          opacity={0.5}
        />
      );
    }
    for (let y = 0; y <= OFFICE_LAYOUT.gridSize.y; y++) {
      const pos1 = PositionService.gridToPixel(0, y, OfficeEntity.GRID_POINT);
      const pos2 = PositionService.gridToPixel(OFFICE_LAYOUT.gridSize.x, y, OfficeEntity.GRID_POINT);
      elements.push(
        <Line
          key={`hline-${y}`}
          points={[pos1.x, pos1.y, pos2.x, pos2.y]}
          stroke="#e2e8f0"
          strokeWidth={1}
          dash={[5, 5]}
          opacity={0.5}
        />
      );
    }

    // 網格點
    for (let x = 0; x < OFFICE_LAYOUT.gridSize.x; x++) {
      for (let y = 0; y < OFFICE_LAYOUT.gridSize.y; y++) {
        const pos = PositionService.gridToPixel(x, y, OfficeEntity.GRID_POINT);
        elements.push(
          <Circle
            key={`grid-point-${x}-${y}`}
            x={pos.x}
            y={pos.y}
            radius={2}
            fill="#94a3b8"
            opacity={0.3}
          />
        );

        if (showCoordinates) {
          elements.push(
            <Text
              key={`grid-text-${x}-${y}`}
              x={pos.x + 5}
              y={pos.y - 10}
              text={`(${x},${y})`}
              fontSize={10}
              fill="#64748b"
              opacity={0.6}
            />
          );
        }
      }
    }
  }

  // 2. 桌子位置標記
  if (showDeskPositions) {
    OFFICE_LAYOUT.clusters.forEach((cluster, cIdx) => {
      cluster.desks.forEach(desk => {
        if (desk.owner) {
          const deskPos = PositionService.gridToPixel(desk.x, desk.y, OfficeEntity.DESK);
          const cellCenter = PositionService.gridToPixel(desk.x, desk.y, OfficeEntity.NPC);

          // 桌子位置標記
          elements.push(
            <React.Fragment key={`desk-marker-${desk.id}`}>
              <Circle
                x={deskPos.x}
                y={deskPos.y}
                radius={6}
                fill="#3b82f6"
                opacity={0.7}
                stroke="#1d4ed8"
                strokeWidth={1}
              />
              <Text
                x={deskPos.x + 10}
                y={deskPos.y - 20}
                text={`${desk.label}`}
                fontSize={11}
                fill="#1e40af"
                fontStyle="bold"
              />
              <Text
                x={deskPos.x + 10}
                y={deskPos.y - 8}
                text={`(${Math.round(deskPos.x)},${Math.round(deskPos.y)})`}
                fontSize={9}
                fill="#475569"
              />

              {/* 單元格中心標記 */}
              <Circle
                x={cellCenter.x}
                y={cellCenter.y}
                radius={4}
                fill="#10b981"
                opacity={0.7}
                stroke="#059669"
                strokeWidth={1}
              />

              {/* 桌子到中心的連線 */}
              {showAlignmentLines && (
                <Line
                  key={`desk-line-${desk.id}`}
                  points={[deskPos.x, deskPos.y, cellCenter.x, cellCenter.y]}
                  stroke="#94a3b8"
                  strokeWidth={1}
                  dash={[3, 3]}
                  opacity={0.4}
                />
              )}
            </React.Fragment>
          );
        }
      });
    });
  }

  // 3. NPC位置標記
  if (showNPCPositions) {
    gameState.players.forEach(player => {
      const npcPos = player.position;
      const expectedPos = PositionService.gridToPixel(player.gridX, player.gridY, OfficeEntity.NPC);

      // 計算偏移量
      const dx = npcPos.x - expectedPos.x;
      const dy = npcPos.y - expectedPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // 實際NPC位置
      elements.push(
        <React.Fragment key={`npc-marker-${player.id}`}>
          <Circle
            x={npcPos.x}
            y={npcPos.y}
            radius={8}
            fill={player.id === 'player' ? '#8b5cf6' : '#ef4444'}
            opacity={0.8}
            stroke={player.id === 'player' ? '#7c3aed' : '#dc2626'}
            strokeWidth={2}
          />
          <Text
            x={npcPos.x + 12}
            y={npcPos.y - 25}
            text={`${player.name}`}
            fontSize={12}
            fill={player.id === 'player' ? '#7c3aed' : '#dc2626'}
            fontStyle="bold"
          />
          <Text
            x={npcPos.x + 12}
            y={npcPos.y - 12}
            text={`(${Math.round(npcPos.x)},${Math.round(npcPos.y)})`}
            fontSize={10}
            fill="#475569"
          />

          {/* 預期位置（單元格中心） */}
          <Circle
            x={expectedPos.x}
            y={expectedPos.y}
            radius={6}
            fill="#f59e0b"
            opacity={0.7}
            stroke="#d97706"
            strokeWidth={1}
          />

          {/* 偏移線 */}
          {showAlignmentLines && distance > 1 && (
            <React.Fragment key={`npc-line-${player.id}`}>
              <Line
                points={[npcPos.x, npcPos.y, expectedPos.x, expectedPos.y]}
                stroke="#f59e0b"
                strokeWidth={1.5}
                opacity={0.6}
              />
              <Text
                x={(npcPos.x + expectedPos.x) / 2}
                y={(npcPos.y + expectedPos.y) / 2 - 10}
                text={`${Math.round(distance)}px`}
                fontSize={9}
                fill="#b45309"
                fontStyle="bold"
              />
              <Text
                x={(npcPos.x + expectedPos.x) / 2}
                y={(npcPos.y + expectedPos.y) / 2 + 2}
                text={`(${Math.round(dx)},${Math.round(dy)})`}
                fontSize={8}
                fill="#92400e"
              />
            </React.Fragment>
          )}
        </React.Fragment>
      );
    });
  }

  // 4. 對齊狀態摘要
  const alignmentSummary = [];
  let misalignedCount = 0;

  gameState.players.forEach(player => {
    if (player.id !== 'player') {
      // 找到對應的桌子
      let correspondingDesk = null;
      OFFICE_LAYOUT.clusters.forEach(cluster => {
        cluster.desks.forEach(desk => {
          if (desk.owner === player.id) {
            correspondingDesk = desk;
          }
        });
      });

      if (correspondingDesk) {
        const deskPos = PositionService.gridToPixel(correspondingDesk.x, correspondingDesk.y, OfficeEntity.DESK);
        const isAligned = PositionService.isNPCAlignedWithDesk(player.position, deskPos, 30);

        if (!isAligned) {
          misalignedCount++;
        }

        alignmentSummary.push({
          name: player.name,
          aligned: isAligned,
          deskPos,
          npcPos: player.position
        });
      }
    }
  });

  // 摘要文字
  elements.push(
    <React.Fragment key="summary">
      <Rect
        x={20}
        y={20}
        width={300}
        height={60 + alignmentSummary.length * 20}
        fill="rgba(255, 255, 255, 0.9)"
        cornerRadius={8}
        stroke="#cbd5e1"
        strokeWidth={1}
        shadowBlur={5}
        shadowColor="rgba(0,0,0,0.1)"
      />
      <Text
        x={35}
        y={30}
        text="坐標對齊調試"
        fontSize={14}
        fill="#1e293b"
        fontStyle="bold"
      />
      <Text
        x={35}
        y={50}
        text={`對齊檢查: ${gameState.players.length - 1 - misalignedCount}/${gameState.players.length - 1} 正確`}
        fontSize={12}
        fill={misalignedCount === 0 ? '#10b981' : '#ef4444'}
      />

      {alignmentSummary.map((item, idx) => (
        <Text
          key={`summary-${idx}`}
          x={35}
          y={75 + idx * 20}
          text={`${item.name}: ${item.aligned ? '✅' : '❌'}`}
          fontSize={11}
          fill={item.aligned ? '#10b981' : '#ef4444'}
        />
      ))}
    </React.Fragment>
  );

  return <Group>{elements}</Group>;
};

export default DebugOverlay;
