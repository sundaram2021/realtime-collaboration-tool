import { useState, useCallback, useRef, useEffect } from 'react';
import { HistoryEntry } from '@/components/diagram/types';

interface HistoryState {
  history: HistoryEntry[];
  index: number;
}

export const useHistory = (restoreState: (state: HistoryEntry) => void) => {
  const [state, setState] = useState<HistoryState>({
    history: [{ shapes: [], connections: [] }],
    index: 0
  });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRestoring = useRef(false);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const saveState = useCallback((currentState: HistoryEntry) => {
    if (isRestoring.current) {
        isRestoring.current = false;
        return;
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setState(prevState => {
        const newHistory = prevState.history.slice(0, prevState.index + 1);
        const newState = JSON.parse(JSON.stringify(currentState));

        if (JSON.stringify(newState) === JSON.stringify(newHistory[newHistory.length - 1])) {
            return prevState;
        }
        
        newHistory.push(newState);

        if (newHistory.length > 50) {
          newHistory.shift();
        }
        
        return {
          history: newHistory,
          index: newHistory.length - 1
        };
      });
    }, 300);
  }, []);

  const undo = useCallback(() => {
    if (state.index > 0) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current); // Cancel any pending save
      isRestoring.current = true;
      const newIndex = state.index - 1;
      const previousState = state.history[newIndex];
      restoreState(JSON.parse(JSON.stringify(previousState)));
      setState(prev => ({
        ...prev,
        index: newIndex
      }));
    }
  }, [state.history, state.index, restoreState]);

  const redo = useCallback(() => {
    if (state.index < state.history.length - 1) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current); // Cancel any pending save
      isRestoring.current = true;
      const newIndex = state.index + 1;
      const nextState = state.history[newIndex];
      restoreState(JSON.parse(JSON.stringify(nextState)));
      setState(prev => ({
        ...prev,
        index: newIndex
      }));
    }
  }, [state.history, state.index, restoreState]);

  const clearHistory = useCallback(() => {
    setState({
      history: [{ shapes: [], connections: [] }],
      index: 0
    });
  }, []);

  const canUndo = state.index > 0;
  const canRedo = state.index < state.history.length - 1;

  return {
    saveState,
    undo,
    redo,
    clearHistory,
    canUndo,
    canRedo,
  };
};