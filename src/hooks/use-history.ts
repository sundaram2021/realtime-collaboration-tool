import { useState, useCallback, useRef } from 'react';
import { Shape } from '@/components/diagram/types';

export const useHistory = (currentShapes: Shape[]) => {
  const [history, setHistory] = useState<Shape[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveState = useCallback((shapes: Shape[]) => {
    // Debounce history saves to avoid too many entries
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setHistory(prev => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(JSON.parse(JSON.stringify(shapes)));
        
        // Limit history size
        if (newHistory.length > 50) {
          newHistory.shift();
          return newHistory;
        }
        
        setHistoryIndex(newHistory.length - 1);
        return newHistory;
      });
    }, 300);
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      return history[historyIndex - 1];
    }
    return null;
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      return history[historyIndex + 1];
    }
    return null;
  }, [history, historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return {
    saveState,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};
