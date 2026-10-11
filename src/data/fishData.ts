import type { Fish } from '../types/game';

export const FISH_POOL: Fish[] = [
  {
    id: 'bluegill',
    name: 'Retention Pond Bluegill',
    weight: 0.6,
    points: 150,
    rarity: 'common',
    description: 'Breathes 50% pond water, 50% parking lot runoff.',
    icon: '🐟'
  },
  {
    id: 'crappie',
    name: 'Municipal Crappie',
    weight: 1.4,
    points: 320,
    rarity: 'common',
    description: 'Thinks this is state property too.',
    icon: '🐠'
  },
  {
    id: 'bass',
    name: 'Corporate Largemouth Bass',
    weight: 3.5,
    points: 650,
    rarity: 'uncommon',
    description: 'Legally owned by Tractor Supply’s daddy.',
    icon: '🎣'
  },
  {
    id: 'catfish',
    name: 'Georgia Clay Mudcat',
    weight: 5.2,
    points: 900,
    rarity: 'rare',
    description: 'Whiskers coated in premium retention silt.',
    icon: '🐡'
  },
  {
    id: 'boot',
    name: 'Lost Work Boot (Size 11)',
    weight: 2.1,
    points: 50,
    rarity: 'common',
    description: 'Probably belonged to Tractor Supply’s cousin.',
    icon: '👢'
  },
  {
    id: 'coupon',
    name: 'Expired 10% Off Tractor Supply Coupon',
    weight: 0.05,
    points: 200,
    rarity: 'rare',
    description: 'Expired on June 14, 2017. Still laminated.',
    icon: '🎟️'
  },
  {
    id: 'ten_pounder',
    name: 'The Mythical 10-Lb Retention Monster',
    weight: 10.4,
    points: 2500,
    rarity: 'legendary',
    description: 'THE LEGEND HIMSELF! Big enough to file a tax return.',
    icon: '👑',
    isLegendary: true
  }
];

export const getRandomFish = (isAudacious: boolean = false): Fish => {
  // If player has high audacity or is sneaky-casting, higher chance of big fish!
  const roll = Math.random();
  if (isAudacious && roll < 0.35) {
    return FISH_POOL.find(f => f.id === 'ten_pounder')!;
  }
  if (roll < 0.08) {
    return FISH_POOL.find(f => f.id === 'ten_pounder')!;
  }
  if (roll < 0.25) {
    return FISH_POOL.find(f => f.id === 'catfish')!;
  }
  if (roll < 0.50) {
    return FISH_POOL.find(f => f.id === 'bass')!;
  }
  if (roll < 0.75) {
    return FISH_POOL.find(f => f.id === 'crappie')!;
  }
  if (roll < 0.90) {
    return FISH_POOL.find(f => f.id === 'bluegill')!;
  }
  return roll < 0.95 ? FISH_POOL.find(f => f.id === 'boot')! : FISH_POOL.find(f => f.id === 'coupon')!;
};
