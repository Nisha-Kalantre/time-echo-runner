import { GameState, Particle } from './types';

const CW = 800;
const CH = 500;

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private gridOff = 0;

  constructor(ctx: CanvasRenderingContext2D) { this.ctx = ctx; }

  render(state: GameState, particles: Particle[], flash: number) {
    const ctx = this.ctx;
    const p = state.player;
    const camX = Math.max(0, Math.min(p.x - CW / 2 + p.width / 2, state.level.width - CW));
    const camY = 0;

    // BG
    ctx.fillStyle = '#080818';
    ctx.fillRect(0, 0, CW, CH);

    // Grid
    this.gridOff = (this.gridOff + 0.3) % 40;
    ctx.strokeStyle = 'rgba(0,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let x = -this.gridOff; x < CW; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CH); ctx.stroke();
    }
    for (let y = -this.gridOff; y < CH; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CW, y); ctx.stroke();
    }

    ctx.save();
    ctx.translate(-camX, -camY);

    // Platforms
    for (const pl of state.level.platforms) this.drawPlatform(pl.x, pl.y, pl.w, pl.h);

    // Switches
    for (const sw of state.level.switches) this.drawSwitch(sw.x, sw.y, sw.w, sw.h, sw.activated);

    // Doors
    for (const d of state.level.doors) { if (!d.open) this.drawDoor(d.x, d.y, d.w, d.h); }

    // Lasers
    for (const laser of state.level.lasers) {
      const sw = state.level.switches.find(s => s.id === laser.switchId);
      if (sw ? !sw.activated : true) this.drawLaser(laser.x, laser.y, laser.w, laser.h);
    }

    // Collectibles
    for (const c of state.level.collectibles) { if (!c.collected) this.drawCollectible(c.x, c.y, c.w); }

    // Goal
    this.drawGoal(state.level.goal);

    // Clones
    for (const cl of state.clones) {
      if (!cl.active) continue;
      const pos = cl.positions[cl.currentFrame];
      if (pos) this.drawClone(pos.x, pos.y, p.width, p.height);
    }

    // Particles
    for (const pt of particles) {
      const a = pt.life / pt.maxLife;
      ctx.globalAlpha = a;
      ctx.fillStyle = pt.color;
      ctx.shadowColor = pt.color;
      ctx.shadowBlur = 6;
      ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
    }
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;

    // Player
    this.drawPlayer(p.x, p.y, p.width, p.height, p.facingRight, p.dashing);

    ctx.restore();

    // Flash
    if (flash > 0) {
      ctx.fillStyle = `rgba(0,255,255,${flash / 30})`;
      ctx.fillRect(0, 0, CW, CH);
    }

    this.drawHUD(state);
  }

  private drawPlatform(x: number, y: number, w: number, h: number) {
    const ctx = this.ctx;
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(x, y, w, h);
    ctx.shadowColor = '#00ccff'; ctx.shadowBlur = 8;
    ctx.strokeStyle = '#00ccff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(0,200,255,0.3)'; ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
  }

  private drawSwitch(x: number, y: number, w: number, h: number, on: boolean) {
    const ctx = this.ctx;
    const col = on ? '#00ff88' : '#ff8800';
    ctx.fillStyle = on ? '#003322' : '#332200';
    ctx.fillRect(x, y, w, h);
    ctx.shadowColor = col; ctx.shadowBlur = 10;
    ctx.strokeStyle = col; ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    ctx.shadowBlur = 0;
  }

  private drawDoor(x: number, y: number, w: number, h: number) {
    const ctx = this.ctx;
    ctx.fillStyle = '#2a1a1a'; ctx.fillRect(x, y, w, h);
    ctx.shadowColor = '#ff4444'; ctx.shadowBlur = 8;
    ctx.strokeStyle = '#ff4444'; ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,68,68,0.4)'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y); ctx.lineTo(x + w, y + h);
    ctx.moveTo(x + w, y); ctx.lineTo(x, y + h);
    ctx.stroke();
  }

  private drawLaser(x: number, y: number, w: number, h: number) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(255,0,50,0.3)'; ctx.fillRect(x, y, w, h);
    ctx.shadowColor = '#ff0032'; ctx.shadowBlur = 15;
    ctx.fillStyle = 'rgba(255,0,50,0.6)'; ctx.fillRect(x + w / 4, y, w / 2, h);
    ctx.shadowBlur = 0;
  }

  private drawCollectible(x: number, y: number, w: number) {
    const ctx = this.ctx;
    const cx = x + w / 2, cy = y + w / 2;
    const bob = Math.sin(Date.now() / 300) * 3;
    ctx.save();
    ctx.translate(cx, cy + bob);
    ctx.rotate(Date.now() / 500);
    ctx.shadowColor = '#ffcc00'; ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.moveTo(0, -w / 2); ctx.lineTo(w / 2, 0);
    ctx.lineTo(0, w / 2); ctx.lineTo(-w / 2, 0);
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  private drawGoal(g: { x: number; y: number; w: number; h: number }) {
    const ctx = this.ctx;
    const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
    ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 20 * pulse;
    ctx.fillStyle = `rgba(0,255,136,${0.2 * pulse})`;
    ctx.fillRect(g.x - 5, g.y - 5, g.w + 10, g.h + 10);
    ctx.strokeStyle = '#00ff88'; ctx.lineWidth = 2;
    ctx.strokeRect(g.x, g.y, g.w, g.h);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#00ff88'; ctx.font = '20px monospace'; ctx.textAlign = 'center';
    ctx.fillText('⟐', g.x + g.w / 2, g.y + g.h / 2 + 7);
    ctx.textAlign = 'left';
  }

  private drawClone(x: number, y: number, w: number, h: number) {
    const ctx = this.ctx;
    const gx = (Math.random() - 0.5) * 2;
    ctx.globalAlpha = 0.4;
    ctx.shadowColor = '#00ffff'; ctx.shadowBlur = 12;
    ctx.fillStyle = '#00ccff';
    ctx.fillRect(x + gx, y, w, h);
    if (Math.random() > 0.7) {
      ctx.fillStyle = 'rgba(255,0,255,0.3)';
      ctx.fillRect(x - 3, y + Math.random() * h, w + 6, 2);
    }
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
  }

  private drawPlayer(x: number, y: number, w: number, h: number, right: boolean, dash: boolean) {
    const ctx = this.ctx;
    ctx.shadowColor = dash ? '#ff00ff' : '#00ffff';
    ctx.shadowBlur = dash ? 15 : 8;
    ctx.fillStyle = dash ? '#ff44ff' : '#00eeff';
    ctx.fillRect(x, y, w, h);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff';
    ctx.fillRect(right ? x + w * 0.6 : x + w * 0.2, y + 6, 4, 4);
    ctx.fillStyle = dash ? 'rgba(255,0,255,0.6)' : 'rgba(0,255,255,0.6)';
    ctx.fillRect(x + 2, y + 5, w - 4, 2);
  }

  private drawHUD(state: GameState) {
    const ctx = this.ctx;
    const ts = (state.timer / 60).toFixed(1);

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(10, 10, 150, 36);
    ctx.strokeStyle = '#00ccff'; ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, 150, 36);
    ctx.font = '13px "Share Tech Mono", monospace';
    ctx.fillStyle = '#00ffff'; ctx.textAlign = 'left';
    ctx.fillText(`TIME: ${ts}s`, 20, 33);

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(170, 10, 130, 36);
    ctx.strokeStyle = '#00ccff'; ctx.strokeRect(170, 10, 130, 36);
    ctx.fillStyle = '#00ffff';
    ctx.fillText(`CLONES: ${state.clones.filter(c => c.active).length}/${state.level.maxClones}`, 180, 33);

    // HP
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(310, 10, 110, 36);
    ctx.strokeStyle = '#00ccff'; ctx.strokeRect(310, 10, 110, 36);
    const hp = state.player.health / 100;
    const hc = hp > 0.5 ? '#00ff88' : hp > 0.25 ? '#ffcc00' : '#ff4444';
    ctx.fillStyle = 'rgba(50,50,50,0.5)'; ctx.fillRect(320, 22, 90, 10);
    ctx.fillStyle = hc; ctx.fillRect(320, 22, 90 * Math.max(0, hp), 10);
    ctx.font = '9px "Share Tech Mono", monospace';
    ctx.fillStyle = hc; ctx.fillText('HP', 320, 18);

    // Collectibles
    if (state.totalCollectibles > 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(430, 10, 90, 36);
      ctx.strokeStyle = '#ffcc00'; ctx.strokeRect(430, 10, 90, 36);
      ctx.fillStyle = '#ffcc00'; ctx.font = '13px "Share Tech Mono", monospace';
      ctx.fillText(`◆ ${state.collectiblesFound}/${state.totalCollectibles}`, 440, 33);
    }

    // Clone timer bar
    const sp = state.cloneSpawnTimer / state.level.cloneInterval;
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(CW - 110, 10, 100, 6);
    ctx.fillStyle = '#00ccff'; ctx.fillRect(CW - 110, 10, 100 * sp, 6);
    ctx.font = '8px "Share Tech Mono", monospace';
    ctx.fillStyle = '#00ccff'; ctx.textAlign = 'right';
    ctx.fillText('NEXT CLONE', CW - 10, 28);

    ctx.font = '9px "Share Tech Mono", monospace';
    ctx.fillStyle = 'rgba(0,255,255,0.4)';
    ctx.fillText(state.level.name.toUpperCase(), CW - 10, 42);
    ctx.textAlign = 'left';
  }
}
