import type { EndingDetails, EndingType } from '../types/game';

export const ENDINGS_DATA: Record<EndingType, EndingDetails> = {
  PEACEFUL_EXIT: {
    type: 'PEACEFUL_EXIT',
    title: 'The Diplomatic Angler',
    subtitle: 'You respected Tractor Supply’s lineage.',
    badge: '🕊️ PEACEFUL DEPARTURE',
    badgeColor: '#10b981',
    description: 'You packed up your folding chair, avoided a shouting match, and successfully navigated your pickup past the mud puddle. You didn’t get locked up, but you’ll forever wonder what Tractor Supply’s daddy had in mind.',
    memeQuote: '“I don’t want no trouble with Tractor Supply or his family.”',
    isVictory: true
  },

  ARGUMENT_CHAMPION: {
    type: 'ARGUMENT_CHAMPION',
    title: 'The Sovereign Retention Lawyer',
    subtitle: 'Debater of Drainage Ditches & Corporate Daddies.',
    badge: '🏆 ARGUMENT CHAMPION',
    badgeColor: '#f59e0b',
    description: 'You questioned property lines, demanded a missing sign, and ignored “HIT THE ROAD” so many times that the property owner’s face reached peak redline. Tractor Supply’s daddy finally sat down on an overturned bucket to contemplate his life choices.',
    memeQuote: '“Technically, without a sign, this runoff belongs to the people!”',
    isVictory: true
  },

  TEN_POUND_LEGEND: {
    type: 'TEN_POUND_LEGEND',
    title: 'The 10-Pound Legend',
    subtitle: 'Landed the mythical beast of runoff water!',
    badge: '👑 LEGENDARY ANGLER',
    badgeColor: '#ec4899',
    description: 'Right in the middle of his tirade about private property, your rod doubled over and you hauled out a 10.4 lb monster bass! The owner stopped mid-sentence, his jaw hit the dirt, and he secretly took a photo with his flip phone.',
    memeQuote: '“He said ‘Lock ’em up!’ but the fish said ‘Set the hook!’”',
    isVictory: true
  },

  MUD_DISASTER: {
    type: 'MUD_DISASTER',
    title: 'Retention Pond Ornament',
    subtitle: 'Buried to the axles in Georgia red clay.',
    badge: '🛞 MUD DISASTER',
    badgeColor: '#ef4444',
    description: 'He told you not to get stuck in that mud. You gunned the throttle, spun the rear tires into oblivion, and now your truck is a permanent wetland installation. The owner is charging you $500 cash for a tractor pull.',
    memeQuote: '“Told ya not to get stuck in that mud over yonder!”',
    isVictory: false
  },

  LOCK_EM_UP: {
    type: 'LOCK_EM_UP',
    title: 'Public Enemy of Tractor Supply',
    subtitle: 'The sirens came before the second bite.',
    badge: '🚨 LOCKED UP!',
    badgeColor: '#dc2626',
    description: 'You pushed your luck too far. The owner dialed the sheriff, two cruisers surrounded the pond, and you were issued a citation for ‘Unauthorized Detention Basin Angling’. Your mugshot with the bucket hat is now a viral meme.',
    memeQuote: '“He called me up and said ‘LOCK ’EM UP!’... and they did!”',
    isVictory: false
  }
};
