import { useState, useMemo } from 'react';
import { Shape, SelectionBox } from '@/components/diagram/types';

export const useSelection = (shapes: Shape[]) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);

  const selectedShapes = useMemo(() => 
    shapes.filter(shape => selectedIds.has(shape.id)),
    [shapes, selectedIds]
  );

  const primarySelectedShape = useMemo(() => 
    selectedShapes.length === 1 ? selectedShapes[0] : null,
    [selectedShapes]
  );

  const selectShape = (id: string, multiSelect = false) => {
    if (multiSelect) {
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return newSet;
      });
    } else {
      setSelectedIds(new Set([id]));
    }
  };

  const selectShapes = (ids: string[]) => {
    setSelectedIds(new Set(ids));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const selectAll = () => {
    setSelectedIds(new Set(shapes.map(s => s.id)));
  };

  const getShapesInBox = (box: SelectionBox): Shape[] => {
    const minX = Math.min(box.startX, box.endX);
    const maxX = Math.max(box.startX, box.endX);
    const minY = Math.min(box.startY, box.endY);
    const maxY = Math.max(box.startY, box.endY);

    return shapes.filter(shape => 
      shape.x >= minX &&
      shape.x + shape.width <= maxX &&
      shape.y >= minY &&
      shape.y + shape.height <= maxY
    );
  };

  return {
    selectedIds,
    selectedShapes,
    primarySelectedShape,
    isSelecting,
    selectionBox,
    selectShape,
    selectShapes,
    clearSelection,
    selectAll,
    setIsSelecting,
    setSelectionBox,
    getShapesInBox,
  };
};
