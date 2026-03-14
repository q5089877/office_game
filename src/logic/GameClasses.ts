import { DialogueManager } from "./DialogueManager";
import { DailyModifier, Gender, EntityType } from "../types";
import { DAILY_EVENTS, OFFICE_LAYOUT, ABSENCE_REASONS } from "../constants";

/**
 * 搞笑版辦公室生存 - 核心邏輯簡化版 (精力與壓力系統)
 */

export class Stats {
  constructor(
    public energy: number = 100,
    public stress: number = 0,
    public money: number = 0,
    public maxEnergy: number = 100
  ) {}

  modifyEnergy(amount: number) { this.energy = Math.min(this.maxEnergy, Math.max(0, this.energy + amount)); }
  modifyStress(amount: number) { this.stress = Math.min(100, Math.max(0, this.stress + amount)); }
  modifyMoney(amount: number) { this.money = Math.max(0, this.money + amount); }
  clone(): Stats { return new Stats(this.energy, this.stress, this.money, this.maxEnergy); }
}

export abstract class BaseEntity {
  constructor(
    public readonly id: string,
    public name: string,
    public readonly type: EntityType,
    public readonly gender: Gender = Gender.MALE
  ) {}
}

export class Character extends BaseEntity {
  public stats: Stats;
  public gridX: number = 0;
  public gridY: number = 0;
  public displayX: number = 0;
  public displayY: number = 0;
  public bobOffset: number = 0;
  public isMoving: boolean = false;
  public homeX: number = 0;
  public homeY: number = 0;

  public xp: number = 0;
  public level: number = 1;
  public luck: number = 5;
  public chatMessage: string | null = null;
  public chatTimer: number = 0;
  public ownedItemIds: string[] = [];

  // 攻擊系統屬性
  public lastAttackTime: number = 0;
  public attackCooldown: number = 30000; // 30秒冷卻
  public isAttacking: boolean = false;
  public attackStartTime: number = 0;

  public targetX: number | null = null;
  public targetY: number | null = null;
  public idleTimer: number = 0;
  public behaviorState: 'IDLE' | 'WORKING' | 'WANDERING' | 'VISITING_OBJECT' = 'WORKING';

  constructor(id: string, name: string, type: EntityType, stats?: Stats, x: number = 0, y: number = 0, gender: Gender = Gender.MALE) {
    super(id, name, type, gender);
    this.stats = stats || new Stats();
    this.gridX = x; this.gridY = y;
    this.displayX = x; this.displayY = y;
    this.homeX = x; this.homeY = y;
    this.targetX = x; this.targetY = y;
  }

  tick(deltaTime: number) {
    if (this.chatTimer > 0) {
      this.chatTimer -= deltaTime;
      if (this.chatTimer <= 0) this.chatMessage = null;
    }

    if (this.idleTimer > 0) {
      this.idleTimer -= deltaTime;
      if (this.idleTimer <= 0) {
          this.decideNextMove();
      }
      // 即使在發呆，也要更新 display 座標確保動畫平滑
    } else {
        const moveSpeed = 0.1;

        // 如果有目標位置，則穩定朝目標移動
        if (this.targetX !== null && this.targetY !== null) {
          const dx = this.targetX - this.gridX;
          const dy = this.targetY - this.gridY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 0.04) {
            // 每步移動一小格 (從 0.2 降至 0.04，變慢更優雅)
            this.gridX += (dx / dist) * 0.02;
            this.gridY += (dy / dist) * 0.02;
          } else {
            this.gridX = this.targetX;
            this.gridY = this.targetY;
            this.targetX = null;
            this.targetY = null;
            this.onReachedTarget();
          }
        }
    }

    const dDisplayX = this.gridX - this.displayX;
    const dDisplayY = this.gridY - this.displayY;
    const moveSpeed = 0.09; // 從 0.1 降至 0.09，讓視覺追隨更柔和

    if (Math.abs(dDisplayX) > 0.01 || Math.abs(dDisplayY) > 0.01) {
      this.displayX += dDisplayX * moveSpeed;
      this.displayY += dDisplayY * moveSpeed;
      this.isMoving = true;
      this.bobOffset = Math.sin(Date.now() * 0.01) * 5;
    } else {
      this.displayX = this.gridX; this.displayY = this.gridY;
      this.isMoving = false;
      this.bobOffset = 0;
    }

