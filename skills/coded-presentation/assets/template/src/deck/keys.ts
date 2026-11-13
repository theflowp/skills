import { useEffect } from 'react';
import { slides } from '../slides';
import { MODE, deck } from './store';

/**
 * Keyboard and presentation remote.
 * → ↓ Space Enter PageUp/PageDown: navigate · F: fullscreen · O: slide list
 * B or .: black screen · P: presenter view · Home / End: first and last slide
 */
export function useDeckKeys() {
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
        case 'Enter':
          deck.next();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
        case 'Backspace':
          deck.prev();
          break;
        case 'Home':
          deck.goto(0);
          break;
        case 'End':
          deck.goto(slides.length - 1);
          break;
        case 'f':
        case 'F':
          if (document.fullscreenElement) void document.exitFullscreen();
          else void document.documentElement.requestFullscreen();
          break;
        case 'o':
        case 'O':
          if (!MODE.presenter) deck.toggleOverview();
          break;
        case 'Escape':
          deck.toggleOverview(false);
          break;
        case 'b':
        case 'B':
        case '.':
          deck.toggleBlack();
          break;
        case 'p':
        case 'P':
          if (!MODE.presenter) window.open(`${location.pathname}?presenter${location.hash}`, 'deck-presenter', 'popup,width=1280,height=800');
          break;
        default:
          return;
      }
      e.preventDefault();
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, []);
}
