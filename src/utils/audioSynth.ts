// Web Audio API ambient wedding melody generator
// Creates a soothing, gentle oriental/harp harmonic progression suitable for a royal wedding invitation.

class WeddingAudioPlayer {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private timerId: number | null = null;
  private gainNode: GainNode | null = null;

  // Gentle pentatonic/romantic scale frequencies (D major / oriental peaceful tones)
  private melodyNotes: number[] = [
    293.66, // D4
    329.63, // E4
    369.99, // F#4
    440.00, // A4
    493.88, // B4
    587.33, // D5
    659.25, // E5
    739.99, // F#5
    880.00  // A5
  ];

  private chordProgressions: number[][] = [
    [146.83, 220.00, 293.66], // D chord bass
    [196.00, 246.94, 293.66], // G chord bass
    [164.81, 220.00, 261.63], // A chord bass
    [123.47, 185.00, 220.00]  // Bm chord bass
  ];

  private noteIndex = 0;
  private chordIndex = 0;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.25, this.ctx.currentTime);
      this.gainNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.15) {
    if (!this.ctx || !this.gainNode) return;

    try {
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Soft envelope for celestial harp/bells feel
      noteGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      noteGain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 0.08);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(noteGain);
      noteGain.connect(this.gainNode);

      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio context might be restricted before user interaction
    }
  }

  private playPadChord(chord: number[]) {
    if (!this.ctx || !this.gainNode) return;
    chord.forEach(freq => {
      this.playTone(freq, 3.2, 'triangle', 0.04);
    });
  }

  public start() {
    if (this.isPlaying) return;
    this.initContext();
    this.isPlaying = true;

    // Trigger opening chime
    this.playTone(587.33, 1.8, 'sine', 0.2);
    setTimeout(() => this.playTone(739.99, 2.0, 'sine', 0.18), 200);
    setTimeout(() => this.playTone(880.00, 2.5, 'sine', 0.15), 450);

    // Continuous ambient arpeggio loop
    const step = () => {
      if (!this.isPlaying) return;

      // Chord backing every 8 steps
      if (this.noteIndex % 6 === 0) {
        const chord = this.chordProgressions[this.chordIndex % this.chordProgressions.length];
        this.playPadChord(chord);
        this.chordIndex++;
      }

      // Melody note
      const pattern = [0, 2, 3, 5, 4, 2, 5, 7, 8, 5, 3, 2];
      const noteOffset = pattern[this.noteIndex % pattern.length];
      const freq = this.melodyNotes[noteOffset % this.melodyNotes.length];

      this.playTone(freq, 1.4, 'sine', 0.12);
      this.noteIndex++;

      this.timerId = window.setTimeout(step, 450 + (this.noteIndex % 3 === 0 ? 300 : 0));
    };

    this.timerId = window.setTimeout(step, 600);
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const weddingAudio = new WeddingAudioPlayer();
