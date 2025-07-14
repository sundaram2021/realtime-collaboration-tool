import React, { useCallback } from 'react';
import { Connection, ConnectionPoint, Shape } from './types';

interface ConnectionLayerProps {
    connections: Connection[];
    shapes: Shape[];
    isConnecting: boolean;
    connectionStart: ConnectionPoint | null;
    mousePos: { x: number; y: number };
    zoom: number;
    pan: { x: number; y: number };
}

export const ConnectionLayer: React.FC<ConnectionLayerProps> = ({
    connections,
    shapes,
    isConnecting,
    connectionStart,
    mousePos,
    zoom,
    pan,
}) => {
    const drawConnection = useCallback((connection: Connection) => {
        const startShape = shapes.find(s => s.id === connection.startShapeId);
        const endShape = shapes.find(s => s.id === connection.endShapeId);

        if (!startShape || !endShape) return null;

        const startPoint = getConnectionPoint(startShape, connection.startPoint);
        const endPoint = getConnectionPoint(endShape, connection.endPoint);

        const pathData = createSmoothPath(startPoint, endPoint);

        return (
            <g key={connection.id}>
                <path
                    d={pathData}
                    stroke={connection.color}
                    strokeWidth={connection.width}
                    fill="none"
                    strokeDasharray={connection.style === 'dashed' ? '5,5' :
                        connection.style === 'dotted' ? '2,2' : 'none'}
                    markerEnd={connection.endArrow ? 'url(#arrowhead)' : undefined}
                    markerStart={connection.startArrow ? 'url(#arrowhead-start)' : undefined}
                />
            </g>
        );
    }, [shapes]);

    const getConnectionPoint = (shape: Shape, point: { x: number; y: number }) => {
        return {
            x: point.x,
            y: point.y
        };
    };

    const createSmoothPath = (start: { x: number; y: number }, end: { x: number; y: number }) => {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Create a smooth bezier curve
        const controlOffset = Math.min(distance * 0.5, 100);

        let controlX1, controlY1, controlX2, controlY2;

        if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal connection
            controlX1 = start.x + (dx > 0 ? controlOffset : -controlOffset);
            controlY1 = start.y;
            controlX2 = end.x + (dx > 0 ? -controlOffset : controlOffset);
            controlY2 = end.y;
        } else {
            // Vertical connection
            controlX1 = start.x;
            controlY1 = start.y + (dy > 0 ? controlOffset : -controlOffset);
            controlX2 = end.x;
            controlY2 = end.y + (dy > 0 ? -controlOffset : controlOffset);
        }

        return `M ${start.x} ${start.y} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${end.x} ${end.y}`;
    };

    return (
        <svg
            className="absolute inset-0 pointer-events-none"
            width="100%"
            height="100%"
            style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: '0 0'
            }}
        >
            <defs>
                <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                >
                    <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
                </marker>
                <marker
                    id="arrowhead-start"
                    markerWidth="10"
                    markerHeight="7"
                    refX="1"
                    refY="3.5"
                    orient="auto"
                >
                    <polygon points="10 0, 0 3.5, 10 7" fill="currentColor" />
                </marker>
            </defs>

            {connections.map(connection => drawConnection(connection))}

            {/* Temporary connection line while connecting */}
            {isConnecting && connectionStart && (
                <path
                    d={createSmoothPath(
                        { x: connectionStart.x, y: connectionStart.y },
                        { x: mousePos.x, y: mousePos.y }
                    )}
                    stroke="#3b82f6"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="5,5"
                    opacity="0.7"
                />
            )}
        </svg>
    );
};
