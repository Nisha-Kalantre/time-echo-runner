import { useState, useEffect, useRef } from 'react';
import { levels } from '@/game/levels';

interface Props {
  onStartLevel: (level: number) => void;
  unlockedLevels: number;
  cheatsActive: boolean;
  onCheatActivated: () => void;
}

const MainMenu = ({ onStartLevel, unlockedLevels, cheatsActive, onCheatActivated }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cheatRef = useRef('');
  const [showLevels, setShowLevels] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const pts: { x: number; y: number; vx: number; vy: number; s: number; a: number }[] = [];
    for (let i = 0; i < 50; i++) {
      pts.push({ x: Math.random() * 800, y: Math.random() * 600, vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5, s: Math.random() * 2 + 1, a: Math.random() * 0.5 + 0.1 });
    }
    let go = 0, raf: number;
    const draw = () => {
      ctx.fillStyle = '#050510'; ctx.fillRect(0, 0, 800, 600);
      go = (go + 0.2) % 60;
      ctx.strokeStyle = 'rgba(0,255,255,0.03)'; ctx.lineWidth = 1;
      for (let x = -go; x < 800; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 600); ctx.stroke(); }
      for (let y = -go; y < 600; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(800, y); ctx.stroke(); }
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = 800; if (p.x > 800) p.x = 0;
        if (p.y < 0) p.y = 600; if (p.y > 600) p.y = 0;
        ctx.globalAlpha = p.a; ctx.fillStyle = '#00ffff'; ctx.shadowColor = '#00ffff'; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      cheatRef.current = (cheatRef.current + e.key.toUpperCase()).slice(-10);
      if (cheatRef.current.includes('TIMEMASTER')) onCheatActivated();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCheatActivated]);

  const max = cheatsActive ? levels.length : unlockedLevels;

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} width={800} height={600} className="absolute inset-0 w-full h-full object-cover" />
      <div className="relative z-10 text-center">
        <h1 className="text-6xl font-bold mb-2 tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif', color: '#00ffff', textShadow: '0 0 30px rgba(0,255,255,0.5), 0 0 60px rgba(0,255,255,0.2)' }}>
          TIME CLONE
        </h1>
        <h2 className="text-3xl font-bold mb-8 tracking-[0.3em]" style={{ fontFamily: 'Orbitron, sans-serif', color: '#ff44ff', textShadow: '0 0 20px rgba(255,0,255,0.4)' }}>
          RUNNER
        </h2>
        {cheatsActive && <div className="mb-4 text-sm font-mono" style={{ color: '#00ff88' }}>★ TIMEMASTER MODE ACTIVE ★</div>}
        {!showLevels ? (
          <div className="space-y-4">
            <button onClick={() => onStartLevel(0)} className="block mx-auto px-8 py-3 text-lg font-mono tracking-wider border-2 rounded transition-all duration-200 hover:scale-105" style={{ borderColor: '#00ffff', color: '#00ffff', background: 'rgba(0,255,255,0.05)', textShadow: '0 0 10px rgba(0,255,255,0.5)', boxShadow: '0 0 15px rgba(0,255,255,0.1), inset 0 0 15px rgba(0,255,255,0.05)' }}>
              START GAME
            </button>
            <button onClick={() => setShowLevels(true)} className="block mx-auto px-6 py-2 text-sm font-mono tracking-wider border rounded transition-all duration-200 hover:scale-105" style={{ borderColor: '#ff44ff', color: '#ff44ff', background: 'rgba(255,0,255,0.05)' }}>
              SELECT LEVEL
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {levels.map((level, i) => (
              <button key={i} disabled={i >= max} onClick={() => onStartLevel(i)}
                className="block mx-auto px-6 py-2 text-sm font-mono tracking-wider border rounded transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105"
                style={{ borderColor: i < max ? '#00ffff' : '#333', color: i < max ? '#00ffff' : '#333', background: 'rgba(0,255,255,0.05)' }}>
                {i + 1}. {level.name.toUpperCase()}
              </button>
            ))}
            <button onClick={() => setShowLevels(false)} className="block mx-auto px-4 py-1 text-xs font-mono mt-4" style={{ color: '#666' }}>BACK</button>
          </div>
        )}
        <p className="mt-8 text-xs font-mono" style={{ color: 'rgba(0,255,255,0.3)' }}>WASD/Arrows to Move · Space to Jump · Shift to Dash</p>
      </div>
    </div>
  );
};

export default MainMenu;
