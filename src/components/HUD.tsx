import React from 'react';
import { Volume2, VolumeX, Music, HelpCircle, Trophy } from 'lucide-react';

interface HUDProps {
  score: number;
  fishCount: number;
  totalWeight: number;
  anger: number;
  audacity: number;
  hitTheRoadCount: number;
  isMuted: boolean;
  isMusicPlaying: boolean;
  onToggleMute: () => void;
  onToggleMusic: () => void;
  onOpenHelp: () => void;
  onOpenScores: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  fishCount,
  totalWeight,
  anger,
  audacity,
  hitTheRoadCount,
  isMuted,
  isMusicPlaying,
  onToggleMute,
  onToggleMusic,
  onOpenHelp,
  onOpenScores
}) => {
  // Anger color
  const getAngerColor = () => {
    if (anger > 75) return '#ef4444';
    if (anger > 45) return '#f97316';
    if (anger > 20) return '#f59e0b';
    return '#10b981';
  };

  return (
    <header className="game-hud">
      {/* Left side: Fish cooler & Score */}
      <div className="hud-group">
        <div className="hud-pill fish-pill">
          <span className="hud-icon">🧊</span>
          <div className="hud-text-stack">
            <span className="hud-val">{fishCount} FISH</span>
            <span className="hud-sub">{totalWeight.toFixed(1)} LBS</span>
          </div>
        </div>

        <div className="hud-pill score-pill">
          <span className="hud-label">SCORE</span>
          <span className="hud-val">{score.toLocaleString()}</span>
        </div>
      </div>

      {/* Center: Meters (Anger & Audacity) */}
      <div className="hud-group hud-center">
        {/* Anger meter */}
        <div className="hud-meter-wrap">
          <div className="meter-label-row">
            <span className="meter-title">OWNER ANGER</span>
            <span className="meter-num" style={{ color: getAngerColor() }}>
              {Math.round(anger)}%
            </span>
          </div>
          <div className="meter-bar-track">
            <div
              className={`meter-bar-fill ${anger > 80 ? 'pulse-anger' : ''}`}
              style={{
                width: `${anger}%`,
                backgroundColor: getAngerColor()
              }}
            />
          </div>
        </div>

        {/* Audacity meter */}
        <div className="hud-meter-wrap">
          <div className="meter-label-row">
            <span className="meter-title">AUDACITY</span>
            <span className="meter-num" style={{ color: '#38bdf8' }}>
              {Math.round(audacity)}
            </span>
          </div>
          <div className="meter-bar-track">
            <div
              className="meter-bar-fill"
              style={{
                width: `${Math.min(100, audacity)}%`,
                backgroundColor: '#38bdf8'
              }}
            />
          </div>
        </div>
      </div>

      {/* Right: Hit the road counter & Audio controls */}
      <div className="hud-group hud-right">
        {hitTheRoadCount > 0 && (
          <div className="hit-pill">
            <span className="hit-badge-txt">HIT THE ROAD:</span>
            <span className="hit-badge-num">x{hitTheRoadCount}</span>
          </div>
        )}

        <div className="hud-actions">
          <button
            className="hud-btn"
            onClick={onToggleMusic}
            title={isMusicPlaying ? 'Stop Banjo Music' : 'Play Banjo Music'}
          >
            <Music size={17} className={isMusicPlaying ? 'text-amber' : ''} />
          </button>

          <button
            className="hud-btn"
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>

          <button
            className="hud-btn"
            onClick={onOpenScores}
            title="High Scores / Records"
          >
            <Trophy size={17} />
          </button>

          <button
            className="hud-btn"
            onClick={onOpenHelp}
            title="How to Play"
          >
            <HelpCircle size={17} />
          </button>
        </div>
      </div>
    </header>
  );
};
