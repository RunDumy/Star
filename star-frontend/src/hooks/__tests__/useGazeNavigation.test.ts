import { act, renderHook } from '@testing-library/react';
import { useGazeNavigation } from '../useGazeNavigation';

// Mock timers
jest.useFakeTimers();

describe('useGazeNavigation', () => {
  let mockMouseEvent: MouseEventInit;

  beforeEach(() => {
    mockMouseEvent = {
      clientX: 100,
      clientY: 200,
    };

    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', { value: 1920 });
    Object.defineProperty(window, 'innerHeight', { value: 1080 });
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useGazeNavigation());

    expect(result.current.mousePosition).toEqual({ x: 0, y: 0 });
    expect(result.current.gazeTarget).toBeNull();
    expect(result.current.isGazing).toBe(false);
    expect(result.current.gazeProgress).toBe(0);
    expect(result.current.gazeDirection).toEqual({ x: 0, y: 0 });
  });

  it('tracks mouse position', () => {
    const { result } = renderHook(() => useGazeNavigation({ updateInterval: 0 }));

    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', mockMouseEvent));
    });

    expect(result.current.mousePosition).toEqual({ x: 100, y: 200 });
  });

  it('detects gaze after threshold time', () => {
    const { result } = renderHook(() => useGazeNavigation({
      gazeThreshold: 1000,
      updateInterval: 0
    }));

    // Start gazing
    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', mockMouseEvent));
    });

    expect(result.current.isGazing).toBe(false);
    expect(result.current.gazeProgress).toBe(0);

    // Wait for gaze threshold
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.isGazing).toBe(true);
    expect(result.current.gazeTarget).toEqual({ x: 100, y: 200 });
  });

  it('resets gaze when mouse moves outside radius', () => {
    const { result } = renderHook(() => useGazeNavigation({
      gazeThreshold: 500,
      gazeRadius: 50,
      updateInterval: 0
    }));

    // Start gazing at position
    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', mockMouseEvent));
    });

    // Wait for gaze to start
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current.isGazing).toBe(true);

    // Move mouse outside radius
    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', {
        clientX: 200, // 100px away
        clientY: 200,
      }));
    });

    expect(result.current.isGazing).toBe(false);
    expect(result.current.gazeTarget).toBeNull();
  });

  it('calculates gaze direction correctly', () => {
    const { result } = renderHook(() => useGazeNavigation({ updateInterval: 0 }));

    // Center of screen is at (960, 540)
    // Mouse at (100, 200) should give direction:
    // x: (100 - 960) / 960 = -860/960 = -0.8958...
    // y: (200 - 540) / 540 = -340/540 = -0.6296...

    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', mockMouseEvent));
    });

    const direction = result.current.gazeDirection;
    expect(direction.x).toBeCloseTo(-0.8958, 3);
    expect(direction.y).toBeCloseTo(-0.6296, 3);
  });

  it('resets gaze on mouse leave', () => {
    const { result } = renderHook(() => useGazeNavigation({
      gazeThreshold: 500,
      updateInterval: 0
    }));

    // Start gazing
    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', mockMouseEvent));
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current.isGazing).toBe(true);

    // Mouse leaves window
    act(() => {
      document.dispatchEvent(new MouseEvent('mouseleave'));
    });

    expect(result.current.isGazing).toBe(false);
    expect(result.current.gazeTarget).toBeNull();
  });

  it('allows manual gaze reset', () => {
    const { result } = renderHook(() => useGazeNavigation({
      gazeThreshold: 500,
      updateInterval: 0
    }));

    // Start gazing
    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', mockMouseEvent));
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current.isGazing).toBe(true);

    // Manual reset
    act(() => {
      result.current.resetGaze();
    });

    expect(result.current.isGazing).toBe(false);
    expect(result.current.gazeTarget).toBeNull();
  });
});