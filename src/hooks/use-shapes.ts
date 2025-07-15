import { useState, useCallback } from 'react';
import { Shape, Tool } from '@/components/diagram/types';

let shapeCounter = 1;

export const useShapes = () => {
  const [shapes, setShapes] = useState<Shape[]>([]);

  const createShape = useCallback((tool: Tool, x: number, y: number): Shape => {
    const id = `${tool.type}_${shapeCounter++}`;
    
    return {
      id,
      type: tool.type, 
      x: x - (tool.defaultWidth || 100) / 2,
      y: y - (tool.defaultHeight || 60) / 2,
      width: tool.defaultWidth || 100,
      height: tool.defaultHeight || 60,
      text: tool.type === 'text' ? 'Double-click to edit' : tool.label,
      fillColor: tool.type === 'text' ? 'transparent' : '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 1,
      fontSize: 14,
      fontFamily: 'Arial',
      rotation: 0,
      opacity: 1,
    };
  }, []);

  const addShape = useCallback((tool: Tool, x: number, y: number): Shape => {
    const shape = createShape(tool, x, y);
    setShapes(prev => [...prev, shape]);
    return shape;
  }, [createShape]);

  const addShapes = useCallback((newShapes: Shape[]) => {
    setShapes(prev => [...prev, ...newShapes]);
  }, []);

  const updateShape = useCallback((id: string, updates: Partial<Shape>) => {
    setShapes(prev => prev.map(shape => 
      shape.id === id ? { ...shape, ...updates } : shape
    ));
  }, []);

  const deleteShape = useCallback((id: string) => {
    setShapes(prev => prev.filter(shape => shape.id !== id));
  }, []);

  const clearShapes = useCallback(() => {
    setShapes([]);
  }, []);

  return {
    shapes,
    setShapes,
    addShape,
    addShapes,
    updateShape,
    deleteShape,
    clearShapes,
  };
};