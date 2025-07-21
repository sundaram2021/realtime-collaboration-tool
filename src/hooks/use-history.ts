import { useState, useCallback, useRef } from 'react';
import { HistoryEntry } from '@/components/diagram/types';

interface HistoryState {
  history: HistoryEntry[];
  index: number;
}

export const useHistory = (restoreState: (state: HistoryEntry) => void) => {
  const [state, setState] = useState<HistoryState>({
    history: [{ shapes: [], connections: [], drawings: [] }],
    index: 0
  });
  const isRestoring = useRef(false);

  const saveState = useCallback((currentState: HistoryEntry) => {
    if (isRestoring.current) {
        isRestoring.current = false;
        return;
    }

    setState(prevState => {
      const newHistory = prevState.history.slice(0, prevState.index + 1);
      const lastState = newHistory[newHistory.length - 1];

      if (JSON.stringify(currentState) === JSON.stringify(lastState)) {
          return prevState;
      }

      newHistory.push(currentState);

      if (newHistory.length > 50) {
        newHistory.shift();
      }

      return {
        history: newHistory,
        index: newHistory.length - 1
      };
    });
  }, []);

  const undo = useCallback(() => {
    if (state.index > 0) {
      isRestoring.current = true;
      const newIndex = state.index - 1;
      const previousState = state.history[newIndex];
      restoreState(previousState);
      setState(prev => ({
        ...prev,
        index: newIndex
      }));
    }
  }, [state.history, state.index, restoreState]);

  const redo = useCallback(() => {
    if (state.index < state.history.length - 1) {
      isRestoring.current = true;
      const newIndex = state.index + 1;
      const nextState = state.history[newIndex];
      restoreState(nextState);
      setState(prev => ({
        ...prev,
        index: newIndex
      }));
    }
  }, [state.history, state.index, restoreState]);

  const clearHistory = useCallback(() => {
    setState({
      history: [{ shapes: [], connections: [], drawings: [] }],
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