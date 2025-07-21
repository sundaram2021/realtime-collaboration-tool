import { useState, useCallback } from 'react';
import { Drawing } from '@/components/diagram/types';

let drawingCounter = 1;

export const useDrawing = () => {
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawingId, setCurrentDrawingId] = useState<string | null>(null);

  const startDrawing = useCallback((x: number, y: number, color: string, strokeWidth: number) => {
    const id = `drawing_${drawingCounter++}`;
    const newDrawing: Drawing = {
      id,
      points: [{ x, y }],
      color,
      strokeWidth,
    };
    setIsDrawing(true);
    setCurrentDrawingId(id);
    setDrawings(prev => [...prev, newDrawing]);
  }, []);

  const addPointToDrawing = useCallback((x: number, y: number) => {
    if (!isDrawing || !currentDrawingId) return;

    setDrawings(prev =>
      prev.map(d =>
        d.id === currentDrawingId
          ? { ...d, points: [...d.points, { x, y }] }
          : d
      )
    );
  }, [isDrawing, currentDrawingId]);

  const finishDrawing = useCallback(() => {
    setIsDrawing(false);
    setCurrentDrawingId(null);
  }, []);

  return {
    drawings,
    setDrawings,
    isDrawing,
    startDrawing,
    addPointToDrawing,
    finishDrawing,
  };
};