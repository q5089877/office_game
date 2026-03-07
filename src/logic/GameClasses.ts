/**
 * 搞笑版辦公室生存 - 遊戲核心邏輯 (RPG 模式)
 */

export enum EntityType {
  PLAYER = 'PLAYER',
  COLLEAGUE = 'COLLEAGUE',
  BOSS = 'BOSS',
  PLANT = 'PLANT',
}

export enum CardRarity {
  C = 'C', B = 'B', A = 'A', S = 'S',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
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

  constructor(id: string, name: string, type: EntityType, stats?: Stats, x: number = 0, y: number = 0, gender: Gender = Gender.MALE) {
    super(id, name, type, gender);
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
      this.isMoving = false;
      this.bobOffset = 0;
    }
    if (!this.isMoving && Math.random() < 0.005) this.wander();
  }

  wander() {
    // 讓 NPC 同事遊蕩時有極低機率移動到植物座標 (10, 0)
    const isCaringPlant = this.type === EntityType.COLLEAGUE && Math.random() < 0.01;
    if (isCaringPlant) {
      this.gridX = 10;
      this.gridY = 0;
      return;
    }

    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    const dir = directions[Math.floor(Math.random() * directions.length)];
    this.gridX = Math.max(0, Math.min(10, this.gridX + dir[0]));
    this.gridY = Math.max(0, Math.min(6, this.gridY + dir[1]));
  }

  move(newX: number, newY: number) { this.gridX = newX; this.gridY = newY; }

  clone(): Character {
    const c = new Character(this.id, this.name, this.type, this.stats.clone(), this.gridX, this.gridY, this.gender);
    c.displayX = this.displayX; 
    c.displayY = this.displayY;
    c.homeX = this.homeX; 
    c.homeY = this.homeY;
    
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
  public baseMoveSpeed: number = 0.05;

  constructor(x: number, y: number) {
    super('boss', '大老闆', EntityType.BOSS, Gender.MALE);
    this.gridX = x; this.gridY = y;
    this.displayX = x; this.displayY = y;
  }

  tick(day: number = 1) {
    const currentSpeed = 0.08 * (1 + (day - 1) * 0.1);
    const dx = this.gridX - this.displayX;
    const dy = this.gridY - this.displayY;
    
    if (Math.abs(dx) > 0.01) this.displayX += dx * currentSpeed;
    if (Math.abs(dy) > 0.01) this.displayY += dy * currentSpeed;
    
    if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01 && Math.random() < 0.02 * (1 + day * 0.1)) {
      const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      const dir = directions[Math.floor(Math.random() * directions.length)];
      this.gridX = Math.max(0, Math.min(10, this.gridX + dir[0]));
      this.gridY = Math.max(0, Math.min(6, this.gridY + dir[1]));
    }
  }

  move(newX: number, newY: number) { this.gridX = newX; this.gridY = newY; }
}

export class Plant extends BaseEntity {
  public gridX: number; public gridY: number;
  public displayX: number; public displayY: number;

  constructor(x: number, y: number) {
    super('plant', '舒壓植栽', EntityType.PLANT, Gender.MALE);
    this.gridX = x; this.gridY = y;
    this.displayX = x; this.displayY = y;
  }

  tick() {
    // 植物不會移動，但可以有輕微的呼吸律動感 (透過 display 座標)
    this.displayX = this.gridX;
    this.displayY = this.gridY;
  }
}

export class GameManager {
  public player: Character;
  public colleagues: Character[];
  public boss: Boss;
  public plant: Plant;
  public day: number = 1;
  public chaosLevel: number = 0;
  public activityThisDay: number = 0;
  public performance: number = 0;
  public lastEvent: string | null = "歡迎來到摸魚辦公室！新的一天開始了。";
  public handIds: string[] = []; 

  constructor(player?: Character, colleagues?: Character[], boss?: Boss, plant?: Plant, day?: number, chaosLevel?: number) {
    this.player = player || new Character('player', '你', EntityType.PLAYER);
    this.colleagues = colleagues || [];
    this.boss = boss || new Boss(5, 0);
    this.plant = plant || new Plant(10, 0);
    this.day = day || 1; 
    this.chaosLevel = chaosLevel || 0;
  }

  tick() {
    this.player.tick(16);
    this.colleagues.forEach(c => c.tick(16));
    this.boss.tick(this.day);
    this.plant.tick();
  }

  endDay() {
    const summary = {
      prevDay: this.day,
      moneyEarned: 500 + (this.performance * 5),
      stressChange: -20,
      performance: this.performance,
      wasCaught: false,
      rank: this.performance > 100 ? 'S' : this.performance > 70 ? 'A' : 'B'
    };

    this.day += 1;
    this.chaosLevel = 0;
    this.activityThisDay = 0;
    this.performance = 0;
    
    const recovery = Math.max(20, 100 - this.player.stats.stress);
    this.player.stats.modifyEnergy(recovery);
    this.player.stats.modifyMoney(summary.moneyEarned);

    const dist = Math.abs(this.player.gridX - this.boss.gridX) + Math.abs(this.player.gridY - this.boss.gridY);
    if (dist === 0) {
      this.player.stats.modifyStress(50); 
      this.player.stats.modifyMoney(-300);
      summary.moneyEarned -= 300;
      summary.wasCaught = true;
    }

    return summary;
  }

  clone(): GameManager {
    const cloned = new GameManager(
      this.player.clone(), 
      this.colleagues.map(c => c.clone()), 
      new Boss(this.boss.gridX, this.boss.gridY), 
      new Plant(this.plant.gridX, this.plant.gridY), 
      this.day, 
      this.chaosLevel
    );
    cloned.lastEvent = this.lastEvent;
    cloned.activityThisDay = this.activityThisDay || 0;
    cloned.performance = this.performance || 0;
    cloned.boss.displayX = this.boss.displayX; 
    cloned.boss.displayY = this.boss.displayY;
    cloned.plant.displayX = this.plant.displayX; 
    cloned.plant.displayY = this.plant.displayY;
    cloned.handIds = [...this.handIds];
    return cloned;
  }
}
