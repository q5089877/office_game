/**
 * 搞笑版辦公室生存 - 遊戲核心邏輯 (RPG 模式)
 */

export enum EntityType {
  PLAYER = 'PLAYER',
  COLLEAGUE = 'COLLEAGUE',
  BOSS = 'BOSS',
  CAT = 'CAT',
}

export enum CardRarity {
  C = 'C', B = 'B', A = 'A', S = 'S',
}

export class Stats {
  constructor(
    public energy: number = 100,
    public stress: number = 0,
    public money: number = 0,
    public maxEnergy: number = 100
  ) {}

  modifyEnergy(amount: number) { this.energy = Math.min(this.maxEnergy, Math.max(0, this.energy + amount)); }
  modifyStress(amount: number) { this.stress = Math.max(0, this.stress + amount); }
  modifyMoney(amount: number) { this.money += amount; }
  clone(): Stats { return new Stats(this.energy, this.stress, this.money, this.maxEnergy); }
}

export abstract class BaseEntity {
  constructor(
    public readonly id: string,
    public name: string,
    public readonly type: EntityType
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

  constructor(id: string, name: string, type: EntityType, stats?: Stats, x: number = 0, y: number = 0) {
    super(id, name, type);
    this.stats = stats || new Stats();
    this.gridX = x; this.gridY = y;
    this.displayX = x; this.displayY = y;
    this.homeX = x; this.homeY = y;
  }

  tick(deltaTime: number) {
    const moveSpeed = 0.1;
    const dx = this.gridX - this.displayX;
    const dy = this.gridY - this.displayY;
    if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
      this.displayX += dx * moveSpeed;
      this.displayY += dy * moveSpeed;
      this.isMoving = true;
      this.bobOffset = Math.sin(Date.now() * 0.01) * 5;
    } else {
      this.displayX = this.gridX; this.displayY = this.gridY;
      this.isMoving = false; this.bobOffset = 0;
    }
    if (!this.isMoving && Math.random() < 0.005) this.wander();
  }

  wander() {
    const shouldGoHome = Math.random() > 0.5;
    if (shouldGoHome) { this.gridX = this.homeX; this.gridY = this.homeY; }
    else {
      const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      const dir = directions[Math.floor(Math.random() * directions.length)];
      this.gridX = Math.max(0, Math.min(5, this.gridX + dir[0]));
      this.gridY = Math.max(0, Math.min(4, this.gridY + dir[1]));
    }
  }

  move(newX: number, newY: number) { this.gridX = newX; this.gridY = newY; }

  clone(): Character {
    const c = new Character(this.id, this.name, this.type, this.stats.clone(), this.gridX, this.gridY);
    c.displayX = this.displayX; 
    c.displayY = this.displayY;
    c.homeX = this.homeX; 
    c.homeY = this.homeY;
    
    // 顯式複製 RPG 數值，避免使用危險的 JSON.stringify
    const source = this as any;
    const target = c as any;
    target.xp = source.xp || 0;
    target.level = source.level || 1;
    target.mp = source.mp !== undefined ? source.mp : 100;
    target.maxMp = source.maxMp || 100;
    target.luck = source.luck || 5;
    target.charisma = source.charisma || 10;
    
    return c;
  }
}

export class Boss extends BaseEntity {
  public gridX: number; public gridY: number;
  public displayX: number; public displayY: number;

  constructor(x: number, y: number) {
    super('boss', '大老闆', EntityType.BOSS);
    this.gridX = x; this.gridY = y;
    this.displayX = x; this.displayY = y;
  }

  tick() {
    const moveSpeed = 0.05;
    const dx = this.gridX - this.displayX;
    const dy = this.gridY - this.displayY;
    if (Math.abs(dx) > 0.01) this.displayX += dx * moveSpeed;
    if (Math.abs(dy) > 0.01) this.displayY += dy * moveSpeed;
    
    if (Math.abs(dx) < 0.01 && Math.random() < 0.002) {
      const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      const dir = directions[Math.floor(Math.random() * directions.length)];
      this.gridX = Math.max(0, Math.min(5, this.gridX + dir[0]));
      this.gridY = Math.max(0, Math.min(4, this.gridY + dir[1]));
    }
  }

