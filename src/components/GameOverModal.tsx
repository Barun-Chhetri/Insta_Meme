import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { EndingDetails, Fish } from '../types/game';
import { RotateCcw, Share2, Award, Fish as FishIcon, AlertTriangle } from 'lucide-react';

interface GameOverModalProps {
  ending: EndingDetails;
  score: number;
  fishCaught: Fish[];
  largestFish: Fish | null;
  hitTheRoadCount: number;
  audacity: number;
  argumentsStarted: number;
  highScore: number;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  ending,
  score,
  fishCaught,
  largestFish,
  hitTheRoadCount,
  audacity,
  argumentsStarted,
  highScore,
  onRestart,
}) => {
  // Fire confetti if victory ending!
  useEffect(() => {
    if (ending.isVictory) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [ending.isVictory]);

  const copyShareText = () => {
    const text = `🎣 WHO TOLD YOU YOU COULD FISH HERE?
🏆 Ending: ${ending.title}
⭐ Final Score: ${score.toLocaleString()} pts
🐟 Fish Caught: ${fishCaught.length} (${largestFish ? largestFish.name : 'None'})
🔥 "Hit The Road" Ignored: ${hitTheRoadCount} times!
🕶️ Audacity: ${audacity}

Play the viral meme game now!`;
    navigator.clipboard.writeText(text);
    alert('Meme score copied to clipboard! Share it with your friends!');
  };

  const isNewRecord = score >= highScore && score > 0;

  return (
    <div className="modal-overlay">
      <div className="gameover-card">
        {/* Top badge */}
        <div className="ending-badge-banner" style={{ backgroundColor: ending.badgeColor }}>
          {ending.badge}
        </div>

        {/* Ending title & subtitle */}
        <h2 className="ending-title">{ending.title}</h2>
        <p className="ending-subtitle">{ending.subtitle}</p>

        {/* Meme Quote box */}
        <div className="meme-quote-box">
          <span className="quote-icon">💬</span>
          <p className="quote-text">{ending.memeQuote}</p>
        </div>

        {/* Narrative Description */}
        <p className="ending-description">{ending.description}</p>

        {/* Score & Record Banner */}
        <div className="final-score-section">
          <div className="score-stack">
            <span className="score-sub-label">FINAL SCORE</span>
            <span className="score-giant">{score.toLocaleString()}</span>
          </div>
          {isNewRecord && (
            <div className="record-badge">
              🌟 NEW HIGH SCORE!
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="stats-breakdown-grid">
          <div className="stat-card">
            <FishIcon size={18} className="stat-icon" />
            <span className="stat-card-title">FISH HAUL</span>
            <span className="stat-card-val">{fishCaught.length} caught</span>
            <span className="stat-card-sub">
              {largestFish ? `${largestFish.weight} lbs (${largestFish.name})` : 'Zero fish'}
            </span>
          </div>

          <div className="stat-card">
            <AlertTriangle size={18} className="stat-icon text-amber" />
            <span className="stat-card-title">HIT THE ROAD</span>
            <span className="stat-card-val">{hitTheRoadCount} times</span>
            <span className="stat-card-sub">ignored with a straight face</span>
          </div>

          <div className="stat-card">
            <Award size={18} className="stat-icon text-cyan" />
            <span className="stat-card-title">AUDACITY SCORE</span>
            <span className="stat-card-val">{audacity} pts</span>
            <span className="stat-card-sub">{argumentsStarted} arguments started</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="gameover-actions">
          <button className="replay-btn" onClick={onRestart}>
            <RotateCcw size={20} />
            <span>PLAY AGAIN</span>
          </button>

          <button className="share-btn" onClick={copyShareText}>
            <Share2 size={20} />
            <span>COPY MEME SCORE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