    // 如果完全沒事做且沒在發呆，強迫找件事做
    if (!this.isMoving && this.targetX === null && this.idleTimer <= 0 && this.type === EntityType.COLLEAGUE) {
        this.decideNextMove();
    }
  }

  decideNextMove() {
      const dice = Math.random();
      if (dice < 0.4) {
          // 回到座位工作
          this.targetX = this.homeX;
          this.targetY = this.homeY;
          this.behaviorState = 'WORKING';
      } else if (dice < 0.8) {
          // 隨機選一個辦公室物件去逛逛
          const objects = OFFICE_LAYOUT.objects;
          const targetObj = objects[Math.floor(Math.random() * objects.length)];
          this.targetX = targetObj.x;
          this.targetY = targetObj.y;
          this.behaviorState = 'VISITING_OBJECT';
      } else {
          // 隨機在附近晃晃
          this.targetX = Math.max(0, Math.min(10, this.gridX + (Math.random() * 4 - 2)));
          this.targetY = Math.max(0, Math.min(6, this.gridY + (Math.random() * 4 - 2)));
          this.behaviorState = 'WANDERING';
      }
  }

  onReachedTarget() {
      // 到達目標後發呆更久 (從 3-8s 延長至 8-15s，降低繁忙感)
      this.idleTimer = 5000 + Math.random() * 5000;

      // 如果是去逛物件，有機會碎碎念
      if (this.behaviorState === 'VISITING_OBJECT' && Math.random() < 0.7) {
          // 使用靜態方法，傳入自身以獲取對話
          this.chatMessage = DialogueManager.getRandomQuote(this, { id: 'normal', name: '', description: '', stressMult: 1, energyCostMod: 0, bossSpeedMult: 1 });
          this.chatTimer = 3000;
      }
  }

  wander() {
    // 舊的隨機漫步已棄用，整合進 decideNextMove
    this.decideNextMove();
  }

  // NOTE: collision resolution is handled in GameManager tick

  // 攻擊系統方法
  canAttack(): boolean {
    return Date.now() - this.lastAttackTime > this.attackCooldown;
  }

  attack(target: Character): number {
    this.lastAttackTime = Date.now();
    this.isAttacking = true;
    this.attackStartTime = Date.now();
    const stressDamage = 10 + Math.floor(Math.random() * 11); // 10-20壓力
    target.stats.modifyStress(stressDamage);
    return stressDamage;
  }

  clone(): Character {
    const c = new Character(this.id, this.name, this.type, this.stats.clone(), this.gridX, this.gridY, this.gender);
    c.displayX = this.displayX; c.displayY = this.displayY;
    c.homeX = this.homeX; c.homeY = this.homeY;
    c.xp = this.xp; c.level = this.level;
    c.luck = this.luck;
    c.chatMessage = this.chatMessage; c.chatTimer = this.chatTimer;
    c.ownedItemIds = [...this.ownedItemIds];
    c.lastAttackTime = this.lastAttackTime;
    c.attackCooldown = this.attackCooldown;
    c.isAttacking = this.isAttacking;
    c.attackStartTime = this.attackStartTime;
    c.targetX = this.targetX;
    c.targetY = this.targetY;
    c.idleTimer = this.idleTimer;
    c.behaviorState = this.behaviorState;
    return c;
  }
}

export class Boss extends BaseEntity {
  public gridX: number; public gridY: number;
  public displayX: number; public displayY: number;
  public chatMessage: string | null = null;
  public chatTimer: number = 0;

  constructor(x: number, y: number) {
    super('boss', '大老闆', EntityType.BOSS, Gender.MALE);
    this.gridX = x; this.gridY = y;
    this.displayX = x; this.displayY = y;
  }

  tick(day: number = 1, speedMult: number = 1) {
    if (this.chatTimer > 0) {
      this.chatTimer -= 16;
      if (this.chatTimer <= 0) this.chatMessage = null;
    }

    // 降低老闆巡邏速度 (0.08 -> 0.04)
    const currentSpeed = 0.04 * (1 + (day - 1) * 0.1) * speedMult;
    const dx = this.gridX - this.displayX;
    const dy = this.gridY - this.displayY;
    if (Math.abs(dx) > 0.01) this.displayX += dx * currentSpeed;
    if (Math.abs(dy) > 0.01) this.displayY += dy * currentSpeed;

    if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01 && Math.random() < 0.02 * (1 + day * 0.1) * speedMult) {
      const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      const dir = directions[Math.floor(Math.random() * directions.length)];
      this.gridX = Math.max(0, Math.min(10, this.gridX + dir[0]));
      this.gridY = Math.max(0, Math.min(6, this.gridY + dir[1]));
    }
  }

  clone(): Boss {
    const b = new Boss(this.gridX, this.gridY);
    b.displayX = this.displayX;
    b.displayY = this.displayY;
    b.chatMessage = this.chatMessage;
    b.chatTimer = this.chatTimer;
    return b;
  }
}

