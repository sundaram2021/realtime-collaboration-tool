import React from 'react';
import { Shape, ConnectionHandle } from './types';

interface ConnectionHandlesProps {
    shape: Shape;
    isSelected: boolean;
    isConnecting: boolean;
    hoveredHandle: ConnectionHandle | null;
    onConnectionStart: (handle: ConnectionHandle) => void;
    onHandleHover: (handle: ConnectionHandle | null) => void;
    zoom: number;
}

const getConnectionHandles = (shape: Shape): ConnectionHandle[] => {
    const { x, y, width, height } = shape;
    return [
        { shapeId: shape.id, side: 'top', x: x + width / 2, y: y },
        { shapeId: shape.id, side: 'right', x: x + width, y: y + height / 2 },
        { shapeId: shape.id, side: 'bottom', x: x + width / 2, y: y + height },
        { shapeId: shape.id, side: 'left', x: x, y: y + height / 2 },
    ];
};

// connection handles
export const ConnectionHandles: React.FC<ConnectionHandlesProps> = React.memo(({
    shape,
    isSelected,
    isConnecting,
    hoveredHandle,
    onConnectionStart,
    onHandleHover,
    zoom,
}) => {
    // Show handles when shape is selected OR when we're in connecting mode
    if (!isSelected && !isConnecting) return null;

    const handles = getConnectionHandles(shape);
    const handleSize = Math.max(8 / zoom, 4); // Minimum size for visibility

    return (
        <>
            {handles.map((handle, _index) => {
                const isHovered = hoveredHandle?.shapeId === handle.shapeId &&
                    hoveredHandle?.side === handle.side;

                return (
                    <div
                        key={`${handle.shapeId}-${handle.side}`}
                        className={`absolute cursor-pointer transition-all duration-200 ${isHovered ? 'scale-125' : ''
                            }`}
                        style={{
                            left: handle.x - handleSize / 2,
                            top: handle.y - handleSize / 2,
                            width: handleSize,
                            height: handleSize,
                            zIndex: 1000,
                        }}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            onConnectionStart(handle);
                        }}
                        onMouseEnter={() => onHandleHover(handle)}
                        onMouseLeave={() => onHandleHover(null)}
                    >
                        <div
                            className={`w-full h-full rounded-full border-2 border-white transition-colors duration-200 ${isConnecting
                                    ? (isHovered ? 'bg-green-600 shadow-lg' : 'bg-green-500')
                                    : (isHovered ? 'bg-blue-600 shadow-lg' : 'bg-blue-500')
                                }`}
                            style={{
                                boxShadow: isHovered ?
                                    (isConnecting ? '0 0 0 2px rgba(34, 197, 94, 0.3)' : '0 0 0 2px rgba(59, 130, 246, 0.3)')
                                    : undefined,
                            }}
                        />
                    </div>
                );
            })}
        </>
    );
});
