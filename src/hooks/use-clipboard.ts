import { useState, useCallback } from 'react';
import { Shape, Connection, ClipboardData } from '@/components/diagram/types';

let shapeIdCounter = 1000;

export const useClipboard = () => {
  const [clipboard, setClipboard] = useState<ClipboardData | null>(null);

  const copyToClipboard = useCallback((shapes: Shape[], connections: Connection[]) => {
    const shapeIds = new Set(shapes.map(s => s.id));
    const relevantConnections = connections.filter(
      conn => shapeIds.has(conn.startShapeId) && shapeIds.has(conn.endShapeId)
    );
    
    setClipboard({
      shapes,
      connections: relevantConnections,
    });
  }, []);

  const pasteFromClipboard = useCallback((offsetX = 20, offsetY = 20) => {
    if (!clipboard) return { shapes: [], connections: [] };

    const idMap = new Map<string, string>();
    
    // Create new shapes with new IDs
    const newShapes = clipboard.shapes.map(shape => {
      const newId = `shape_${shapeIdCounter++}`;
      idMap.set(shape.id, newId);
      
      return {
        ...shape,
        id: newId,
        x: shape.x + offsetX,
        y: shape.y + offsetY,
      };
    });

    // Create new connections with updated IDs
    const newConnections = clipboard.connections.map(conn => ({
      ...conn,
      id: `connection_${shapeIdCounter++}`,
      startShapeId: idMap.get(conn.startShapeId) || conn.startShapeId,
      endShapeId: idMap.get(conn.endShapeId) || conn.endShapeId,
    }));

    return { shapes: newShapes, connections: newConnections };
  }, [clipboard]);

  const hasClipboardData = clipboard !== null;

  return {
    copyToClipboard,
    pasteFromClipboard,
    hasClipboardData,
  };
};
