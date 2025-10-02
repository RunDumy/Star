import { useEffect, useCallback, useRef } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
}

interface KeyboardNavigationOptions {
  shortcuts?: KeyboardShortcut[];
  onArrowKeys?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onTabNavigation?: (direction: 'forward' | 'backward') => void;
  onSpaceKey?: () => void;
  onEnterKey?: () => void;
  onEscapeKey?: () => void;
  onShortcutKey?: (shortcut: KeyboardShortcut) => void;
}

export function useKeyboardNavigation(options: KeyboardNavigationOptions = {}) {
  const {
    shortcuts = [],
    onArrowKeys,
    onTabNavigation,
    onSpaceKey,
    onEnterKey,
    onEscapeKey,
    onShortcutKey
  } = options;

  const shortcutMap = useRef<Map<string, KeyboardShortcut>>(new Map());
  const isComposing = useRef(false);

  // Build shortcut map for quick lookup
  useEffect(() => {
    const newShortcutMap = new Map<string, KeyboardShortcut>();

    shortcuts.forEach(shortcut => {
      const key = `${shortcut.ctrl ? 'ctrl+' : ''}${shortcut.shift ? 'shift+' : ''}${shortcut.alt ? 'alt+' : ''}${shortcut.key.toLowerCase()}`;
      newShortcutMap.set(key, shortcut);
    });

    shortcutMap.current = newShortcutMap;
  }, [shortcuts]);

  // Generate shortcut key string for lookup
  const getShortcutKey = useCallback((event: KeyboardEvent): string => {
    let key = '';

    if (event.ctrlKey || event.metaKey) key += 'ctrl+';
    if (event.shiftKey) key += 'shift+';
    if (event.altKey) key += 'alt+';

    key += event.key.toLowerCase();
    return key;
  }, []);

  // Handle IME composition events
  const handleCompositionStart = useCallback(() => {
    isComposing.current = true;
  }, []);

  const handleCompositionEnd = useCallback(() => {
    isComposing.current = false;
  }, []);

  // Main keyboard event handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore events during IME composition
    if (isComposing.current) return;

    // Prevent default behavior for our handled keys
    const shouldPreventDefault = [
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'Tab', 'Space', 'Enter', 'Escape'
    ].includes(event.key) ||
    shortcuts.some(shortcut =>
      shortcut.key.toLowerCase() === event.key.toLowerCase() &&
      ((shortcut.ctrl && (event.ctrlKey || event.metaKey)) ||
       (shortcut.shift && event.shiftKey) ||
       (shortcut.alt && event.altKey))
    );

    if (shouldPreventDefault) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Handle arrow keys
    if (onArrowKeys && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      const direction = event.key.replace('Arrow', '').toLowerCase() as 'up' | 'down' | 'left' | 'right';
      onArrowKeys(direction);
      return;
    }

    // Handle tab navigation
    if (onTabNavigation && event.key === 'Tab') {
      const direction = event.shiftKey ? 'backward' : 'forward';
      onTabNavigation(direction);
      return;
    }

    // Handle space key
    if (onSpaceKey && event.key === ' ') {
      onSpaceKey();
      return;
    }

    // Handle enter key
    if (onEnterKey && event.key === 'Enter') {
      onEnterKey();
      return;
    }

    // Handle escape key
    if (onEscapeKey && event.key === 'Escape') {
      onEscapeKey();
      return;
    }

    // Handle custom shortcuts
    if (shortcuts.length > 0) {
      const shortcutKey = getShortcutKey(event);
      const shortcut = shortcutMap.current.get(shortcutKey);

      if (shortcut) {
        shortcut.action();
        onShortcutKey?.(shortcut);
        return;
      }
    }
  }, [
    shortcuts,
    onArrowKeys,
    onTabNavigation,
    onSpaceKey,
    onEnterKey,
    onEscapeKey,
    onShortcutKey,
    getShortcutKey
  ]);

  // Add event listeners
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      // Only handle if target is a focusable element or the document/body
      const target = event.target as HTMLElement;
      const isFocusableInput = target.tagName === 'INPUT' ||
                              target.tagName === 'TEXTAREA' ||
                              target.tagName === 'SELECT' ||
                              target.contentEditable === 'true';

      // Skip keyboard navigation if user is typing in an input
      if (isFocusableInput && !['Escape', 'Tab'].includes(event.key)) {
        return;
      }

      handleKeyDown(event);
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    document.addEventListener('compositionstart', handleCompositionStart);
    document.addEventListener('compositionend', handleCompositionEnd);

    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
      document.removeEventListener('compositionstart', handleCompositionStart);
      document.removeEventListener('compositionend', handleCompositionEnd);
    };
  }, [handleKeyDown, handleCompositionStart, handleCompositionEnd]);

  return {
    shortcuts,
    shortcutMap: shortcutMap.current
  };
}

