import React, { useState, useEffect } from 'react';
import type { DialogueChoice, DialogueScene } from '../types/game';
import { soundEngine } from '../audio/soundEngine';

interface DialogueBoxProps {
  currentScene: DialogueScene;
  hitTheRoadCount: number;
  anger: number;
  audacity: number;
  onChoiceSelect: (choice: DialogueChoice) => void;
  onSneakCast: () => void;
  canSneakCast: boolean;
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({
  currentScene,
  hitTheRoadCount,
  anger,
  audacity,
  onChoiceSelect,
  onSneakCast,
  canSneakCast,
}) => {
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Typewriter effect with comedic timing
  useEffect(() => {
    let index = 0;
    const fullText = currentScene.ownerLine;
    setDisplayedText('');
    setIsTyping(true);
    setIsPaused(false);

    // If scene requires a dramatic pause (like "I'm his daddy"), insert comedic delay
    if (fullText.includes('I’m his daddy') || fullText.includes('Lock ’em up')) {
      setIsPaused(true);
      soundEngine.playCrickets();
      const timeout = setTimeout(() => {
        setIsPaused(false);
      }, 700);
      return () => clearTimeout(timeout);
    }

    const interval = setInterval(() => {
      index++;
      setDisplayedText(fullText.slice(0, index));
      if (index >= fullText.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 22);

    return () => clearInterval(interval);
  }, [currentScene]);

  // Determine owner portrait emoji / expression
  const getOwnerEmoji = () => {
    switch (currentScene.ownerMood) {
      case 'furious':
        return '🤬';
      case 'flabbergasted':
        return '🤯';
      case 'phone':
        return '📱👴';
      case 'confused':
        return '🤨';
      default:
        return '👴';
    }
  };

  const getOwnerName = () => {
    if (anger > 60) return "TRACTOR SUPPLY'S DADDY (FURIOUS)";
    if (currentScene.ownerMood === 'phone') return "TRACTOR SUPPLY'S DADDY (CALLING SHERIFF)";
    return "TRACTOR SUPPLY'S DADDY";
  };

  return (
    <div className="dialogue-container">
      {/* Top dialogue bar info */}
      <div className="dialogue-header">
        <div className="speaker-tag">
          <span className="speaker-icon">{getOwnerEmoji()}</span>
          <span className="speaker-name">{getOwnerName()}</span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {hitTheRoadCount > 0 && (
            <div className="hit-counter-pill">
              🔥 “HIT THE ROAD!”: <strong>{hitTheRoadCount}</strong>
            </div>
          )}
          <div className="audacity-tag" style={{ display: 'flex', alignItems: 'center', padding: '4px 10px', fontSize: '11px' }}>
            🕶️ Audacity: <strong>{audacity}</strong>
          </div>
        </div>
      </div>

      {/* Owner speech bubble */}
      <div className={`owner-speech-card ${anger > 60 ? 'border-furious' : ''}`}>
        <p className="owner-text">
          {displayedText}
          {isTyping && <span className="typing-cursor">▌</span>}
        </p>
      </div>

      {/* Player Response Choices */}
      {!isPaused && !isTyping && (
        <div className="choices-grid">
          {currentScene.choices.map((choice, idx) => (
            <button
              key={idx}
              className={`choice-button ${choice.hitTheRoad ? 'choice-provocative' : ''} ${choice.leadsToEscape ? 'choice-escape' : ''}`}
              onClick={() => onChoiceSelect(choice)}
            >
              <div className="choice-text-wrap">
                <span className="choice-num">{idx + 1}.</span>
                <span className="choice-content">{choice.text}</span>
              </div>
              <div className="choice-meta">
                {choice.angerDelta > 0 && (
                  <span className="anger-tag">+{choice.angerDelta}% Anger</span>
                )}
                {choice.audacityDelta > 0 && (
                  <span className="audacity-tag">+{choice.audacityDelta} Audacity</span>
                )}
                {choice.leadsToEscape && (
                  <span className="escape-tag">🛻 Head to Truck</span>
                )}
              </div>
            </button>
          ))}

          {/* SNEAK A CAST BUTTON */}
          {canSneakCast && (
            <button
              className="sneak-cast-button"
              onClick={onSneakCast}
              title="Cast your rod behind his back while he's talking!"
            >
              <span className="sneak-icon">🎣</span>
              <span className="sneak-label">SNEAK A CAST WHILE HE’S TALKING! (+35 Audacity)</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
