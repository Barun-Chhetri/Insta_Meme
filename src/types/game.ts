export type GameState = 'INTRO' | 'FISHING' | 'REELING' | 'DIALOGUE' | 'MUD_ESCAPE' | 'GAME_OVER';

export interface Fish {
  id: string;
  name: string;
  weight: number; // in lbs
  points: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  description: string;
  icon: string;
  isLegendary?: boolean;
}

export interface DialogueChoice {
  text: string;
  response: string;
  ownerReaction?: 'suspicious' | 'furious' | 'confused' | 'flabbergasted' | 'phone' | 'calm';
  playerReaction?: 'innocent' | 'smug' | 'confused' | 'panicked';
  angerDelta: number;
  audacityDelta: number;
  hitTheRoad?: boolean;
  triggersDramaticPause?: boolean;
  triggersLockEmUp?: boolean;
  triggersZoom?: boolean;
  dramaticSting?: boolean;
  allowSneakCast?: boolean;
  screenShake?: boolean;
  nextSceneId?: string;
  leadsToEscape?: boolean;
  leadsToFailure?: boolean;
  customEnding?: EndingType;
}

export interface DialogueScene {
  id: string;
  ownerLine: string;
  ownerMood: 'suspicious' | 'furious' | 'confused' | 'flabbergasted' | 'phone' | 'calm';
  playerMood?: 'innocent' | 'smug' | 'confused' | 'panicked';
  dramaticCaption?: string;
  screenShake?: boolean;
  dramaticSting?: boolean;
  choices: DialogueChoice[];
}

export type EndingType = 
  | 'PEACEFUL_EXIT' 
  | 'ARGUMENT_CHAMPION' 
  | 'TEN_POUND_LEGEND' 
  | 'MUD_DISASTER' 
  | 'LOCK_EM_UP';

export interface EndingDetails {
  type: EndingType;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  description: string;
  memeQuote: string;
  isVictory: boolean;
}

export interface GameScore {
  totalFishCaught: number;
  totalWeight: number;
  largestFish: Fish | null;
  fishList: Fish[];
  timesIgnoredHitTheRoad: number;
  argumentsStarted: number;
  audacityScore: number;
  mudEscapeSuccess: boolean;
  finalScore: number;
  ending: EndingDetails;
  timestamp: number;
}
