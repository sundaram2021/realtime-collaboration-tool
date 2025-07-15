import { useState, useCallback, useRef, useEffect } from 'react';
import { Shape } from '@/components/diagram/types';

interface HistoryState {
  history: Shape[][];
  index: number;
}

export const useHistory = (initialShapes: Shape[]) => {
  const [state, setState] = useState<HistoryState>({
    history: [],
    index: -1
  });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialized = useRef(false);

  // Initialize with initial shapes
  useEffect(() => {
    if (!isInitialized.current) {
      const initialState = JSON.parse(JSON.stringify(initialShapes || []));
      setState({
        history: [initialState],
        index: 0
      });
      isInitialized.current = true;
    }
  }, [initialShapes]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const saveState = useCallback((shapes: Shape[]) => {
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setState(prevState => {
        // Remove any future history if we're not at the end
        const newHistory = prevState.history.slice(0, prevState.index + 1);
        
        // Add the new state (deep clone to avoid mutations)
        const newState = JSON.parse(JSON.stringify(shapes));
        newHistory.push(newState);
        
        // Limit history size
        if (newHistory.length > 50) {
          newHistory.shift();
          return {
            history: newHistory,
            index: newHistory.length - 1
          };
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
      const newIndex = state.index - 1;
      setState(prev => ({
        ...prev,
        index: newIndex
      }));
      // Return a deep clone to avoid mutations
      return JSON.parse(JSON.stringify(state.history[newIndex]));
    }
    return null;
  }, [state.history, state.index]);

  const redo = useCallback(() => {
    if (state.index < state.history.length - 1) {
      const newIndex = state.index + 1;
      setState(prev => ({
        ...prev,
        index: newIndex
      }));
      // Return a deep clone to avoid mutations
      return JSON.parse(JSON.stringify(state.history[newIndex]));
    }
    return null;
  }, [state.history, state.index]);

  const clearHistory = useCallback(() => {
    setState({
      history: [],
      index: -1
    });
    isInitialized.current = false;
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
    currentHistoryIndex: state.index,
    historyLength: state.history.length,
  };
};