export class Plant extends BaseEntity {
  public gridX: number; public gridY: number;
  public displayX: number; public displayY: number;
  public boostTimer: number = 0;

  constructor(x: number, y: number) {
    super('plant', '舒壓植栽', EntityType.PLANT, Gender.MALE);
    this.gridX = x; this.gridY = y;
    this.displayX = x; this.displayY = y;
  }
  tick(deltaTime: number = 16) {
    this.displayX = this.gridX; this.displayY = this.gridY;
    if (this.boostTimer > 0) this.boostTimer -= deltaTime;
  }
  clone(): Plant {
    const p = new Plant(this.gridX, this.gridY);
    p.displayX = this.displayX;
    p.displayY = this.displayY;
    p.boostTimer = this.boostTimer;
    return p;
  }
}

export class GameManager {
  public player: Character;
  public colleagues: Character[];
  public fullColleaguePool: Character[];
  public boss: Boss;
  public plant: Plant;
  public day: number = 1;
  public chaosLevel: number = 0;
  public activityThisDay: number = 0;
  public performance: number = 0;
  public currentEvent: DailyModifier = DAILY_EVENTS[0];
  public lastEvent: string | null = "歡迎來到摸魚辦公室！";
  public notifications: string[] = [];
  public handIds: string[] = [];
  public stressAccumulator: number = 0;

  constructor(player?: Character, colleagues?: Character[], boss?: Boss, plant?: Plant, day?: number, chaosLevel?: number, fullColleaguePool?: Character[]) {
    this.player = player || new Character('player', '你', EntityType.PLAYER);
    this.fullColleaguePool = fullColleaguePool || (colleagues ? [...colleagues] : []);
    this.colleagues = colleagues || [];
    this.boss = boss || new Boss(5, 0);
    const plantDef = OFFICE_LAYOUT.objects.find(o => o.id === 'plant');
    this.plant = plant || new Plant(plantDef ? plantDef.x : 10, plantDef ? plantDef.y : 0);
    this.day = day || 1; this.chaosLevel = chaosLevel || 0;
  }

  addNotification(msg: string) {
    if (this.notifications[0] === msg) return; // 防止重複訊息洗頻
    this.notifications.unshift(msg);
    if (this.notifications.length > 20) this.notifications.pop();
  }

