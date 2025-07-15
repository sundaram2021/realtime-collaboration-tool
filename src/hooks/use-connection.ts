import { useState, useCallback } from 'react';
import { Connection, ConnectionPoint, Tool } from '@/components/diagram/types';

let connectionCounter = 1;

export const useConnections = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<ConnectionPoint | null>(null);
  const [connectionTool, setConnectionTool] = useState<Tool | null>(null);

  const startConnection = useCallback((point: ConnectionPoint, tool: Tool) => {
    setConnectionStart(point);
    setConnectionTool(tool);
    setIsConnecting(true);
  }, []);

  const completeConnection = useCallback((endPoint: ConnectionPoint) => {
    if (!connectionStart || !connectionTool) return;

    const connection: Connection = {
      id: `connection_${connectionCounter++}`,
      startShapeId: connectionStart.shapeId,
      endShapeId: endPoint.shapeId,
      startPoint: { x: connectionStart.x, y: connectionStart.y },
      endPoint: { x: endPoint.x, y: endPoint.y },
      type: 'straight',
      style: connectionTool.id.includes('dotted') ? 'dashed' : 'solid',
      startArrow: connectionTool.id.includes('double'),
      endArrow: connectionTool.id.includes('arrow'),
      color: '#000000',
      width: 2,
      end: undefined,
      start: undefined
    };

    setConnections(prev => [...prev, connection]);
    cancelConnection();
  }, [connectionStart, connectionTool]);

  const cancelConnection = useCallback(() => {
    setIsConnecting(false);
    setConnectionStart(null);
    setConnectionTool(null);
  }, []);

  const addConnections = useCallback((newConnections: Connection[]) => {
    setConnections(prev => [...prev, ...newConnections]);
  }, []);

  const deleteConnection = useCallback((id: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== id));
  }, []);

  const updateConnection = useCallback((id: string, updates: Partial<Connection>) => {
    setConnections(prev => prev.map(conn => 
      conn.id === id ? { ...conn, ...updates } : conn
    ));
  }, []);

  return {
    connections,
    setConnections, 
    isConnecting,
    connectionStart,
    startConnection,
    completeConnection,
    cancelConnection,
    addConnections,
    deleteConnection,
    updateConnection,
  };
};