import { useState, useCallback } from 'react';
import MainMenu from '@/components/game/MainMenu';
import GameCanvas from '@/components/game/GameCanvas';
import { ScoreResult, Rank } from '@/game/types';
import { levels } from '@/game/levels';

type Screen = 'menu' | 'game' | 'levelComplete' | 'gameOver';

const rankColors: Record<Rank, string> = {
  'Bronze': '#cd7f32', 'Silver': '#c0c0c0', 'Gold': '#ffd700', 'Time Master': '#00ffff',
};

const Index = () => {
  const [screen, setScreen] = useState<Screen>('menu');
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [unlockedLevels, setUnlockedLevels] = useState(1);
  const [cheatsActive, setCheatsActive] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleStartLevel = useCallback((level: number) => {
    setCurrentLevel(level);
    setRetryCount(c => c + 1);
    setScreen('game');
  }, []);

  const handleComplete = useCallback((result: ScoreResult) => {
    setScore(result);
    setScreen('levelComplete');
    setUnlockedLevels(prev => Math.max(prev, currentLevel + 2));
  }, [currentLevel]);

  const handleGameOver = useCallback(() => setScreen('gameOver'), []);
  const handleQuit = useCallback(() => setScreen('menu'), []);

  const handleRetry = useCallback(() => {
    setRetryCount(c => c + 1);
    setScreen('game');
  }, []);

  const handleNext = useCallback(() => {
    if (currentLevel + 1 < levels.length) {
      setCurrentLevel(currentLevel + 1);
      setRetryCount(c => c + 1);
      setScreen('game');
    } else setScreen('menu');
  }, [currentLevel]);

  if (screen === 'menu') {
    return <MainMenu onStartLevel={handleStartLevel} unlockedLevels={unlockedLevels} cheatsActive={cheatsActive} onCheatActivated={() => setCheatsActive(true)} />;
  }

  if (screen === 'game') {
    return <GameCanvas key={`${currentLevel}-${retryCount}`} levelIndex={currentLevel} onComplete={handleComplete} onGameOver={handleGameOver} onQuit={handleQuit} />;
  }

  if (screen === 'levelComplete' && score) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#050510' }}>
        <div className="text-center p-8 border rounded-lg" style={{ borderColor: '#00ffff', background: 'rgba(0,20,40,0.9)', boxShadow: '0 0 40px rgba(0,255,255,0.15)' }}>
          <h2 className="text-3xl font-bold mb-2 tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif', color: '#00ff88' }}>LEVEL COMPLETE</h2>
          <p className="text-sm font-mono mb-6" style={{ color: '#00ffff' }}>{levels[currentLevel].name.toUpperCase()}</p>
          <div className="text-left space-y-2 mb-6 font-mono text-sm" style={{ color: '#aaa' }}>
            <div className="flex justify-between gap-8"><span>Time Bonus:</span><span style={{ color: '#00ffff' }}>{score.timeBonus}</span></div>
            <div className="flex justify-between gap-8"><span>Clone Bonus:</span><span style={{ color: '#00ffff' }}>{score.cloneBonus}</span></div>
            <div className="flex justify-between gap-8"><span>No Damage:</span><span style={{ color: '#00ffff' }}>{score.damageBonus}</span></div>
            <div className="flex justify-between gap-8"><span>Collectibles:</span><span style={{ color: '#ffcc00' }}>{score.collectibleBonus}</span></div>
            <hr style={{ borderColor: '#333' }} />
            <div className="flex justify-between text-lg"><span>Total:</span><span style={{ color: '#00ff88' }}>{score.total}</span></div>
          </div>
          <div className="mb-6">
            <span className="text-2xl font-bold tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif', color: rankColors[score.rank], textShadow: `0 0 20px ${rankColors[score.rank]}40` }}>
              {score.rank.toUpperCase()}
            </span>
          </div>
          <div className="space-x-4">
            <button onClick={handleRetry} className="px-4 py-2 font-mono text-sm border rounded transition-all hover:scale-105" style={{ borderColor: '#ff44ff', color: '#ff44ff' }}>RETRY</button>
            {currentLevel + 1 < levels.length && (
              <button onClick={handleNext} className="px-4 py-2 font-mono text-sm border rounded transition-all hover:scale-105" style={{ borderColor: '#00ffff', color: '#00ffff' }}>NEXT LEVEL</button>
            )}
            <button onClick={handleQuit} className="px-4 py-2 font-mono text-sm border rounded transition-all hover:scale-105" style={{ borderColor: '#666', color: '#666' }}>MENU</button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'gameOver') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#050510' }}>
        <div className="text-center p-8 border rounded-lg" style={{ borderColor: '#ff4444', background: 'rgba(40,0,0,0.9)', boxShadow: '0 0 40px rgba(255,0,0,0.15)' }}>
          <h2 className="text-3xl font-bold mb-4 tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif', color: '#ff4444', textShadow: '0 0 20px rgba(255,0,0,0.4)' }}>TIME PARADOX</h2>
          <p className="text-sm font-mono mb-6" style={{ color: '#ff8888' }}>Reality collapsed. Try again.</p>
          <div className="space-x-4">
            <button onClick={handleRetry} className="px-6 py-2 font-mono text-sm border rounded transition-all hover:scale-105" style={{ borderColor: '#ff4444', color: '#ff4444' }}>RETRY</button>
            <button onClick={handleQuit} className="px-4 py-2 font-mono text-sm border rounded transition-all hover:scale-105" style={{ borderColor: '#666', color: '#666' }}>MENU</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Index;