// Tarot-specific keyboard navigation hook
export function useTarotKeyboardNavigation(
  onCardSelect?: (cardId: string) => void,
  onCardFocus?: (cardId: string) => void,
  onShuffle?: () => void,
  onReveal?: () => void,
  onReset?: () => void,
  onShowHelp?: () => void,
  cardIds: string[] = []
) {
  const currentFocusIndex = useRef(0);
  const focusModeEnabled = useRef(false);

  const tarotShortcuts: KeyboardShortcut[] = [
    { key: 's', description: 'Shuffle cards', action: () => onShuffle?.() },
    { key: 'r', description: 'Reveal reading', action: () => onReveal?.() },
    { key: 'R', ctrl: true, description: 'Reset spread', action: () => onReset?.() },
    { key: 'f', description: 'Toggle focus mode', action: () => {
      focusModeEnabled.current = !focusModeEnabled.current;
    }},
    { key: '?', description: 'Show help', action: () => onShowHelp?.() },
    { key: 'h', description: 'Show help', action: () => onShowHelp?.() }
  ];

  const handleArrowKeys = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!focusModeEnabled.current || cardIds.length === 0) return;

    const cols = Math.ceil(Math.sqrt(cardIds.length)); // Approximate grid layout
    const currentRow = Math.floor(currentFocusIndex.current / cols);
    const currentCol = currentFocusIndex.current % cols;

    let newIndex = currentFocusIndex.current;

    switch (direction) {
      case 'up':
        newIndex = Math.max(0, currentFocusIndex.current - cols);
        break;
      case 'down':
        newIndex = Math.min(cardIds.length - 1, currentFocusIndex.current + cols);
        break;
      case 'left':
        newIndex = Math.max(0, currentFocusIndex.current - 1);
        break;
      case 'right':
        newIndex = Math.min(cardIds.length - 1, currentFocusIndex.current + 1);
        break;
    }

    if (newIndex !== currentFocusIndex.current) {
      currentFocusIndex.current = newIndex;
      onCardFocus?.(cardIds[newIndex]);
    }
  }, [cardIds, onCardFocus]);

  const handleEnterKey = useCallback(() => {
    if (focusModeEnabled.current && cardIds.length > 0) {
      onCardSelect?.(cardIds[currentFocusIndex.current]);
    }
  }, [cardIds, onCardSelect]);

  const handleTabNavigation = useCallback((direction: 'forward' | 'backward') => {
    if (focusModeEnabled.current && cardIds.length > 0) {
      if (direction === 'forward') {
        currentFocusIndex.current = (currentFocusIndex.current + 1) % cardIds.length;
      } else {
        currentFocusIndex.current = currentFocusIndex.current === 0
          ? cardIds.length - 1
          : currentFocusIndex.current - 1;
      }
      onCardFocus?.(cardIds[currentFocusIndex.current]);
    }
  }, [cardIds, onCardFocus]);

  const keyboardNav = useKeyboardNavigation({
    shortcuts: tarotShortcuts,
    onArrowKeys: handleArrowKeys,
    onTabNavigation: handleTabNavigation,
    onEnterKey: handleEnterKey,
    onShortcutKey: (shortcut) => {
      // Optional: log or handle shortcut usage
      console.log(`Tarot shortcut used: ${shortcut.description}`);
    }
  });

  return {
    ...keyboardNav,
    focusModeEnabled: focusModeEnabled.current,
    currentFocusIndex: currentFocusIndex.current,
    setFocusIndex: (index: number) => {
      currentFocusIndex.current = Math.max(0, Math.min(cardIds.length - 1, index));
    },
    toggleFocusMode: () => {
      focusModeEnabled.current = !focusModeEnabled.current;
    }
  };
}
