import { useEffect, useRef } from 'react';
import { GameEngine } from '@/game/engine';
import { GameRenderer } from '@/game/renderer';
import { levels } from '@/game/levels';
import { ScoreResult } from '@/game/types';

interface Props {
  levelIndex: number;
  onComplete: (score: ScoreResult) => void;
  onGameOver: () => void;
  onQuit: () => void;
}

const GameCanvas = ({ levelIndex, onComplete, onGameOver, onQuit }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onComplete, onGameOver, onQuit });
  cbRef.current = { onComplete, onGameOver, onQuit };

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const engine = new GameEngine(levels[levelIndex]);
    const renderer = new GameRenderer(ctx);
    const keys = new Set<string>();
    let done = false, dead = false;

    const kd = (e: KeyboardEvent) => {
      if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
      keys.add(e.key);
      if (e.key === 'Escape') cbRef.current.onQuit();
    };
    const ku = (e: KeyboardEvent) => keys.delete(e.key);
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);

    let raf: number;
    const loop = () => {
      engine.keys = keys;
      engine.update();
      renderer.render(engine.getState(), engine.particles, engine.cloneSpawnFlash);
      const s = engine.getState();
      if (s.levelComplete && !done) { done = true; setTimeout(() => cbRef.current.onComplete(engine.getScore()), 600); }
      if (s.gameOver && !dead) { dead = true; setTimeout(() => cbRef.current.onGameOver(), 600); }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => { cancelAnimationFrame(raf); window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); };
  }, [levelIndex]);

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#050510' }}>
      <div className="relative">
        <canvas ref={canvasRef} width={800} height={500}
          className="rounded-lg"
          style={{ border: '1px solid rgba(0,255,255,0.2)', boxShadow: '0 0 30px rgba(0,255,255,0.1)' }}
        />
        <div className="absolute -bottom-7 left-0 right-0 text-center">
          <span className="text-[10px] font-mono" style={{ color: 'rgba(0,255,255,0.3)' }}>
            WASD/Arrows: Move · Space: Jump · Shift: Dash · ESC: Menu
          </span>
        </div>
      </div>
    </div>
  );
};

export default GameCanvas;