  move(newX: number, newY: number) { this.gridX = newX; this.gridY = newY; }
}

export class Cat extends BaseEntity {
  public gridX: number; public gridY: number;
  public displayX: number; public displayY: number;

  constructor(x: number, y: number) {
    super('cat', '主子', EntityType.CAT);
    this.gridX = x; this.gridY = y;
    this.displayX = x; this.displayY = y;
  }

  tick() {
    const moveSpeed = 0.03;
    const dx = this.gridX - this.displayX;
    const dy = this.gridY - this.displayY;
    if (Math.abs(dx) > 0.01) this.displayX += dx * moveSpeed;
    if (Math.abs(dy) > 0.01) this.displayY += dy * moveSpeed;

    if (Math.abs(dx) < 0.01 && Math.random() < 0.01) {
      const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      const dir = directions[Math.floor(Math.random() * directions.length)];
      this.gridX = Math.max(0, Math.min(5, this.gridX + dir[0]));
      this.gridY = Math.max(0, Math.min(4, this.gridY + dir[1]));
    }
  }
}

export class GameManager {
  public player: Character;
  public colleagues: Character[];
  public boss: Boss;
  public cat: Cat;
  public day: number = 1;
  public chaosLevel: number = 0;
  public activityThisDay: number = 0;
  public lastEvent: string | null = "歡迎來到摸魚辦公室！主子正在巡視中。";
  public handIds: string[] = []; // 只存 ID，從 Card Pool 查找

  constructor(player?: Character, colleagues?: Character[], boss?: Boss, cat?: Cat, day?: number, chaosLevel?: number) {
    this.player = player || new Character('player', '你', EntityType.PLAYER);
    this.colleagues = colleagues || [];
    this.boss = boss || new Boss(2, 2);
    this.cat = cat || new Cat(4, 4);
    this.day = day || 1; 
    this.chaosLevel = chaosLevel || 0;
  }

  tick() {
    this.player.tick(16);
    this.colleagues.forEach(c => c.tick(16));
    this.boss.tick();
    this.cat.tick();
  }

  endDay() {
    this.day += 1;
    this.chaosLevel = 0;
    this.activityThisDay = 0;
    let newEvents: string[] = [];
    const recovery = Math.max(20, 100 - this.player.stats.stress);
    this.player.stats.modifyEnergy(recovery);
    this.player.stats.modifyMoney(100);

    this.colleagues.forEach(c => {
      if (c.stats.stress >= 100) {
        newEvents.push(`${c.name} 被抓到摸魚被罵！`);
        this.player.stats.modifyStress(15); c.stats.stress = 40;
      }
    });

    const dist = Math.abs(this.player.gridX - this.boss.gridX) + Math.abs(this.player.gridY - this.boss.gridY);
    if (dist === 0) {
      this.player.stats.modifyStress(50); this.player.stats.modifyMoney(-100);
      newEvents.push("被老闆抓包扣薪 $100！");
    }

    if (this.chaosLevel >= 100) { newEvents.push("辦公室太混亂，提早下班！"); this.chaosLevel = 0; }
    if (newEvents.length > 0) this.lastEvent = newEvents.join(" | "); else this.lastEvent = null;
  }

  clone(): GameManager {
    const cloned = new GameManager(
      this.player.clone(), 
      this.colleagues.map(c => c.clone()), 
      new Boss(this.boss.gridX, this.boss.gridY), 
      new Cat(this.cat.gridX, this.cat.gridY), 
      this.day, 
      this.chaosLevel
    );
    cloned.lastEvent = this.lastEvent;
    cloned.activityThisDay = this.activityThisDay || 0;
    cloned.boss.displayX = this.boss.displayX; 
    cloned.boss.displayY = this.boss.displayY;
    cloned.cat.displayX = this.cat.displayX; 
    cloned.cat.displayY = this.cat.displayY;
    cloned.handIds = [...this.handIds];
    return cloned;
  }
}