  tick() {
    this.player.tick(16);
    this.colleagues.forEach(c => c.tick(16));
    this.boss.tick(this.day, this.currentEvent.bossSpeedMult);
    this.plant.tick(16);

    // 實體防重疊機制 (Separation Force)
    const entities = [this.player, ...this.colleagues];
    for (let i = 0; i < entities.length; i++) {
        for (let j = i + 1; j < entities.length; j++) {
            const e1 = entities[i];
            const e2 = entities[j];
            const dx = e1.gridX - e2.gridX;
            const dy = e1.gridY - e2.gridY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // 如果距離過近 (重疊或幾乎重疊)
            if (dist < 0.6) {
                // 如果完全重疊，給一個隨機方向的初始推力
                const pushX = dist === 0 ? (Math.random() - 0.5) * 0.1 : (dx / dist) * 0.1;
                const pushY = dist === 0 ? (Math.random() - 0.5) * 0.1 : (dy / dist) * 0.1;

                // e1 往外推，如果是玩家則推動量較小
                if (e1 !== this.player) {
                    e1.gridX = Math.max(0, Math.min(10, e1.gridX + pushX));
                    e1.gridY = Math.max(0, Math.min(6, e1.gridY + pushY));
                }

                // e2 反向推，如果是玩家則推動量較小
                if (e2 !== this.player) {
                    e2.gridX = Math.max(0, Math.min(10, e2.gridX - pushX));
                    e2.gridY = Math.max(0, Math.min(6, e2.gridY - pushY));
                }
            }
        }
    }

    // 自動清除過期的攻擊狀態（攻擊後3秒）
    const now = Date.now();
    this.colleagues.forEach(colleague => {
      if (colleague.isAttacking && now - colleague.attackStartTime > 3000) {
        colleague.isAttacking = false;
      }
    });

    // 自然壓力增長：隨時間自動上升
    this.stressAccumulator += 0.07 * this.currentEvent.stressMult; // Increased from 0.04 to 0.07
    if (this.stressAccumulator >= 1) {
      this.player.stats.modifyStress(1);
      this.stressAccumulator -= 1;
    }

    // 自然精力恢復 (放空發呆的回血機制，避免卡暴)
    if (this.player.stats.energy < this.player.stats.maxEnergy) {
      // 沒體力時恢復較快 (每秒約回 5 點)，有體力時恢復較慢 (每秒約回 2 點)
      const recoveryRate = this.player.stats.energy < 15 ? 0.08 : 0.03;
      this.player.stats.modifyEnergy(recoveryRate);
    }

    // 壓力過載懲罰：精力快速流失 (模擬崩潰狀態)
    if (this.player.stats.stress >= 100) {
      this.player.stats.modifyEnergy(-0.5);
    }

    // 植物芬多精光環效果
    if (this.plant.boostTimer > 0) {
      const range = 4;
      [this.player, ...this.colleagues].forEach(c => {
        if (Math.abs(c.gridX - this.plant.gridX) <= range && Math.abs(c.gridY - this.plant.gridY) <= range) {
          c.stats.modifyStress(-0.05); // 每幀微幅減少壓力
        }
      });
    }

    // 壓力警告
    if (this.player.stats.stress >= 100 && Math.random() < 0.05) {
      this.addNotification("❌ 崩潰中！精力正在快速流失！");
    } else if (this.player.stats.stress > 90 && Math.random() < 0.01) {
      this.addNotification("⚠️ 警告：壓力過載！即將崩潰！");
    }

    const speakingCount = this.colleagues.filter(c => c.chatMessage !== null).length;
    if (speakingCount < 1) { // 限制最多只有一個人同時說話
      const plantDef = OFFICE_LAYOUT.objects.find(o => o.id === 'plant');
      const pX = plantDef ? plantDef.x : 10;
      const pY = plantDef ? plantDef.y : 0;
      const quietColleagues = this.colleagues.filter(c => c.chatMessage === null && !(c.gridX === pX && c.gridY === pY));
       if (quietColleagues.length > 0 && Math.random() < 0.0008) { // 機率從 0.005 降到 0.0008
        const luckyOne = quietColleagues[Math.floor(Math.random() * quietColleagues.length)];
        luckyOne.chatMessage = DialogueManager.getRandomQuote(luckyOne, this.currentEvent);
        luckyOne.chatTimer = 3000;
      }
    }

    // NPC主動攻擊檢查
    this.colleagues.forEach(colleague => {
      // 檢查攻擊冷卻
      if (!colleague.canAttack()) return;

      // 計算與玩家的距離
      const distance = Math.abs(colleague.gridX - this.player.gridX) +
                       Math.abs(colleague.gridY - this.player.gridY);

      // 攻擊觸發條件：距離≤2且隨機機率
      const attackChance = 0.001 * (1 + this.day * 0.1); // 隨天數增加
      if (distance <= 2 && Math.random() < attackChance) {
        // 執行攻擊
        const stressDamage = colleague.attack(this.player);

        // 顯示攻擊對話
        colleague.chatMessage = DialogueManager.getAttackQuote();
        colleague.chatTimer = 3000;

        // 添加通知
        this.addNotification(`⚠️ ${colleague.name} 把工作丟給你了！壓力 +${stressDamage}`);

        // 標記攻擊狀態（用於對話選擇）
        colleague.isAttacking = true;
        colleague.attackStartTime = Date.now();
      }
    });

    // 情境對話觸發（非攻擊時）
    if (Math.random() < 0.0005) { // 每天約0.05%機率
      const quietColleagues = this.colleagues.filter(c => c.chatMessage === null);
      if (quietColleagues.length > 0) {
        const npc = quietColleagues[Math.floor(Math.random() * quietColleagues.length)];
        npc.chatMessage = DialogueManager.getContextualQuote(npc, this.player, {
          day: this.day,
          chaosLevel: this.chaosLevel
        });
        npc.chatTimer = 3000;
      }
    }
  }

