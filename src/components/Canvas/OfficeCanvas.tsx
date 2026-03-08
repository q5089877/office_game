/**
 * OfficeCanvas 組件
 * 負責渲染辦公室畫布，包括網格、桌子、物件、角色等
 */

import React from 'react';
import { Stage, Layer, Rect, Text, Circle, Group, Arc } from 'react-konva';
import { OFFICE_LAYOUT } from '../../constants';
import { CANVAS_CONFIG, GridCalculator } from '../../config/canvasConfig';
import PixelCharacter from '../shared/PixelCharacter';
import PixelPlant from '../shared/PixelPlant';
import DebugOverlay from '../shared/DebugOverlay';
import { GameState, Player } from '../../types';
import { themeColors } from '../../theme/colors';

interface OfficeCanvasProps {
  gameState: GameState;
  scale: number;
  showEvent: boolean;
  selectedPlayerId: string;
  player: Player;
  onPlayerClick: (playerId: string) => void;
}

const OfficeCanvas: React.FC<OfficeCanvasProps> = ({
  gameState,
  scale,
  showEvent,
  selectedPlayerId,
  player,
  onPlayerClick,
}) => {
  return (
    <div className="bg-white rounded-[32px] shadow-2xl border border-slate-200/60 overflow-hidden relative flex items-center justify-center">
      <Stage
        width={CANVAS_CONFIG.BASE_WIDTH * scale}
        height={CANVAS_CONFIG.BASE_HEIGHT * scale}
        scaleX={scale}
        scaleY={scale}
      >
        <Layer>
          {/* 畫布背景 */}
          <Rect width={CANVAS_CONFIG.BASE_WIDTH} height={CANVAS_CONFIG.BASE_HEIGHT} fill="#fff" />


          {/* 網格點 */}
          {[...Array(CANVAS_CONFIG.GRID.COLUMNS)].map((_, i) =>
            [...Array(CANVAS_CONFIG.GRID.ROWS)].map((_, j) => {
              const pos = GridCalculator.getGridPointPosition(i, j);
              return (
                <Circle key={`${i}-${j}`} x={pos.x} y={pos.y} radius={1} fill={themeColors.secondary[300]} />
              );
            })
          )}

          {/* 桌子與裝飾性物件 */}
          {OFFICE_LAYOUT.clusters.map((cluster, cIdx) => (
            <React.Fragment key={`cluster-${cIdx}`}>
              {/* 裝飾性垃圾桶與散落的紙張 (放在每個群組的角落) */}
              <Group x={GridCalculator.getDeskPosition(cluster.desks[0].x, cluster.desks[0].y).x - 40}
                     y={GridCalculator.getDeskPosition(cluster.desks[0].x, cluster.desks[0].y).y + 80}>
                {/* 垃圾桶 */}
                  <Rect width={24} height={30} fill={themeColors.secondary[300]} cornerRadius={3} shadowBlur={10} shadowColor="rgba(0,0,0,0.1)" shadowOffset={{ x: 5, y: 15 }} />
                  <Rect width={28} height={6} fill={themeColors.secondary[400]} x={-2} y={-4} cornerRadius={2} />
                  <Text text="🗑️" fontSize={14} x={3} y={6} opacity={0.6} />
                  {/* 散落紙張 */}
                  <Rect width={12} height={16} fill="#fff" x={30} y={15} rotation={15} shadowBlur={2} shadowColor="rgba(0,0,0,0.1)" />
                  <Rect width={12} height={16} fill={themeColors.secondary[100]} x={25} y={20} rotation={-10} shadowBlur={2} shadowColor="rgba(0,0,0,0.1)" />
              </Group>

              {cluster.desks.map(desk => {
                const isPlayerDesk = desk.x === player.gridX && desk.y === player.gridY;
                const pos = GridCalculator.getDeskPosition(desk.x, desk.y);
                return (
                  <Group key={desk.id} x={pos.x} y={pos.y}>
                    {/* 桌子本體增加統一方向投影 */}
                    <Rect
                      width={90} height={70}
                      fill={isPlayerDesk ? `${themeColors.primary[600]}40` : `${themeColors.secondary[100]}CC`}
                      stroke={isPlayerDesk ? themeColors.primary[600] : themeColors.secondary[200]}
                      strokeWidth={isPlayerDesk ? 3 : 1.5}
                      cornerRadius={10}
                      shadowBlur={15}
                      shadowColor={isPlayerDesk ? `${themeColors.primary[600]}66` : "rgba(0,0,0,0.15)"}
                      shadowOffset={{ x: 5, y: 15 }}
                    />
                    <Group x={5} y={45}>
                      <Rect
                        width={80} height={22}
                        fill={isPlayerDesk ? themeColors.primary[600] : "rgba(255,255,255,0.8)"}
                        cornerRadius={6}
                      />
                      <Text
                        text={isPlayerDesk ? "新進員工" : desk.label}
                        fontSize={CANVAS_CONFIG.TEXT_SIZE.NPC.DESK_LABEL}
                        fill={isPlayerDesk ? "#ffffff" : themeColors.secondary[400]}
                        fontStyle="bold"
                        width={80}
                        align="center"
                        y={5}
                      />
                    </Group>
                  </Group>
                );
              })}
            </React.Fragment>
          ))}

          {/* 辦公室物件 */}
          {OFFICE_LAYOUT.objects.map(obj => {
            const pos = GridCalculator.getObjectPosition(obj.x, obj.y);
            return (
              <Group key={obj.id} x={pos.x} y={pos.y} cursor="pointer">
                {/* 統一的金黃色底座與框 - 增加外發光感與方向投影 */}
                <Rect width={70} height={70} fill="#fff"
                      stroke={themeColors.warning[400]} strokeWidth={3} cornerRadius={16}
                      shadowBlur={15} shadowColor={`${themeColors.warning[400]}4D`}
                      shadowOffset={{ x: 5, y: 15 }} />
                <Text text={obj.emoji} fontSize={CANVAS_CONFIG.TEXT_SIZE.NPC.OBJECT_EMOJI} x={20} y={13} />
                <Group y={50}>
                  <Rect width={70} height={20} fill={`${themeColors.warning[400]}26`} cornerRadius={4} />
                  <Text text={obj.label} fontSize={CANVAS_CONFIG.TEXT_SIZE.NPC.OBJECT_LABEL}
                        fill={themeColors.warning[700]} fontStyle="bold" width={70} align="center" y={4} />
                </Group>
              </Group>
            );
          })}

          {/* 老闆與警戒範圍 (Vision Cone) */}
          <Group x={gameState.bossPosition.x} y={gameState.bossPosition.y}>
            {/* 紅色扇形警戒區 */}
            <Arc
              innerRadius={0}
              outerRadius={160}
              angle={120}
              rotation={30}
              fill={`${themeColors.error[500]}1A`}
              stroke={`${themeColors.error[500]}33`}
              strokeWidth={2}
              dash={[10, 10]}
              x={0}
              y={0}
              listening={false}
            />

            <PixelCharacter
              id="boss"
              name="大老闆"
              color={themeColors.error[600]}
              isSelected={false}
              bobOffset={gameState.bossPosition.y % 4}
              gender="MALE"
            />

            {/* 顯示老闆的對話泡泡 - 卡片觸發或抓到玩家時 */}
            {(gameState.bossChatMessage || gameState.players.some(p => p.id === 'player' &&
              Math.abs(p.position.x - gameState.bossPosition.x) < 50 &&
              Math.abs(p.position.y - gameState.bossPosition.y) < 40
            )) && (() => {
              const bossText = gameState.bossChatMessage || "發現你在摸魚~";
              const bubbleWidth = Math.max(140, bossText.length * 10 + 20);
              const lineHeight = 20;
              const lineCount = Math.ceil(bossText.length / 12);
              const bubbleHeight = Math.max(32, lineCount * lineHeight + 16);
              const bubbleFill = gameState.bossChatMessage ? "rgba(255, 255, 255, 0.95)" : "rgba(255,255,255,0.9)";
              const bubbleStroke = gameState.bossChatMessage ? "#dc2626" : "#f87171";
              const textColor = gameState.bossChatMessage ? "#7f1d1d" : "#991b1b";

              return (
                <Group y={-80}>
                  <Rect width={bubbleWidth} height={bubbleHeight} fill={bubbleFill}
                        x={-bubbleWidth / 2} y={-bubbleHeight} cornerRadius={12}
                        stroke={bubbleStroke} strokeWidth={2}
                        shadowBlur={10} shadowColor="rgba(0,0,0,0.1)" />
                  <Text text={bossText} fontSize={CANVAS_CONFIG.TEXT_SIZE.NPC.NAME_LABEL}
                        fill={textColor} fontStyle="bold" width={bubbleWidth - 10}
                        align="center" x={-(bubbleWidth - 10) / 2}
                        y={-bubbleHeight + (lineCount > 1 ? 10 : 9)} wrap="char" />
                  <Rect width={2} height={20} fill={bubbleStroke} x={-1} y={0} />
                  <Rect width={8} height={8} fill={bubbleFill} x={-4} y={20}
                        rotation={45} stroke={bubbleStroke} strokeWidth={2} />
                  <Rect width={12} height={6} fill={bubbleFill} x={-6} y={0} />
                </Group>
              );
            })()}
          </Group>

          {/* 植物 - 修正座標計算 */}
          {(() => {
            const plantPos = GridCalculator.getPlantPosition(gameState.plantPosition.x, gameState.plantPosition.y);
            return <PixelPlant x={plantPos.x} y={plantPos.y} />;
          })()}

          {/* 玩家角色 */}
          {gameState.players.map((p) => {
            const isRecentTarget = gameState.lastEvent?.includes(p.name) ||
              (p.id === 'player' && (gameState.lastEvent?.includes("你") ||
               gameState.lastEvent?.includes("手速") || gameState.lastEvent?.includes("戴上")));

            // 將澆水判定改為：距離植物位置很近時顯示
            const distToPlant = Math.sqrt(
              Math.pow(p.position.x - gameState.plantPosition.x, 2) +
              Math.pow(p.position.y - gameState.plantPosition.y, 2)
            );
            const isWatering = p.id !== 'player' && distToPlant < 40;
            const bubbleWidth = 140;

            // 氣泡邊框色根據性別動態調整
            const bubbleStroke = p.gender === 'FEMALE' ? "#e06ee5" : "#3b82f6";
            const bubbleFill = p.gender === 'FEMALE' ? "rgba(253, 244, 255, 0.95)" : "rgba(238, 242, 255, 0.95)";

            return (
              <Group key={p.id} x={p.position.x} y={p.position.y} onClick={() => onPlayerClick(p.id)}>
                {/* 對話氣泡 */}
                {p.chatMessage && (() => {
                  const padding = 16;
                  const lineHeight = 20;
                  const charPerLine = 12; // 估計每行字數
                  const lineCount = Math.ceil(p.chatMessage.length / charPerLine);
                  const bubbleHeight = Math.max(32, lineCount * lineHeight + padding);

                  return (
                    <Group y={-65}>
                      <Rect width={bubbleWidth} height={bubbleHeight} fill={bubbleFill}
                            x={-bubbleWidth / 2} y={-bubbleHeight} cornerRadius={12}
                            stroke={bubbleStroke} strokeWidth={2} shadowBlur={5}
                            shadowColor="rgba(0, 0, 0, 0.05)" />
                      <Text text={p.chatMessage} fontSize={CANVAS_CONFIG.TEXT_SIZE.NPC.NAME_LABEL}
                            fill={p.gender === 'FEMALE' ? "#701a75" : "#1d4ed8"} fontStyle="bold" width={bubbleWidth - 10}
                            align="center" x={-(bubbleWidth - 10) / 2}
                            y={-bubbleHeight + (lineCount > 1 ? 10 : 9)} wrap="char" />
                      <Rect width={2} height={20} fill={bubbleStroke} x={-1} y={0} />
                      <Rect width={8} height={8} fill={bubbleFill} x={-4} y={20}
                            rotation={45} stroke={bubbleStroke} strokeWidth={2} />
                      <Rect width={12} height={6} fill={bubbleFill} x={-6} y={0} />
                    </Group>
                  );
                })()}

                {/* 摸魚中氣泡 */}
                {isRecentTarget && showEvent && (() => {
                  const targetText = "摸魚中...";
                  const bubbleHeight = 30; // 固定短句
                  return (
                    <Group y={-65}>
                      <Rect width={bubbleWidth} height={bubbleHeight} fill="rgba(255,255,255,0.85)"
                            x={-bubbleWidth / 2} y={-bubbleHeight} cornerRadius={9}
                            stroke={bubbleStroke} strokeWidth={2} shadowBlur={5}
                            shadowColor="rgba(0,0,0,0.05)" />
                      <Text text={targetText} fontSize={CANVAS_CONFIG.TEXT_SIZE.NPC.NAME_LABEL}
                            fill={p.gender === 'FEMALE' ? "#701a75" : "#4338ca"} fontStyle="bold" width={bubbleWidth - 10}
                            align="center" x={-(bubbleWidth - 10) / 2}
                            y={-bubbleHeight + 12} wrap="char" />
                      <Rect width={2} height={20} fill={bubbleStroke} x={-1} y={0} />
                      <Rect width={8} height={8} fill="rgba(255,255,255,0.85)" x={-4} y={20}
                            rotation={45} stroke={bubbleStroke} strokeWidth={2} />
                      <Rect width={12} height={6} fill="rgba(255,255,255,0.85)" x={-6} y={0} />
                    </Group>
                  );
                })()}

                {/* 澆水氣泡 */}
                {isWatering && (() => {
                  const wateringText = "幫植物澆水中...";
                  const bubbleHeight = 30; // 固定短句
                  return (
                    <Group y={-65}>
                      <Rect width={bubbleWidth} height={bubbleHeight} fill="rgba(236, 253, 245, 0.95)"
                            x={-bubbleWidth / 2} y={-bubbleHeight} cornerRadius={9}
                            stroke="#22c55e" strokeWidth={2} shadowBlur={5}
                            shadowColor="rgba(34, 197, 94, 0.2)" />
                      <Text text={wateringText} fontSize={CANVAS_CONFIG.TEXT_SIZE.NPC.NAME_LABEL}
                            fill="#15803d" fontStyle="bold" width={bubbleWidth - 10}
                            align="center" x={-(bubbleWidth - 10) / 2}
                            y={-bubbleHeight + 12} wrap="char" />
                      <Rect width={2} height={20} fill="#22c55e" x={-1} y={0} />
                      <Rect width={8} height={8} fill="rgba(236, 253, 245, 0.95)" x={-4} y={20}
                            rotation={45} stroke="#22c55e" strokeWidth={2} />
                      <Rect width={12} height={6} fill="rgba(236, 253, 245, 0.95)" x={-6} y={0} />
                    </Group>
                  );
                })()}

                {/* 像素角色 */}
                <PixelCharacter
                  id={p.id}
                  name={p.name}
                  color={p.id === 'player' ? themeColors.primary[600] : themeColors.success[500]}
                  isSelected={selectedPlayerId === p.id}
                  bobOffset={p.position.y % 4}
                  gender={p.gender}
                  isDanger={isRecentTarget} // 傳遞危險/暴露狀態
                />
              </Group>
            );
          })}

          {/* 調試疊層 - 只在開發模式顯示 */}
          {process.env.NODE_ENV !== 'production' && (
            <DebugOverlay
              gameState={gameState}
              showGrid={false} // 關閉網格線以免干擾
              showDeskPositions={true}
              showNPCPositions={true}
              showAlignmentLines={true}
              showCoordinates={false}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default OfficeCanvas;
