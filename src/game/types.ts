export interface Vec2 { x: number; y: number; }

export interface Platform {
  x: number; y: number; w: number; h: number;
  moving?: boolean;
  moveAxis?: 'x' | 'y';
  moveRange?: number;
  moveSpeed?: number;
  origX?: number;
  origY?: number;
  moveDir?: number;
}

export interface Switch {
  x: number; y: number; w: number; h: number;
  id: string; activated: boolean;
}

export interface Door {
  x: number; y: number; w: number; h: number;
  switchId: string; open: boolean;
}

export interface Collectible {
  x: number; y: number; w: number; h: number;
  collected: boolean;
}

export interface Laser {
  x: number; y: number; w: number; h: number;
  switchId: string;
}

export interface Goal {
  x: number; y: number; w: number; h: number;
}

export interface Level {
  name: string;
  width: number;
  height: number;
  platforms: Platform[];
  switches: Switch[];
  doors: Door[];
  lasers: Laser[];
  collectibles: Collectible[];
  goal: Goal;
  playerStart: Vec2;
  maxClones: number;
  cloneInterval: number;
}

export interface Clone {
  positions: Vec2[];
  currentFrame: number;
  active: boolean;
}

export interface PlayerState {
  x: number; y: number;
  vx: number; vy: number;
  width: number; height: number;
  onGround: boolean;
  facingRight: boolean;
  dashing: boolean;
  dashTimer: number;
  dashCooldown: number;
  health: number;
}

export interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  color: string; size: number;
}

export interface GameState {
  player: PlayerState;
  clones: Clone[];
  movementHistory: Vec2[];
  level: Level;
  timer: number;
  cloneSpawnTimer: number;
  gameOver: boolean;
  levelComplete: boolean;
  glitchDamageCount: number;
  collectiblesFound: number;
  totalCollectibles: number;
}

export interface ScoreResult {
  timeBonus: number;
  cloneBonus: number;
  damageBonus: number;
  collectibleBonus: number;
  total: number;
  rank: Rank;
}

export type Rank = 'Bronze' | 'Silver' | 'Gold' | 'Time Master';