  endDay() {
    let baseMoney = 500 + (this.performance * 5);
    if (this.player.ownedItemIds.includes('macro_script')) {
      baseMoney = Math.floor(baseMoney * 1.15);
    }

    // 壓力紅利：壓力越低，獎金加成越高
    let stressBonus = 1.0;
    if (this.player.stats.stress === 0) {
      stressBonus = 1.5; // 壓力 0 獎金 1.5 倍
      this.addNotification("✨ 達成：究極摸魚聖境！獎金大幅提升！");
    } else if (this.player.stats.stress < 20) {
      stressBonus = 1.2;
    }

    const initialStress = this.player.stats.stress;

    const summary = {
      prevDay: this.day,
      moneyEarned: Math.floor(baseMoney * stressBonus * (1 / this.currentEvent.stressMult)),
      stressChange: 0,
      performance: this.performance,
      wasCaught: false,
      rank: this.performance > 100 ? 'S' : this.performance > 70 ? 'A' : 'B'
    };

    const oldWorkload = Math.min(8, 3 + Math.floor((this.day - 1) / 2));
    this.day += 1;
    const newWorkload = Math.min(8, 3 + Math.floor((this.day - 1) / 2));

    this.chaosLevel = 0;
    this.activityThisDay = 0;
    this.performance = 0;

    if (newWorkload > oldWorkload) {
      const msg = `📈 門檻提高！今日需完成 ${newWorkload} 件事才能下班。`;
      this.addNotification(msg);
      this.lastEvent = msg;
    }

    this.currentEvent = DAILY_EVENTS[Math.floor(Math.random() * DAILY_EVENTS.length)];
    this.addNotification(`📅 今日狀態：${this.currentEvent.name}`);

    // --- 動態 NPC 出勤邏輯 ---
    this.refreshAttendance();

    if (!this.lastEvent || !this.lastEvent.includes("門檻提高")) {
        this.lastEvent = `今日：${this.currentEvent.name}`;
    }

    // 精力恢復與加成
    let energyRecovery = 100;
    let stressRelief = -10; // 基礎減壓從 -20 減少至 -10
    if (this.player.ownedItemIds.includes('ergo_pillow')) {
      energyRecovery += 20;
      stressRelief -= 10;
      this.addNotification("💤 人體工學靠枕：恢復額外精力");
    }
    this.player.stats.energy = Math.min(this.player.stats.maxEnergy, this.player.stats.energy + energyRecovery);
    this.player.stats.modifyStress(stressRelief);
    this.player.stats.modifyMoney(summary.moneyEarned);

    const dist = Math.abs(this.player.gridX - this.boss.gridX) + Math.abs(this.player.gridY - this.boss.gridY);
    if (dist === 0) {
      this.player.stats.modifyStress(50);
      this.player.stats.modifyMoney(-300);
      summary.moneyEarned -= 300;
      summary.wasCaught = true;
      this.addNotification("😨 糟糕！被老闆堵個正著！");
    }

    summary.stressChange = this.player.stats.stress - initialStress;
    (summary as any).notifications = [...this.notifications];
    return summary;
  }

  /**
   * 刷新當日出勤名單並記錄所有缺席原因
   */
  public refreshAttendance() {
    if (!this.fullColleaguePool || this.fullColleaguePool.length === 0) return;

    // 隨機抽選 60%-75% 的同事上班
    const attendanceRate = 0.6 + Math.random() * 0.15;
    const activeCount = Math.max(1, Math.floor(this.fullColleaguePool.length * attendanceRate));

    // 洗牌
    const shuffled = [...this.fullColleaguePool].sort(() => Math.random() - 0.5);

    // 設定今日出勤者
    this.colleagues = shuffled.slice(0, activeCount).map(c => c.clone());

    // 隨機選擇 2 位缺席者記錄原因 (保持日誌清爽)
    const absentColleagues = shuffled.slice(activeCount);
    if (absentColleagues.length > 0) {
      const luckyAbsentPool = [...absentColleagues].sort(() => Math.random() - 0.5).slice(0, 2);
      luckyAbsentPool.forEach(npc => {
        const reason = ABSENCE_REASONS[Math.floor(Math.random() * ABSENCE_REASONS.length)];
        this.addNotification(`📍 ${npc.name} ${reason}`);
      });
    }
  }

  clone(): GameManager {
    const cloned = new GameManager(
        this.player.clone(),
        this.colleagues.map(c => c.clone()),
        this.boss.clone(),
        this.plant.clone(),
        this.day,
        this.chaosLevel,
        this.fullColleaguePool.map(c => c.clone())
    );
    cloned.lastEvent = this.lastEvent;
    cloned.notifications = [...this.notifications];
    cloned.activityThisDay = this.activityThisDay;
    cloned.performance = this.performance;
    cloned.currentEvent = this.currentEvent;
    cloned.plant.boostTimer = this.plant.boostTimer;
    cloned.stressAccumulator = this.stressAccumulator;
    cloned.handIds = [...this.handIds];
    return cloned;
  }
}
