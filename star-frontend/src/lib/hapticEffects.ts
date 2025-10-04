// Haptic feedback utilities using Vibration API for mobile devices
export class HapticManager {
  private isEnabled: boolean = true;

  constructor() {
    // Check if vibration is supported
    this.isEnabled = 'vibrate' in navigator;
  }

  // Vibration pattern: array of [duration, pause, duration, pause, ...] in milliseconds
  private vibrate(pattern: number | number[]): void {
    if (!this.isEnabled || !navigator.vibrate) return;

    try {
      navigator.vibrate(pattern);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  // Light tap for button interactions
  public cardMove(): void {
    this.vibrate(50); // 50ms vibration
  }

  // Medium vibration for card placement
  public cardPlace(): void {
    this.vibrate([30, 50, 30]); // Two short vibrations with pause
  }

  // Gentle pulse for hovering/dragging
  public cardHover(): void {
    this.vibrate(25);
  }

  // Success pattern for completed actions
  public success(): void {
    this.vibrate([50, 100, 50, 100, 100]); // Success sequence
  }

  // Attention-grabbing pattern for errors
  public error(): void {
    this.vibrate([100, 50, 100, 50, 100]); // Error sequence
  }

  // Cosmic energy flow pulse
  public energyFlow(): void {
    this.vibrate([20, 30, 20, 30, 20]); // Gentle pulsing
  }

  // Reading generation effects
  public readingStart(): void {
    this.vibrate([50, 200, 50, 200, 100]); // Building tension
  }

  public readingComplete(): void {
    this.vibrate([100, 100, 100, 100, 200]); // Triumphant ending
  }

  // Subtle feedback for UI interactions
  public buttonPress(): void {
    this.vibrate(20);
  }

  // Light tap for subtle interactions
  public light(): void {
    this.vibrate(15);
  }

  // Enable/disable haptic feedback
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  // Check if haptics are supported and enabled
  public getIsEnabled(): boolean {
    return this.isEnabled && 'vibrate' in navigator;
  }

  // Get platform-specific feedback
  public getPlatform(): 'ios' | 'android' | 'unknown' {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      return 'ios';
    } else if (userAgent.includes('android')) {
      return 'android';
    }
    return 'unknown';
  }
}

// Global haptic manager instance
export const hapticManager = new HapticManager();

// Utility function with error handling
export const playHaptic = (hapticType: keyof HapticManager): void => {
  try {
    if (typeof hapticManager[hapticType] === 'function') {
      (hapticManager[hapticType] as () => void)();
    }
  } catch (error) {
    console.warn('Failed to play haptic feedback:', error);
  }
};
