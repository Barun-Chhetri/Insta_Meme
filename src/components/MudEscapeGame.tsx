import React, { useState, useEffect, useRef } from 'react';
import { soundEngine } from '../audio/soundEngine';

interface MudEscapeGameProps {
  fishCount: number;
  onEscapeSuccess: () => void;
  onEscapeFail: () => void;
}

export const MudEscapeGame: React.FC<MudEscapeGameProps> = ({
  fishCount,
  onEscapeSuccess,
  onEscapeFail
}) => {
  const [throttle, setThrottle] = useState<number>(0); // 0 - 100
  const [momentum, setMomentum] = useState<number>(15); // 0 - 100
  const [gear, setGear] = useState<'D' | 'R'>('D');
  const [timeLeft, setTimeLeft] = useState<number>(16);
  const [isPressingGas, setIsPressingGas] = useState<boolean>(false);
  const [isSpinningOut, setIsSpinningOut] = useState<boolean>(false);
  const [dialogueAlert, setDialogueAlert] = useState<string>('“Don’t you get stuck in that mud!”');

  const gasRef = useRef<boolean>(false);
  gasRef.current = isPressingGas;

  const targetZone = { min: 38, max: 68 };

  useEffect(() => {
    // 1-second countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onEscapeFail();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onEscapeFail]);

  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let revSoundTime = 0;

    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // Update throttle
      setThrottle(prev => {
        let next = prev;
        if (gasRef.current) {
          next += 130 * dt;
        } else {
          next -= 110 * dt;
        }
        return Math.max(0, Math.min(100, next));
      });

      // Physics logic
      setThrottle(currThrottle => {
        const inGreen = currThrottle >= targetZone.min && currThrottle <= targetZone.max;
        const isRedline = currThrottle > 82;

        if (isRedline) {
          setIsSpinningOut(true);
          soundEngine.playMudSplat();
          setDialogueAlert('“You’re just spinning your wheels, son!”');
        } else {
          setIsSpinningOut(false);
        }

        setMomentum(prevMom => {
          let nextMom = prevMom;
          if (inGreen) {
            nextMom += 22 * dt; // solid traction!
            if (Math.random() < 0.05) {
              setDialogueAlert('“That’s it, rock it back and forth!”');
            }
          } else if (isRedline) {
            nextMom -= 18 * dt; // sinking in mud
          } else {
            nextMom -= 8 * dt; // settling back in rut
          }

          if (nextMom >= 100) {
            soundEngine.playVictory();
            onEscapeSuccess();
            return 100;
          }
          if (nextMom <= 0) {
            return 0;
          }
          return nextMom;
        });

        return currThrottle;
      });

      // Engine sound
      if (gasRef.current) {
        revSoundTime += dt;
        if (revSoundTime > 0.14) {
          soundEngine.playEngineRev(throttle / 100);
          revSoundTime = 0;
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    // Keyboard support: Space or ArrowUp for gas, 'G' for gear shift
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        setIsPressingGas(true);
      }
      if (e.code === 'KeyG' || e.code === 'ArrowDown') {
        e.preventDefault();
        setGear(prev => (prev === 'D' ? 'R' : 'D'));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        setIsPressingGas(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onEscapeSuccess, targetZone.min, targetZone.max, throttle]);

  return (
    <div className="mud-escape-modal">
      <div className="mud-escape-card">
        <div className="mud-header">
          <span className="mud-badge">🛞 ESCAPE THE MUD DITCH! ({fishCount} Fish Loaded)</span>
          <span className="timer-badge">⏱️ {timeLeft}s LEFT</span>
        </div>

        <div className="owner-speech-bubble">
          <span className="owner-avatar">👴</span>
          <p className="owner-bubble-text">{dialogueAlert}</p>
        </div>

        {/* Visual mud pit & truck representation */}
        <div className="mud-pit-visual">
          <div className="truck-body-visual">
            <span className="truck-graphic">🛻</span>
            {isSpinningOut && <span className="mud-splat-spray">💨 🟤 🟤</span>}
          </div>
          <div className="mud-ground-layer">
            <div className="mud-trench">
              <span className="clay-text">GEORGIA RED CLAY RUT</span>
            </div>
          </div>
        </div>

        {/* Momentum escape bar */}
        <div className="gauge-row">
          <span className="gauge-label">ESCAPE MOMENTUM</span>
          <span className="gauge-value" style={{ color: '#10b981' }}>{Math.round(momentum)}%</span>
        </div>
        <div className="momentum-track">
          <div
            className="momentum-fill"
            style={{ width: `${momentum}%` }}
          />
        </div>

        {/* Throttle RPM & Traction Sweet Spot */}
        <div className="gauge-row" style={{ marginTop: '12px' }}>
          <span className="gauge-label">
            THROTTLE / TRACTION {isSpinningOut && <span className="redline-warn">REDLINE! SPINNING TIRES!</span>}
          </span>
          <span className="gauge-value" style={{ color: isSpinningOut ? '#ef4444' : '#f59e0b' }}>
            {Math.round(throttle)}%
          </span>
        </div>
        <div className="throttle-track">
          {/* Green traction sweet spot */}
          <div
            className="throttle-sweet-spot"
            style={{
              left: `${targetZone.min}%`,
              width: `${targetZone.max - targetZone.min}%`
            }}
          >
            <span className="traction-text">TRACTION ZONE</span>
          </div>

          {/* Needle */}
          <div
            className={`throttle-needle ${isSpinningOut ? 'needle-shake' : ''}`}
            style={{ left: `${throttle}%` }}
          />
        </div>

        {/* Controls */}
        <div className="mud-controls-row">
          <button
            className={`gear-toggle-btn ${gear === 'R' ? 'reverse-active' : ''}`}
            onClick={() => setGear(prev => (prev === 'D' ? 'R' : 'D'))}
          >
            GEAR: [{gear}] (ROCK)
          </button>

          <button
            className={`gas-pedal-btn ${isPressingGas ? 'pedal-down' : ''}`}
            onMouseDown={() => setIsPressingGas(true)}
            onMouseUp={() => setIsPressingGas(false)}
            onTouchStart={() => setIsPressingGas(true)}
            onTouchEnd={() => setIsPressingGas(false)}
          >
            {isPressingGas ? '🔥 GASSING IT!' : 'PRESS GAS (SPACEBAR)'}
          </button>
        </div>

        <p className="mud-hint">
          Keep the needle in the <strong>TRACTION ZONE</strong> to rock out! Don't hold it to maximum or tires will dig deeper!
        </p>
      </div>
    </div>
  );
};
