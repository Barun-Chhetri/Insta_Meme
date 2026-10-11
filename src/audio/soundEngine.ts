// Web Audio API procedural sound engine with hilarious comedic effects

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterVolume: number = 0.7;
  private musicInterval: number | null = null;
  private isMusicPlaying: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.musicInterval) {
      this.stopCountryMusic();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.masterVolume;
  }

  // --- Sound Effects ---

  // Cast fishing line: whoosh + plop
  public playCast() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Whoosh
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.25);

    gain.gain.setValueAtTime(0.3 * this.masterVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.25);

    // Followed by water plop
    setTimeout(() => {
      this.playWaterPlop();
    }, 280);
  }

  // Water plop / splash
  public playWaterPlop() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.15);

    gain.gain.setValueAtTime(0.4 * this.masterVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  // Fish bite ping / splash alert
  public playBiteAlert() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // High alert chime
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.setValueAtTime(1174, t + 0.08);

    gain.gain.setValueAtTime(0.4 * this.masterVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.25);

    this.playWaterPlop();
  }

  // Fishing reel click (rapid ratchet gear sound)
  public playReelClick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1200 + Math.random() * 400, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.03);

    gain.gain.setValueAtTime(0.18 * this.masterVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.035);
  }

  // Triumphant fish catch jingle
  public playCatchSuccess() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const t = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.value = freq;

      const noteTime = t + idx * 0.09;
      gain.gain.setValueAtTime(0.35 * this.masterVolume, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(noteTime);
      osc.stop(noteTime + 0.23);
    });
  }

  // Iconic comic "HIT THE ROAD!" Stamp sound: Heavy low thud + cartoon slap
  public playHitTheRoad() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Heavy bass thump
    const bass = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    bass.type = 'sine';
    bass.frequency.setValueAtTime(150, t);
    bass.frequency.exponentialRampToValueAtTime(35, t + 0.35);

    bassGain.gain.setValueAtTime(0.7 * this.masterVolume, t);
    bassGain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

    bass.connect(bassGain);
    bassGain.connect(this.ctx.destination);
    bass.start(t);
    bass.stop(t + 0.35);

    // Comic slap slap
    const slap = this.ctx.createOscillator();
    const slapGain = this.ctx.createGain();
    slap.type = 'sawtooth';
    slap.frequency.setValueAtTime(500, t);
    slap.frequency.exponentialRampToValueAtTime(80, t + 0.15);

    slapGain.gain.setValueAtTime(0.35 * this.masterVolume, t);
    slapGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    slap.connect(slapGain);
    slapGain.connect(this.ctx.destination);
    slap.start(t);
    slap.stop(t + 0.15);
  }

  // Iconic dramatic "LOCK 'EM UP?!" Horror/Comedy Sting (Melodramatic pipe organ/brass chords)
  public playLockEmUpSting() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Diminished dramatic chord (C, Eb, F#, A)
    const freqs = [261.63, 311.13, 369.99, 440.0];

    freqs.forEach(freq => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sawtooth';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0.25 * this.masterVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.35 * this.masterVolume, t + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t);
      osc.stop(t + 1.2);
    });
  }

  // Comedic Cricket Chirps for awkward silence ("I'm his daddy")
  public playCrickets() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(4500, t + i * 0.12);
      osc.frequency.exponentialRampToValueAtTime(4200, t + i * 0.12 + 0.05);

      gain.gain.setValueAtTime(0.08 * this.masterVolume, t + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + i * 0.12);
      osc.stop(t + i * 0.12 + 0.07);
    }
  }

  // Stomping footsteps in dirt
  public playFootsteps() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(90 + Math.random() * 20, t + i * 0.28);
      osc.frequency.exponentialRampToValueAtTime(40, t + i * 0.28 + 0.1);

      gain.gain.setValueAtTime(0.22 * this.masterVolume, t + i * 0.28);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.28 + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + i * 0.28);
      osc.stop(t + i * 0.28 + 0.13);
    }
  }

  // Victory harmonica / celebratory chime
  public playVictory() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [392.00, 523.25, 659.25, 783.99, 1046.50];
    const t = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.1);
      gain.gain.setValueAtTime(0.3 * this.masterVolume, t + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.1 + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t + idx * 0.1);
      osc.stop(t + idx * 0.1 + 0.36);
    });
  }

  // Truck Engine Rev for Muddy Escape
  public playEngineRev(intensity: number) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    const baseFreq = 70 + intensity * 180;
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq + 30, t + 0.15);

    gain.gain.setValueAtTime((0.15 + intensity * 0.25) * this.masterVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.02, t + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  // Mud Squirt / Splat sound
  public playMudSplat() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.12);

    gain.gain.setValueAtTime(0.3 * this.masterVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.14);
  }

  // Distant Sheriff Siren for "Lock 'em up"
  public playSiren() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(500, t);
    osc.frequency.linearRampToValueAtTime(800, t + 0.4);
    osc.frequency.linearRampToValueAtTime(500, t + 0.8);
    osc.frequency.linearRampToValueAtTime(800, t + 1.2);

    gain.gain.setValueAtTime(0.12 * this.masterVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 1.5);
  }

  // Catchy procedurally generated comedy country bluegrass twang background music
  public startCountryMusic() {
    if (this.isMusicPlaying || this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    this.isMusicPlaying = true;
    let step = 0;
    // G major pentatonic / country twang notes (G, B, D, E, G)
    const banjoMelody = [
      196.00, 246.94, 293.66, 392.00,
      196.00, 293.66, 329.63, 293.66,
      220.00, 277.18, 329.63, 440.00,
      196.00, 246.94, 293.66, 196.00
    ];

    this.musicInterval = window.setInterval(() => {
      if (!this.ctx || this.isMuted) return;
      const t = this.ctx.currentTime;
      const freq = banjoMelody[step % banjoMelody.length];

      // Plucked banjo / guitar tone
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      // Fast pluck envelope
      gain.gain.setValueAtTime(0.08 * this.masterVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.24);

      // Bass note on beats 0, 4, 8, 12
      if (step % 4 === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(step % 8 === 0 ? 98.00 : 73.42, t); // G2 or D2
        bassGain.gain.setValueAtTime(0.12 * this.masterVolume, t);
        bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

        bassOsc.connect(bassGain);
        bassGain.connect(this.ctx.destination);
        bassOsc.start(t);
        bassOsc.stop(t + 0.38);
      }

      step++;
    }, 240); // ~125 BPM country groove
  }

  public stopCountryMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.isMusicPlaying = false;
  }
}

export const soundEngine = new SoundEngine();
