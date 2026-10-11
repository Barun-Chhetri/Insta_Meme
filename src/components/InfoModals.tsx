import React from 'react';
import { X, Trophy, HelpCircle } from 'lucide-react';

interface InfoModalsProps {
  showHelp: boolean;
  showScores: boolean;
  highScore: number;
  onClose: () => void;
}

export const InfoModals: React.FC<InfoModalsProps> = ({
  showHelp,
  showScores,
  highScore,
  onClose
}) => {
  if (!showHelp && !showScores) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="info-modal-card" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {showHelp && (
          <div>
            <div className="modal-title-row">
              <HelpCircle size={24} className="text-amber" />
              <h3>HOW TO PLAY & ENDINGS GUIDE</h3>
            </div>

            <div className="modal-section">
              <h4>🎯 Core Mechanics</h4>
              <p>• <strong>Fishing:</strong> Tap or click anywhere on the pond to cast your line. When a fish bites (<strong>!</strong> alert), reel it in by holding the tension in the green sweet spot!</p>
              <p>• <strong>The Confrontation:</strong> The owner will approach and question you. Each dialogue choice impacts his <strong>Anger</strong> and your <strong>Audacity</strong>.</p>
              <p>• <strong>Hit The Road:</strong> The more you argue, the more he screams "HIT THE ROAD!". See how high of a combo you can stack!</p>
              <p>• <strong>The Mud Escape:</strong> When you decide to leave, carefully modulate your throttle to rock out of the red clay ditch without getting stuck!</p>
            </div>

            <div className="modal-section">
              <h4>🏆 5 Secret Endings to Discover</h4>
              <ul className="endings-checklist">
                <li>🕊️ <strong>The Diplomatic Angler:</strong> Pack up politely early on.</li>
                <li>🏆 <strong>The Argument Champion:</strong> Push the owner past 6+ "Hit the roads" until he has a meltdown.</li>
                <li>👑 <strong>The 10-Pound Legend:</strong> Haul in the mythical 10.4-lb retention monster right in front of him!</li>
                <li>🛞 <strong>The Mud Disaster:</strong> Over-rev your truck and get buried to the frame in mud.</li>
                <li>🚨 <strong>Lock 'Em Up!:</strong> Max out his anger to 100% and keep fishing until the sheriff sirens arrive!</li>
              </ul>
            </div>
          </div>
        )}

        {showScores && (
          <div>
            <div className="modal-title-row">
              <Trophy size={24} className="text-amber" />
              <h3>HALL OF FAME & RECORDS</h3>
            </div>

            <div className="records-box">
              <div className="record-stat-row">
                <span>Personal Best Score:</span>
                <strong>{highScore > 0 ? `${highScore.toLocaleString()} PTS` : 'No games finished yet'}</strong>
              </div>
              <div className="record-stat-row">
                <span>Retention Pond Record:</span>
                <strong>10.4 LBS (The Mythical Catfish)</strong>
              </div>
              <div className="record-stat-row">
                <span>Highest "Hit The Road" Streak:</span>
                <strong>8 Times Ignored</strong>
              </div>
            </div>

            <p className="records-note">
              Can you achieve all 5 unique endings? Each victory rewards bonus points based on your Audacity!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
