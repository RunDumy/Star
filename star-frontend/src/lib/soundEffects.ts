// Web Audio API sound effects for tarot interactions
export class SoundManager {
  private audioContext: AudioContext | null = null;
  private isEnabled: boolean = true;
  private volume: number = 0.3; // Lower volume for ambient sounds

  constructor() {
    // Create audio context on first user interaction
    if (typeof window !== 'undefined') {
      document.addEventListener('click', this.initializeAudio.bind(this), { once: true });
      document.addEventListener('touchstart', this.initializeAudio.bind(this), { once: true });
    }
  }

  private initializeAudio() {
    if (!this.audioContext && typeof window !== 'undefined') {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.warn('Web Audio API not supported in this browser');
        this.isEnabled = false;
      }
    }
  }

  // Play a single tone with ADSR envelope
  private playTone(frequency: number, duration: number = 0.5, type: OscillatorType = 'sine'): void {
    if (!this.isEnabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = type;

    // ADSR envelope
    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.8, now + 0.01); // Attack
    gainNode.gain.setValueAtTime(this.volume * 0.6, now + duration * 0.7); // Decay to Sustain
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration); // Release

    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  // Generate chord tones for mystical sounds
  private playChord(frequencies: number[], duration: number = 1): void {
    frequencies.forEach((freq, index) => {
      setTimeout(() => this.playTone(freq, duration), index * 50);
    });
  }

  // Card movement sound - gentle ascending tone
  public playCardMove(): void {
    this.playTone(220, 0.2, 'triangle'); // A3 note
  }

  // Card placement sound - satisfying major chord
  public playCardPlace(): void {
    // C major chord: C4, E4, G4
    this.playChord([261.63, 329.63, 392.00], 0.6);
  }

  // Card flip/reveal sound - magical swish
  public playCardReveal(): void {
    // Quick ascending glissando
    const frequencies = [146.83, 174.61, 196.00, 220.00, 246.94]; // D3 to B3
    this.playChord(frequencies, 0.8);
  }

  // Energy flow visualization - cosmic hum
  public playEnergyFlow(): void {
    // Low frequency drone with subtle modulation
    this.playTone(55, 1.0, 'sine'); // A1 very low
    setTimeout(() => this.playTone(75, 0.8, 'triangle'), 200); // D2
  }

  // Reading generation start - mysterious crescendo
  public playReadingStart(): void {
    // Building tension with increasing frequencies
    const sequence = [110, 138.59, 164.81, 196, 220]; // A2 to A3
    sequence.forEach((freq, index) => {
      setTimeout(() => this.playTone(freq, 0.3 + index * 0.1), index * 150);
    });
  }

  // Reading complete - harmonious resolution
  public playReadingComplete(): void {
    // AMaj7 chord with bell-like harmonics
    this.playChord([220.00, 277.18, 329.63, 415.30], 1.2); // A3, C#4, E4, G#4
  }

  // Button interaction - subtle click
  public playButtonClick(): void {
    this.playTone(800, 0.1, 'square');
  }

  // Error sound - minor chord dissonance
  public playError(): void {
    // D# minor chord: D#4, G4, A#4
    this.playChord([311.13, 392.00, 466.16], 0.8);
  }

  // Success sound - triumphant fanfare
  public playSuccess(): void {
    // G major arpeggio: G4, B4, D5, G5
    const arpeggio = [392.00, 493.88, 587.33, 783.99];
    arpeggio.forEach((freq, index) => {
      setTimeout(() => this.playTone(freq, 0.2), index * 80);
    });
  }

  // Toggle sound on/off
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  // Set volume (0.0 to 1.0)
  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  // Get current volume
  public getVolume(): number {
    return this.volume;
  }

  // Check if sound is enabled
  public getIsEnabled(): boolean {
    return this.isEnabled;
  }

  // Cleanup
  public dispose(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// Global sound manager instance
export const soundManager = new SoundManager();

// Utility function to play sounds with error handling
export const playSound = (soundType: keyof SoundManager): void => {
  try {
    if (typeof soundManager[soundType] === 'function') {
      (soundManager[soundType] as () => void)();
    }
  } catch (error) {
    console.warn('Failed to play sound effect:', error);
  }
};
