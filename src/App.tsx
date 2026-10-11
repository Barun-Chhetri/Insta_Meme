import React, { useState, useEffect, useRef } from 'react';
import type { GameState, Fish, DialogueChoice, EndingDetails, EndingType } from './types/game';
import { getRandomFish } from './data/fishData';
import { DIALOGUE_TREE } from './data/dialogueTree';
import { ENDINGS_DATA } from './data/endingsData';
import { soundEngine } from './audio/soundEngine';

import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { DialogueBox } from './components/DialogueBox';
import { ReelMinigame } from './components/ReelMinigame';
import { MudEscapeGame } from './components/MudEscapeGame';
import { GameOverModal } from './components/GameOverModal';
import { IntroScreen } from './components/IntroScreen';
import { InfoModals } from './components/InfoModals';

export const App: React.FC = () => {
  // Game flow states
  const [gameState, setGameState] = useState<GameState>('INTRO');
  const [currentSceneId, setCurrentSceneId] = useState<string>('scene_start');

  // Stats & Meters
  const [score, setScore] = useState<number>(0);
  const [fishCaught, setFishCaught] = useState<Fish[]>([]);
  const [largestFish, setLargestFish] = useState<Fish | null>(null);
  const [ownerAnger, setOwnerAnger] = useState<number>(0); // 0 - 100
  const [audacity, setAudacity] = useState<number>(10);
  const [hitTheRoadCount, setHitTheRoadCount] = useState<number>(0);
  const [argumentsStarted, setArgumentsStarted] = useState<number>(0);

  // Fishing state
  const [hasBite, setHasBite] = useState<boolean>(false);
  const [isReeling, setIsReeling] = useState<boolean>(false);
  const [isCasting, setIsCasting] = useState<boolean>(false);
  const [recentCaughtFish, setRecentCaughtFish] = useState<Fish | null>(null);

  // Visual FX states
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [screenShake, setScreenShake] = useState<boolean>(false);
  const [hitTheRoadBanner, setHitTheRoadBanner] = useState<string | null>(null);
  const [dramaticCaption, setDramaticCaption] = useState<string | null>(null);

  // Audio states
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);

  // Modals & Endings
  const [currentEnding, setCurrentEnding] = useState<EndingDetails | null>(null);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [showScores, setShowScores] = useState<boolean>(false);
  const [highScore, setHighScore] = useState<number>(0);

  const biteTimeoutRef = useRef<number | null>(null);
  const ownerArrivalRef = useRef<number | null>(null);

  // Load high score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('instameme_high_score');
    if (saved) {
      setHighScore(parseInt(saved, 10) || 0);
    }
  }, []);

  // Save new high score
  const updateHighScoreIfNeeded = (finalScore: number) => {
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('instameme_high_score', finalScore.toString());
    }
  };

  // Start the Game from Intro screen
  const handleStartGame = () => {
    soundEngine.playCast();
    soundEngine.startCountryMusic();
    setIsMusicPlaying(true);

    setGameState('FISHING');
    setScore(0);
    setFishCaught([]);
    setLargestFish(null);
    setOwnerAnger(0);
    setAudacity(10);
    setHitTheRoadCount(0);
    setArgumentsStarted(0);
    setCurrentSceneId('scene_start');
    setCurrentEnding(null);

    // Schedule the first fish bite in 3.5 seconds
    scheduleBite(3500);

    // Schedule Owner's arrival in 8 seconds if not already triggered
    ownerArrivalRef.current = window.setTimeout(() => {
      triggerOwnerArrival();
    }, 8500);
  };

  // Trigger Owner arrival
  const triggerOwnerArrival = () => {
    if (gameState === 'GAME_OVER' || gameState === 'MUD_ESCAPE') return;
    soundEngine.playFootsteps();
    setCurrentSceneId('scene_start');
    setGameState('DIALOGUE');
  };

  // Schedule bite helper
  const scheduleBite = (delayMs: number) => {
    if (biteTimeoutRef.current) clearTimeout(biteTimeoutRef.current);
    biteTimeoutRef.current = window.setTimeout(() => {
      setHasBite(true);
      soundEngine.playBiteAlert();
    }, delayMs);
  };

  // Click on Canvas: Cast line or set hook
  const handleCanvasClick = () => {
    if (gameState === 'INTRO' || gameState === 'MUD_ESCAPE' || gameState === 'GAME_OVER') return;

    if (hasBite) {
      // Set the hook! Enter reeling mini-game
      setHasBite(false);
      setIsReeling(true);
      setGameState('REELING');
    } else if (!isReeling && !hasBite) {
      // Cast the line
      setIsCasting(true);
      soundEngine.playCast();
      setTimeout(() => setIsCasting(false), 500);
      scheduleBite(3000 + Math.random() * 3000);
    }
  };

  // Fish catch success
  const handleReelSuccess = () => {
    setIsReeling(false);
    soundEngine.playCatchSuccess();

    // Determine fish
    const fish = getRandomFish(audacity > 40);
    setRecentCaughtFish(fish);

    // Calculate score points with audacity multiplier
    const pointsEarned = fish.points + Math.round(audacity * 10);
    setScore(prev => prev + pointsEarned);

    setFishCaught(prev => {
      const nextList = [...prev, fish];
      return nextList;
    });

    setLargestFish(prev => {
      if (!prev || fish.weight > prev.weight) return fish;
      return prev;
    });

    // Check if player caught the legendary 10-lb retention monster!
    if (fish.id === 'ten_pounder' && (gameState === 'DIALOGUE' || currentSceneId !== 'scene_start')) {
      setTimeout(() => {
        triggerEnding('TEN_POUND_LEGEND');
      }, 1800);
      return;
    }

    // Dismiss recent fish banner after 2.5 seconds
    setTimeout(() => {
      setRecentCaughtFish(null);
    }, 2500);

    // If owner has arrived, return to dialogue, else return to peaceful fishing
    if (ownerArrivalRef.current && currentSceneId) {
      setGameState('DIALOGUE');
    } else {
      setGameState('FISHING');
      scheduleBite(4000);
    }
  };

  // Reeling failed
  const handleReelFail = () => {
    setIsReeling(false);
    setHasBite(false);
    // Line snapped or got away
    if (currentSceneId) {
      setGameState('DIALOGUE');
    } else {
      setGameState('FISHING');
      scheduleBite(4000);
    }
  };

  // Sneak Cast while owner is talking
  const handleSneakCast = () => {
    soundEngine.playCast();
    setAudacity(prev => prev + 35);
    setOwnerAnger(prev => Math.min(100, prev + 25));

    // Instant bite!
    setTimeout(() => {
      setHasBite(true);
      soundEngine.playBiteAlert();
      setTimeout(() => {
        setHasBite(false);
        setIsReeling(true);
        setGameState('REELING');
      }, 700);
    }, 1200);
  };

  // Dialogue choice selection
  const handleChoiceSelect = (choice: DialogueChoice) => {
    // Update anger and audacity
    const nextAnger = Math.max(0, Math.min(100, ownerAnger + choice.angerDelta));
    setOwnerAnger(nextAnger);
    setAudacity(prev => prev + choice.audacityDelta);
    setArgumentsStarted(prev => prev + 1);

    // Hit the road mechanic
    if (choice.hitTheRoad) {
      const nextCount = hitTheRoadCount + 1;
      setHitTheRoadCount(nextCount);
      soundEngine.playHitTheRoad();

      setHitTheRoadBanner(`“HIT THE ROAD!” x${nextCount}`);
      setScreenShake(true);
      setTimeout(() => {
        setScreenShake(false);
        setHitTheRoadBanner(null);
      }, 1400);

      // If ignored "Hit the road" 6+ times, player earns Argument Champion!
      if (nextCount >= 6) {
        setTimeout(() => {
          triggerEnding('ARGUMENT_CHAMPION');
        }, 1200);
        return;
      }
    }

    // "Lock 'Em Up" trigger
    if (choice.triggersLockEmUp) {
      soundEngine.playLockEmUpSting();
      setDramaticCaption('LOCK ’EM UP?!');
      setScreenShake(true);
      setTimeout(() => {
        setScreenShake(false);
        setDramaticCaption(null);
      }, 2000);
    }

    // Dramatic Zoom on Owner's face
    if (choice.triggersZoom) {
      setIsZoomed(true);
      setTimeout(() => {
        setIsZoomed(false);
      }, 1800);
    }

    // Check if Owner anger reached 100% -> Sirens & Arrest!
    if (nextAnger >= 100) {
      soundEngine.playSiren();
      soundEngine.playLockEmUpSting();
      setTimeout(() => {
        triggerEnding('LOCK_EM_UP');
      }, 1600);
      return;
    }

    // Custom ending from choice
    if (choice.customEnding) {
      triggerEnding(choice.customEnding);
      return;
    }

    // Leads to Muddy Escape mini-game
    if (choice.leadsToEscape) {
      setGameState('MUD_ESCAPE');
      return;
    }

    // Advance to next scene
    if (choice.nextSceneId && DIALOGUE_TREE[choice.nextSceneId]) {
      setCurrentSceneId(choice.nextSceneId);
    }
  };

  // Muddy Escape Success
  const handleMudEscapeSuccess = () => {
    // Determine ending
    if (largestFish && largestFish.id === 'ten_pounder') {
      triggerEnding('TEN_POUND_LEGEND');
    } else if (hitTheRoadCount >= 4) {
      triggerEnding('ARGUMENT_CHAMPION');
    } else {
      triggerEnding('PEACEFUL_EXIT');
    }
  };

  // Muddy Escape Fail
  const handleMudEscapeFail = () => {
    triggerEnding('MUD_DISASTER');
  };

  // Trigger Ending & Calculate Final Score
  const triggerEnding = (endingType: EndingType) => {
    const endingInfo = ENDINGS_DATA[endingType];
    setCurrentEnding(endingInfo);

    // Final bonus calculation
    let bonus = 0;
    if (endingType === 'TEN_POUND_LEGEND') bonus += 3500;
    if (endingType === 'ARGUMENT_CHAMPION') bonus += 2800;
    if (endingType === 'PEACEFUL_EXIT') bonus += 1200;
    if (endingType === 'LOCK_EM_UP') bonus += 500;

    const totalFinalScore = score + bonus + (audacity * 15) + (hitTheRoadCount * 250);
    setScore(totalFinalScore);
    updateHighScoreIfNeeded(totalFinalScore);

    setGameState('GAME_OVER');
  };

  // Restart Game
  const handleRestart = () => {
    handleStartGame();
  };

  // Audio toggles
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEngine.setMuted(nextMuted);
  };

  const handleToggleMusic = () => {
    if (isMusicPlaying) {
      soundEngine.stopCountryMusic();
      setIsMusicPlaying(false);
    } else {
      soundEngine.startCountryMusic();
      setIsMusicPlaying(true);
    }
  };

  // Current dialogue scene
  const currentScene = DIALOGUE_TREE[currentSceneId] || DIALOGUE_TREE['scene_start'];

  // Total catch weight
  const totalWeight = fishCaught.reduce((acc, f) => acc + f.weight, 0);

  return (
    <div className="game-app-root">
      {/* HUD Bar (Visible during gameplay) */}
      {gameState !== 'INTRO' && (
        <HUD
          score={score}
          fishCount={fishCaught.length}
          totalWeight={totalWeight}
          anger={ownerAnger}
          audacity={audacity}
          hitTheRoadCount={hitTheRoadCount}
          isMuted={isMuted}
          isMusicPlaying={isMusicPlaying}
          onToggleMute={handleToggleMute}
          onToggleMusic={handleToggleMusic}
          onOpenHelp={() => setShowHelp(true)}
          onOpenScores={() => setShowScores(true)}
        />
      )}

      {/* Main 2D Animated Scene Canvas */}
      <main className="game-stage">
        <GameCanvas
          gameState={gameState}
          ownerMood={currentScene.ownerMood}
          ownerAnger={ownerAnger}
          isReeling={isReeling}
          hasBite={hasBite}
          isCasting={isCasting}
          isZoomed={isZoomed}
          screenShake={screenShake}
          hitTheRoadText={hitTheRoadBanner}
          dramaticCaption={dramaticCaption}
          caughtFish={recentCaughtFish}
          onCanvasClick={handleCanvasClick}
        />

        {/* Fishing Click Hint Prompt */}
        {gameState === 'FISHING' && !hasBite && (
          <div className="canvas-tap-hint">
            🎣 Click anywhere on the water or press <strong>SPACE</strong> to cast!
          </div>
        )}

        {/* Bite Alert Banner */}
        {hasBite && (
          <div className="bite-alert-banner">
            ⚡ FISH BITE! CLICK NOW TO SET THE HOOK!
          </div>
        )}

        {/* Recent Fish Caught Banner */}
        {recentCaughtFish && (
          <div className="caught-fish-banner">
            <span className="caught-icon">{recentCaughtFish.icon}</span>
            <div className="caught-text-group">
              <span className="caught-title">CAUGHT: {recentCaughtFish.name}!</span>
              <span className="caught-desc">{recentCaughtFish.description} ({recentCaughtFish.weight} lbs, +{recentCaughtFish.points} pts)</span>
            </div>
          </div>
        )}

        {/* Dialogue Box (when in DIALOGUE state) */}
        {gameState === 'DIALOGUE' && (
          <DialogueBox
            currentScene={currentScene}
            hitTheRoadCount={hitTheRoadCount}
            anger={ownerAnger}
            audacity={audacity}
            onChoiceSelect={handleChoiceSelect}
            onSneakCast={handleSneakCast}
            canSneakCast={true}
          />
        )}
      </main>

      {/* Reeling Mini-Game Overlay */}
      {gameState === 'REELING' && (
        <ReelMinigame
          onSuccess={handleReelSuccess}
          onFail={handleReelFail}
        />
      )}

      {/* Mud Escape Mini-Game Overlay */}
      {gameState === 'MUD_ESCAPE' && (
        <MudEscapeGame
          fishCount={fishCaught.length}
          onEscapeSuccess={handleMudEscapeSuccess}
          onEscapeFail={handleMudEscapeFail}
        />
      )}

      {/* Intro Screen */}
      {gameState === 'INTRO' && (
        <IntroScreen
          onStartGame={handleStartGame}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          highScore={highScore}
        />
      )}

      {/* Game Over Screen */}
      {gameState === 'GAME_OVER' && currentEnding && (
        <GameOverModal
          ending={currentEnding}
          score={score}
          fishCaught={fishCaught}
          largestFish={largestFish}
          hitTheRoadCount={hitTheRoadCount}
          audacity={audacity}
          argumentsStarted={argumentsStarted}
          highScore={highScore}
          onRestart={handleRestart}
        />
      )}

      {/* Help & Records Modals */}
      <InfoModals
        showHelp={showHelp}
        showScores={showScores}
        highScore={highScore}
        onClose={() => {
          setShowHelp(false);
          setShowScores(false);
        }}
      />
    </div>
  );
};

export default App;
