import type { DialogueScene } from '../types/game';

export const DIALOGUE_TREE: Record<string, DialogueScene> = {
  // Scene A: The Permission Check
  scene_start: {
    id: 'scene_start',
    ownerLine: 'You got permission to be fishin’ here?',
    ownerMood: 'suspicious',
    playerMood: 'innocent',
    choices: [
      {
        text: 'I thought it was state property.',
        response: 'State? This? It ain’t!',
        ownerReaction: 'confused',
        angerDelta: 15,
        audacityDelta: 10,
        triggersZoom: true,
        nextSceneId: 'scene_state_property'
      },
      {
        text: 'Who told you I needed permission?',
        response: 'I DID! I’m tellin’ you right now!',
        ownerReaction: 'furious',
        angerDelta: 25,
        audacityDelta: 20,
        nextSceneId: 'scene_who_owns'
      },
      {
        text: 'I’m just trying to catch a fish, man.',
        response: 'Not in this water you ain’t! Who said you could cast that line?',
        ownerReaction: 'suspicious',
        angerDelta: 10,
        audacityDelta: 5,
        nextSceneId: 'scene_who_owns'
      }
    ]
  },

  scene_state_property: {
    id: 'scene_state_property',
    ownerLine: 'State property?! Son, this retention pond is private as Sunday dinner!',
    ownerMood: 'furious',
    choices: [
      {
        text: 'Well who owns it then?',
        response: 'Tractor Supply owns it. And I’m his daddy.',
        ownerReaction: 'flabbergasted',
        triggersDramaticPause: true,
        angerDelta: 10,
        audacityDelta: 15,
        nextSceneId: 'scene_daddy'
      },
      {
        text: 'There ain’t no fence or gate around it.',
        response: 'Don’t need no fence when I’m standin’ right here! HIT THE ROAD!',
        ownerReaction: 'furious',
        hitTheRoad: true,
        angerDelta: 20,
        audacityDelta: 15,
        nextSceneId: 'scene_missing_sign'
      },
      {
        text: 'My bad, let me just pack my tackle.',
        response: 'Yeah, you do that. And don’t you get stuck in that mud over yonder!',
        ownerReaction: 'calm',
        angerDelta: -5,
        audacityDelta: 0,
        leadsToEscape: true
      }
    ]
  },

  scene_who_owns: {
    id: 'scene_who_owns',
    ownerLine: 'This whole parcel belongs to Tractor Supply right behind us!',
    ownerMood: 'suspicious',
    choices: [
      {
        text: 'You said Tractor Supply owns this pond right here?',
        response: 'I’m his daddy.',
        ownerReaction: 'flabbergasted',
        triggersDramaticPause: true,
        angerDelta: 10,
        audacityDelta: 20,
        nextSceneId: 'scene_daddy'
      },
      {
        text: 'Tractor Supply doesn’t own the rain water, buddy.',
        response: 'They own the dirt it fell into! HIT THE ROAD!',
        ownerReaction: 'furious',
        hitTheRoad: true,
        angerDelta: 25,
        audacityDelta: 25,
        nextSceneId: 'scene_missing_sign'
      },
      {
        text: 'Alright, I’ll pack up and head out.',
        response: 'Good. And watch that red clay by your truck!',
        ownerReaction: 'calm',
        angerDelta: -5,
        audacityDelta: 0,
        leadsToEscape: true
      }
    ]
  },

  // Scene B: The Ownership Argument ("I'm his daddy")
  scene_daddy: {
    id: 'scene_daddy',
    ownerLine: 'That’s right. I’m his daddy. He called me up on the horn.',
    ownerMood: 'flabbergasted',
    playerMood: 'confused',
    choices: [
      {
        text: 'Wait... You’re Tractor Supply’s daddy?!',
        response: 'He called me and said, ‘Lock ’em up.’',
        ownerReaction: 'furious',
        triggersLockEmUp: true,
        screenShake: true,
        dramaticSting: true,
        angerDelta: 20,
        audacityDelta: 25,
        nextSceneId: 'scene_lock_em_up'
      },
      {
        text: 'Does that make this pond your grandbaby?',
        response: 'Don’t get cute with me, son! HIT THE ROAD!',
        ownerReaction: 'furious',
        hitTheRoad: true,
        angerDelta: 25,
        audacityDelta: 30,
        nextSceneId: 'scene_hit_the_road_loop'
      },
      {
        text: 'Tell your boy Tractor Supply I said hi. I’m packing up.',
        response: 'He don’t want no hi from you! Watch the mud by the gate!',
        ownerReaction: 'suspicious',
        angerDelta: 5,
        audacityDelta: 10,
        leadsToEscape: true
      }
    ]
  },

  // Scene C: "Lock 'Em Up"
  scene_lock_em_up: {
    id: 'scene_lock_em_up',
    ownerLine: 'He saw you out here on the security camera. Said, ‘LOCK ’EM UP!’',
    ownerMood: 'furious',
    playerMood: 'panicked',
    dramaticCaption: 'LOCK ’EM UP?!',
    screenShake: true,
    choices: [
      {
        text: 'LOCK ’EM UP?! For catching a bluegill?!',
        response: 'You’re on private ground! He don’t play around!',
        ownerReaction: 'furious',
        angerDelta: 20,
        audacityDelta: 20,
        nextSceneId: 'scene_missing_sign'
      },
      {
        text: 'Who’s gonna lock me up? The Retention Patrol?',
        response: 'County sheriff will be here in two shakes! HIT THE ROAD!',
        ownerReaction: 'phone',
        hitTheRoad: true,
        angerDelta: 30,
        audacityDelta: 35,
        nextSceneId: 'scene_hit_the_road_loop'
      },
      {
        text: 'Whoa, no need to lock anybody up! I’m leaving!',
        response: 'You better scramble before the law pulls up!',
        ownerReaction: 'suspicious',
        angerDelta: 0,
        audacityDelta: 5,
        leadsToEscape: true
      }
    ]
  },

  // Scene D: The Missing Sign Argument
  scene_missing_sign: {
    id: 'scene_missing_sign',
    ownerLine: 'You heard me! You got no business dip-netting in this pond!',
    ownerMood: 'furious',
    choices: [
      {
        text: 'You need to put a private property sign up!',
        response: 'HIT THE ROAD!',
        ownerReaction: 'furious',
        hitTheRoad: true,
        angerDelta: 25,
        audacityDelta: 25,
        nextSceneId: 'scene_hit_the_road_loop'
      },
      {
        text: 'Look at the post! The sign fell off into the weeds!',
        response: 'Don’t matter! I’M the sign! HIT THE ROAD!',
        ownerReaction: 'furious',
        hitTheRoad: true,
        angerDelta: 25,
        audacityDelta: 30,
        nextSceneId: 'scene_hit_the_road_loop'
      },
      {
        text: 'Can I make just ONE more cast first?',
        response: 'NO! Put that rod in your pickup and HIT THE ROAD!',
        ownerReaction: 'furious',
        hitTheRoad: true,
        allowSneakCast: true,
        angerDelta: 30,
        audacityDelta: 40,
        nextSceneId: 'scene_sneak_cast_offer'
      }
    ]
  },

  // Scene E: "Hit the Road" Loop & Sneak Fishing
  scene_sneak_cast_offer: {
    id: 'scene_sneak_cast_offer',
    ownerLine: 'Did I stutter? What part of HIT THE ROAD didn’t make it through that hat?!',
    ownerMood: 'furious',
    choices: [
      {
        text: '(Pretend to reel in, then sneak a massive cast into the center)',
        response: 'WHAT ARE YOU DOING?! YOU JUST CASTED AGAIN!',
        ownerReaction: 'furious',
        angerDelta: 35,
        audacityDelta: 50,
        nextSceneId: 'scene_cast_behind_back'
      },
      {
        text: 'If Tractor Supply is your son, can I get a discount on motor oil?',
        response: 'HIT THE ROAD! HIT THE ROAD! HIT THE ROAD!',
        ownerReaction: 'flabbergasted',
        hitTheRoad: true,
        angerDelta: 30,
        audacityDelta: 35,
        nextSceneId: 'scene_hit_the_road_loop'
      },
      {
        text: 'Fine, fine! I’m rolling out right now.',
        response: 'Watch that muddy ditch, or you’ll be diggin’ till sundown!',
        ownerReaction: 'calm',
        angerDelta: -5,
        audacityDelta: 0,
        leadsToEscape: true
      }
    ]
  },

  scene_cast_behind_back: {
    id: 'scene_cast_behind_back',
    ownerLine: 'I’m standing right here looking at you and you’re STILL FISHING!',
    ownerMood: 'furious',
    choices: [
      {
        text: 'Wait! Look at the rod tip! I think I got something huge!',
        response: 'I don’t care if you hooked Moby Dick! HIT THE ROAD!',
        ownerReaction: 'furious',
        hitTheRoad: true,
        angerDelta: 30,
        audacityDelta: 40,
        nextSceneId: 'scene_hit_the_road_loop'
      },
      {
        text: 'Look, it’s a matter of principle. The fish chose ME.',
        response: 'THAT DOES IT! HE SAID LOCK ’EM UP AND I’M CALLING!',
        ownerReaction: 'phone',
        angerDelta: 40,
        audacityDelta: 40,
        nextSceneId: 'scene_final_standoff'
      },
      {
        text: 'Alright, alright! Fish is unhooked. I’m heading to the truck.',
        response: 'Hurry up! And don’t spin your tires in my gravel!',
        ownerReaction: 'suspicious',
        angerDelta: -5,
        audacityDelta: 5,
        leadsToEscape: true
      }
    ]
  },

  scene_hit_the_road_loop: {
    id: 'scene_hit_the_road_loop',
    ownerLine: 'HIT THE ROAD! I said HIT THE ROAD! How many times do I gotta say it?!',
    ownerMood: 'furious',
    choices: [
      {
        text: 'Technically, this is a dirt embankment, not a road.',
        response: 'YOU KNOW WHAT I MEAN! HIT THE ROAD!',
        ownerReaction: 'furious',
        hitTheRoad: true,
        angerDelta: 30,
        audacityDelta: 35,
        nextSceneId: 'scene_final_standoff'
      },
      {
        text: 'What if I give you half the fish?',
        response: 'I don’t want no retention mud-carp! HIT THE ROAD!',
        ownerReaction: 'furious',
        hitTheRoad: true,
        angerDelta: 20,
        audacityDelta: 25,
        nextSceneId: 'scene_final_standoff'
      },
      {
        text: 'Heading to my truck right now!',
        response: 'Don’t you get stuck in that mud over yonder!',
        ownerReaction: 'suspicious',
        angerDelta: -5,
        audacityDelta: 0,
        leadsToEscape: true
      }
    ]
  },

  scene_final_standoff: {
    id: 'scene_final_standoff',
    ownerLine: 'THAT IS THE LAST STRAW! I’ve told you to HIT THE ROAD six ways from Sunday!',
    ownerMood: 'phone',
    choices: [
      {
        text: 'Tell your boy Tractor Supply his daddy’s got high blood pressure!',
        response: 'THAT’S IT! SHERIFF IS ON SPEED DIAL!',
        ownerReaction: 'furious',
        angerDelta: 50,
        audacityDelta: 50,
        customEnding: 'ARGUMENT_CHAMPION'
      },
      {
        text: 'Okay okay! Scurrying to the truck right now!',
        response: 'You better gun it, and don’t get swallowed by that mud puddle!',
        ownerReaction: 'furious',
        angerDelta: 0,
        audacityDelta: 10,
        leadsToEscape: true
      }
    ]
  }
};
