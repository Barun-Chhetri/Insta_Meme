import React, { useState, useEffect, useRef } from 'react';
import { soundEngine } from '../audio/soundEngine';

interface ReelMinigameProps {
  onSuccess: () => void;
  onFail: () => void;
}

export const ReelMinigame: React.FC<ReelMinigameProps> = ({ onSuccess, onFail }) => {
  const [tension, setTension] = useState<number>(45); // 0 - 100
  const [progress, setProgress] = useState<number>(20); // 0 - 100
  const [isPulling, setIsPulling] = useState<boolean>(false);
  const [targetZone, setTargetZone] = useState<{ min: number; max: number }>({ min: 35, max: 70 });

  const pullRef = useRef<boolean>(false);
  pullRef.current = isPulling;

  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let soundTimer = 0;

    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // Update tension
      setTension(prev => {
        let next = prev;
        if (pullRef.current) {
          next += 95 * dt; // pulling adds tension
        } else {
          next -= 70 * dt; // fish / gravity relaxes tension
        }
        // Random fish jerk
        if (Math.random() < 0.08) {
          next += (Math.random() - 0.5) * 18;
        }
        return Math.max(0, Math.min(100, next));
      });

      // Update target zone shifting slowly
      setTargetZone(prev => {
        const drift = Math.sin(time * 0.002) * 0.4;
        const newMin = Math.max(20, Math.min(50, prev.min + drift));
        return { min: newMin, max: newMin + 35 };
      });

      // Check if current tension is inside green zone
      setTension(currTension => {
        const inZone = currTension >= targetZone.min && currTension <= targetZone.max;

        setProgress(prevProg => {
          let nextProg = prevProg;
          if (inZone) {
            nextProg += 28 * dt; // Progress builds!
          } else {
            nextProg -= 15 * dt; // Losing ground!
          }

          if (nextProg >= 100) {
            onSuccess();
            return 100;
          }
          if (nextProg <= 0) {
            onFail();
            return 0;
          }
          return nextProg;
        });

        // Line snap if maxed tension for too long
        if (currTension >= 98 && Math.random() < 0.05) {
          onFail();
        }

        return currTension;
      });

      // Sound reel clicker
      if (pullRef.current) {
        soundTimer += dt;
        if (soundTimer > 0.08) {
          soundEngine.playReelClick();
          soundTimer = 0;
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    // Keyboard support: Spacebar or Enter
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'KeyR') {
        e.preventDefault();
        setIsPulling(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'KeyR') {
        e.preventDefault();
        setIsPulling(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onSuccess, onFail, targetZone.min, targetZone.max]);

  const isDanger = tension > 88;
  const isInGreenZone = tension >= targetZone.min && tension <= targetZone.max;

  return (
    <div className="reel-modal-overlay">
      <div className="reel-card">
        <div className="reel-header">
          <span className="reel-badge">🎣 FISH ON THE LINE!</span>
          <h3 className="reel-title">KEEP TENSION IN THE GREEN ZONE!</h3>
        </div>

        {/* Catch Progress Bar */}
        <div className="reel-metric-row">
          <span className="reel-label">CATCH PROGRESS</span>
          <span className="reel-val">{Math.round(progress)}%</span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Tension Gauge */}
        <div className="reel-metric-row" style={{ marginTop: '14px' }}>
          <span className="reel-label">
            LINE TENSION {isDanger && <span className="danger-text">⚠️ SNAP RISK!</span>}
          </span>
          <span className="reel-val" style={{ color: isDanger ? '#ef4444' : isInGreenZone ? '#10b981' : '#f59e0b' }}>
            {Math.round(tension)}%
          </span>
        </div>

        <div className="tension-track">
          {/* Target green zone */}
          <div
            className="tension-sweet-spot"
            style={{
              left: `${targetZone.min}%`,
              width: `${targetZone.max - targetZone.min}%`
            }}
          >
            <span className="sweet-spot-label">SWEET SPOT</span>
          </div>

          {/* Current Tension Indicator needle */}
          <div
            className={`tension-indicator ${isDanger ? 'pulse-danger' : ''}`}
            style={{ left: `${tension}%` }}
          />
        </div>

        {/* Action button */}
        <button
          className={`reel-action-btn ${isPulling ? 'active' : ''}`}
          onMouseDown={() => setIsPulling(true)}
          onMouseUp={() => setIsPulling(false)}
          onTouchStart={() => setIsPulling(true)}
          onTouchEnd={() => setIsPulling(false)}
        >
          {isPulling ? '🎣 REELING IN!!' : 'HOLD TO REEL! (SPACEBAR)'}
        </button>

        <p className="reel-hint">
          Tip: Tap or hold rhythmically. Don’t let tension drop to zero or max out!
        </p>
      </div>
    </div>
  );
};
