import { GameState, Clone, Particle, Level, ScoreResult, Rank } from './types';

const GRAVITY = 0.55;
const JUMP_FORCE = -10.5;
const MOVE_SPEED = 3.5;
const DASH_SPEED = 9;
const DASH_DURATION = 10;
const DASH_COOLDOWN = 45;
const PLAYER_W = 18;
const PLAYER_H = 28;

export class GameEngine {
  state: GameState;
  keys: Set<string> = new Set();
  particles: Particle[] = [];
  frameCount = 0;
  cloneSpawnFlash = 0;

  constructor(level: Level) {
    this.state = this.initState(level);
  }

  private initState(level: Level): GameState {
    const l = JSON.parse(JSON.stringify(level)) as Level;
    return {
      player: {
        x: l.playerStart.x, y: l.playerStart.y,
        vx: 0, vy: 0,
        width: PLAYER_W, height: PLAYER_H,
        onGround: false, facingRight: true,
        dashing: false, dashTimer: 0, dashCooldown: 0,
        health: 100,
      },
      clones: [],
      movementHistory: [],
      level: l,
      timer: 0,
      cloneSpawnTimer: 0,
      gameOver: false,
      levelComplete: false,
      glitchDamageCount: 0,
      collectiblesFound: 0,
      totalCollectibles: l.collectibles.length,
    };
  }

  update() {
    if (this.state.gameOver || this.state.levelComplete) return;

    this.frameCount++;
    this.state.timer++;
    if (this.cloneSpawnFlash > 0) this.cloneSpawnFlash--;

    this.updateMovingPlatforms();

    const p = this.state.player;

    // Input
    if (!p.dashing) {
      const left = this.keys.has('ArrowLeft') || this.keys.has('a');
      const right = this.keys.has('ArrowRight') || this.keys.has('d');

      if (left && !right) { p.vx = -MOVE_SPEED; p.facingRight = false; }
      else if (right && !left) { p.vx = MOVE_SPEED; p.facingRight = true; }
      else { p.vx *= 0.65; if (Math.abs(p.vx) < 0.1) p.vx = 0; }

      const jump = this.keys.has(' ') || this.keys.has('ArrowUp') || this.keys.has('w');
      if (jump && p.onGround) {
        p.vy = JUMP_FORCE;
        p.onGround = false;
        this.spawnParticles(p.x + p.width / 2, p.y + p.height, 5, '#00ffff', 2);
      }

      if (this.keys.has('Shift') && p.dashCooldown <= 0) {
        p.dashing = true;
        p.dashTimer = DASH_DURATION;
        p.dashCooldown = DASH_COOLDOWN;
        p.vx = p.facingRight ? DASH_SPEED : -DASH_SPEED;
        p.vy = 0;
        this.spawnParticles(p.x + p.width / 2, p.y + p.height / 2, 8, '#ff00ff', 3);
      }
    }

    if (p.dashing) {
      p.dashTimer--;
      if (p.dashTimer <= 0) p.dashing = false;
      if (this.frameCount % 2 === 0) {
        this.spawnParticles(p.facingRight ? p.x : p.x + p.width, p.y + p.height / 2, 2, '#ff00ff', 2);
      }
    }
    if (p.dashCooldown > 0) p.dashCooldown--;

    if (!p.dashing) {
      p.vy += GRAVITY;
      if (p.vy > 14) p.vy = 14;
    }

    const cols = this.getCollidables();

    // Move X
    p.x += p.vx;
    for (const c of cols) {
      if (this.overlaps(p.x, p.y, p.width, p.height, c.x, c.y, c.w, c.h)) {
        if (p.vx > 0) p.x = c.x - p.width;
        else if (p.vx < 0) p.x = c.x + c.w;
        p.vx = 0;
      }
    }

    // Move Y
    p.y += p.vy;
    p.onGround = false;
    for (const c of cols) {
      if (this.overlaps(p.x, p.y, p.width, p.height, c.x, c.y, c.w, c.h)) {
        if (p.vy > 0) { p.y = c.y - p.height; p.onGround = true; }
        else if (p.vy < 0) { p.y = c.y + c.h; }
        p.vy = 0;
      }
    }

    // Carry on moving platforms
    if (p.onGround) {
      for (const plat of this.state.level.platforms) {
        if (plat.moving && plat.moveDir !== undefined && plat.moveSpeed &&
          this.overlaps(p.x, p.y + 1, p.width, p.height, plat.x, plat.y, plat.w, plat.h)) {
          if (plat.moveAxis === 'x') p.x += plat.moveSpeed * plat.moveDir;
          else if (plat.moveAxis === 'y') p.y += plat.moveSpeed * plat.moveDir;
        }
      }
    }

    this.state.movementHistory.push({ x: p.x, y: p.y });

    // Clone spawn
    this.state.cloneSpawnTimer++;
    if (this.state.cloneSpawnTimer >= this.state.level.cloneInterval &&
      this.state.clones.length < this.state.level.maxClones) {
      this.spawnClone();
    }

    // Update clones
    for (const clone of this.state.clones) {
      if (clone.active && clone.currentFrame < clone.positions.length - 1) {
        clone.currentFrame++;
      }
    }

    this.updateSwitches();
    this.updateDoors();
    this.checkLasers();
    this.checkCollectibles();
    this.checkCloneCollision();
    this.checkGoal();

    if (p.y > this.state.level.height + 100) this.state.gameOver = true;
    if (p.health <= 0) this.state.gameOver = true;

    this.updateParticles();
  }

