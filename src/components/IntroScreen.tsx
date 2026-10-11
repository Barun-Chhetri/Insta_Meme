import React, { useState } from 'react';
import { Play, Volume2, VolumeX, BookOpen } from 'lucide-react';

interface IntroScreenProps {
  onStartGame: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  highScore: number;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({
  onStartGame,
  isMuted,
  onToggleMute,
  highScore,
}) => {
  const [showLore, setShowLore] = useState<boolean>(false);

  return (
    <div className="intro-container">
      {/* Sound toggle at top right */}
      <div className="intro-topbar">
        <button className="sound-toggle-btn" onClick={onToggleMute}>
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          <span>{isMuted ? 'SOUND MUTED' : 'SOUND ON'}</span>
        </button>
      </div>

      {/* Main Title Banner */}
      <div className="title-banner">
        <div className="title-tag">THE VIRAL MEME FISHING GAME</div>
        <h1 className="main-title">
          WHO TOLD YOU YOU COULD FISH HERE?
        </h1>
        <p className="main-subtitle">
          “You came for the fish. You stayed for the argument.”
        </p>
      </div>

      {/* Visual teaser illustration card */}
      <div className="preview-card">
        <div className="preview-banner-img-wrap">
          <img src="/banner.jpg" alt="Who Told You You Could Fish Here Meme Game" className="preview-banner-img" />
        </div>

        <div className="preview-quote">
          “State property?! This? It ain’t. He called me and said: <strong>LOCK ’EM UP!</strong>”
        </div>
      </div>

      {/* Controls & Instructions summary */}
      <div className="instructions-box">
        <h3 className="instructions-title">HOW TO PLAY:</h3>
        <ul className="instructions-list">
          <li>
            <strong>1. Fish the pond:</strong> Click or press <strong>SPACE</strong> to cast and reel in retention monsters!
          </li>
          <li>
            <strong>2. Survive the argument:</strong> Balance the Owner’s <strong>Anger</strong> and your <strong>Audacity</strong>.
          </li>
          <li>
            <strong>3. Iconic “Hit the Road”:</strong> Argue about the missing sign, claim public rights, or sneak casts behind his back!
          </li>
          <li>
            <strong>4. Muddy Escape:</strong> Rock your truck out of Georgia red clay without getting stuck!
          </li>
        </ul>
      </div>

      {/* Start Button */}
      <div className="start-actions">
        <button className="start-game-btn" onClick={onStartGame}>
          <Play size={26} fill="currentColor" />
          <span>START FISHING</span>
        </button>

        <button className="lore-btn" onClick={() => setShowLore(!showLore)}>
          <BookOpen size={18} />
          <span>{showLore ? 'HIDE MEME ORIGIN' : 'THE VIRAL MEME ORIGIN'}</span>
        </button>
      </div>

      {highScore > 0 && (
        <div className="high-score-banner">
          🏆 YOUR BEST SCORE: <strong>{highScore.toLocaleString()} PTS</strong>
        </div>
      )}

      {/* Lore modal / expand */}
      {showLore && (
        <div className="lore-card">
          <h4 className="lore-heading">📖 The Real Story Behind the Meme</h4>
          <p className="lore-text">
            In the legendary viral TikTok/YouTube clip, a fisherman sets up at a roadside drainage pond right next to a Tractor Supply store, thinking it’s open public water. Suddenly, an older property owner drives up in a truck, walks up in overalls, and demands:
          </p>
          <div className="lore-quotes">
            <p>“You got permission?”</p>
            <p>“I thought it was state property.”</p>
            <p>“State? This? It ain’t! Tractor Supply owns this pond right here.”</p>
            <p>“You said Tractor Supply owns this pond right here?”</p>
            <p>“I’m his daddy. He called me and said, <em>‘Lock ’em up.’</em>”</p>
            <p>“LOCK ’EM UP?!”</p>
            <p>“HIT THE ROAD! Don’t get stuck in that mud!”</p>
          </div>
          <p className="lore-text">
            This game turns that legendary awkward, hilarious standoff into a fully playable comedic battle!
          </p>
        </div>
      )}
    </div>
  );
};