  private overlaps(ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  private getCollidables() {
    const r: { x: number; y: number; w: number; h: number }[] = [...this.state.level.platforms];
    for (const d of this.state.level.doors) { if (!d.open) r.push(d); }
    return r;
  }

  private updateMovingPlatforms() {
    for (const pl of this.state.level.platforms) {
      if (!pl.moving || pl.moveDir === undefined || !pl.moveSpeed || !pl.moveRange || pl.origX === undefined || pl.origY === undefined) continue;
      if (pl.moveAxis === 'x') {
        pl.x += pl.moveSpeed * pl.moveDir;
        if (pl.x > pl.origX + pl.moveRange) pl.moveDir = -1;
        if (pl.x < pl.origX) pl.moveDir = 1;
      } else {
        pl.y += pl.moveSpeed * pl.moveDir;
        if (pl.y > pl.origY + pl.moveRange) pl.moveDir = -1;
        if (pl.y < pl.origY) pl.moveDir = 1;
      }
    }
  }

  private updateSwitches() {
    const p = this.state.player;
    for (const sw of this.state.level.switches) {
      sw.activated = false;
      if (this.overlaps(p.x, p.y, p.width, p.height, sw.x, sw.y, sw.w, sw.h)) sw.activated = true;
      for (const cl of this.state.clones) {
        if (!cl.active) continue;
        const pos = cl.positions[cl.currentFrame];
        if (pos && this.overlaps(pos.x, pos.y, p.width, p.height, sw.x, sw.y, sw.w, sw.h)) sw.activated = true;
      }
    }
  }

  private updateDoors() {
    for (const d of this.state.level.doors) {
      const sw = this.state.level.switches.find(s => s.id === d.switchId);
      d.open = sw ? sw.activated : false;
    }
  }

  private checkLasers() {
    const p = this.state.player;
    for (const laser of this.state.level.lasers) {
      const sw = this.state.level.switches.find(s => s.id === laser.switchId);
      const active = sw ? !sw.activated : true;
      if (active && this.overlaps(p.x, p.y, p.width, p.height, laser.x, laser.y, laser.w, laser.h)) {
        p.health -= 1;
        this.state.glitchDamageCount++;
        if (this.frameCount % 8 === 0) this.spawnParticles(p.x + p.width / 2, p.y + p.height / 2, 3, '#ff0044', 2);
      }
    }
  }

  private checkCollectibles() {
    const p = this.state.player;
    for (const c of this.state.level.collectibles) {
      if (!c.collected && this.overlaps(p.x, p.y, p.width, p.height, c.x, c.y, c.w, c.h)) {
        c.collected = true;
        this.state.collectiblesFound++;
        this.spawnParticles(c.x + c.w / 2, c.y + c.h / 2, 10, '#ffcc00', 3);
      }
    }
  }

  private checkCloneCollision() {
    const p = this.state.player;
    for (const cl of this.state.clones) {
      if (!cl.active) continue;
      const pos = cl.positions[cl.currentFrame];
      if (pos && this.overlaps(p.x, p.y, p.width, p.height, pos.x, pos.y, p.width, p.height)) {
        if (this.frameCount % 30 === 0) {
          p.health -= 2;
          this.state.glitchDamageCount++;
          this.spawnParticles(p.x + p.width / 2, p.y + p.height / 2, 6, '#ff00ff', 2);
        }
      }
    }
  }

  private checkGoal() {
    const p = this.state.player;
    const g = this.state.level.goal;
    if (this.overlaps(p.x, p.y, p.width, p.height, g.x, g.y, g.w, g.h)) {
      this.state.levelComplete = true;
      this.spawnParticles(g.x + g.w / 2, g.y + g.h / 2, 20, '#00ff88', 4);
    }
  }

  private spawnClone() {
    const clone: Clone = { positions: [...this.state.movementHistory], currentFrame: 0, active: true };
    this.state.clones.push(clone);
    this.state.cloneSpawnTimer = 0;
    this.cloneSpawnFlash = 15;
    this.spawnParticles(this.state.player.x, this.state.player.y, 15, '#00ffff', 3);
  }

  private spawnParticles(x: number, y: number, count: number, color: string, size: number) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4,
        life: 30 + Math.random() * 20, maxLife: 50,
        color, size: size * (0.5 + Math.random()),
      });
    }
  }

  private updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx; pt.y += pt.vy; pt.life--;
      if (pt.life <= 0) this.particles.splice(i, 1);
    }
  }

  getState(): GameState { return this.state; }

  getScore(): ScoreResult {
    const timeSec = this.state.timer / 60;
    const timeBonus = Math.max(0, Math.floor(1000 - timeSec * 10));
    const cloneBonus = Math.max(0, 500 - this.state.clones.length * 100);
    const damageBonus = this.state.glitchDamageCount === 0 ? 300 : Math.max(0, 300 - this.state.glitchDamageCount * 5);
    const collectibleBonus = this.state.totalCollectibles > 0
      ? Math.floor((this.state.collectiblesFound / this.state.totalCollectibles) * 500) : 0;
    const total = timeBonus + cloneBonus + damageBonus + collectibleBonus;
    let rank: Rank = 'Bronze';
    if (total >= 2000) rank = 'Time Master';
    else if (total >= 1500) rank = 'Gold';
    else if (total >= 1000) rank = 'Silver';
    return { timeBonus, cloneBonus, damageBonus, collectibleBonus, total, rank };
  }
}
