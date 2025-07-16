import React, { useRef, useCallback, useState, forwardRef } from 'react';
import { Shape, Tool, Connection, ConnectionPoint, SelectionBox, ConnectionHandle } from './types';
import { ConnectionLayer } from './connection-layer';
import { ConnectionHandles } from './connection-handles';
import { ShapeRenderer } from './shape-renderer';


interface CanvasProps {
    shapes: Shape[];
    connections: Connection[];
    selectedIds: Set<string>;
    selectedTool: string;
    zoom: number;
    pan: { x: number; y: number };
    showGrid: boolean;
    isConnecting: boolean;
    connectionStart: ConnectionPoint | null;
    onShapeCreate: (tool: Tool, x: number, y: number) => void;
    onShapeSelect: (id: string | null, multiSelect?: boolean) => void;
    onMultiSelect?: (ids: string[]) => void;
    onShapeUpdate: (id: string, updates: Partial<Shape>) => void;
    onPanChange: (pan: { x: number; y: number }) => void;
    onConnectionStart: (point: ConnectionPoint, tool: Tool) => void;
    onConnectionComplete: (endPoint: ConnectionPoint) => void;
    onConnectionCancel: () => void;
    onConnectionUpdate: (id: string, updates: Partial<Connection>) => void;
    onSelectionBoxUpdate?: (box: SelectionBox) => void;
}

const GRID_SIZE = 20;

export const Canvas = forwardRef<HTMLDivElement, CanvasProps>(({
    shapes,
    connections,
    selectedIds,
    selectedTool,
    zoom,
    pan,
    showGrid,
    isConnecting,
    connectionStart,
    onShapeCreate,
    onShapeSelect,
    onMultiSelect,
    onShapeUpdate,
    onPanChange,
    onConnectionStart,
    onConnectionComplete,
    onConnectionCancel,
    onConnectionUpdate,
    onSelectionBoxUpdate,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [_dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isEditingText, setIsEditingText] = useState(false);
    const [editText, setEditText] = useState('');
    const [editingShapeId, setEditingShapeId] = useState<string | null>(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
    const [hoveredHandle, setHoveredHandle] = useState<ConnectionHandle | null>(null);
    const [draggedShapes, setDraggedShapes] = useState<Map<string, { x: number; y: number }>>(new Map());
    const [resizeStart, setResizeStart] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

    // console.log("container ref: ", containerRef)

    const getToolById = useCallback((toolId: string): Tool | null => {
        const tools = [
            { id: 'rectangle', type: 'rectangle', label: 'Rectangle', category: 'Basic', icon: () => null, defaultWidth: 120, defaultHeight: 80 },
            { id: 'circle', type: 'circle', label: 'Circle', category: 'Basic', icon: () => null, defaultWidth: 100, defaultHeight: 100 },
            { id: 'triangle', type: 'triangle', label: 'Triangle', category: 'Basic', icon: () => null, defaultWidth: 100, defaultHeight: 80 },
            { id: 'diamond', type: 'diamond', label: 'Diamond', category: 'Basic', icon: () => null, defaultWidth: 100, defaultHeight: 80 },
            { id: 'hexagon', type: 'hexagon', label: 'Hexagon', category: 'Basic', icon: () => null, defaultWidth: 100, defaultHeight: 80 },
            { id: 'pentagon', type: 'pentagon', label: 'Pentagon', category: 'Basic', icon: () => null, defaultWidth: 100, defaultHeight: 80 },
            { id: 'star', type: 'star', label: 'Star', category: 'Basic', icon: () => null, defaultWidth: 100, defaultHeight: 80 },
            { id: 'heart', type: 'heart', label: 'Heart', category: 'Basic', icon: () => null, defaultWidth: 100, defaultHeight: 80 },
            { id: 'text', type: 'text', label: 'Text', category: 'Basic', icon: () => null, defaultWidth: 100, defaultHeight: 30 },
            { id: 'line-straight', type: 'connection', label: 'Line', category: 'Connections', icon: () => null, isConnection: true },
            { id: 'line-arrow', type: 'connection', label: 'Arrow', category: 'Connections', icon: () => null, isConnection: true },
            { id: 'line-double-arrow', type: 'connection', label: 'Double Arrow', category: 'Connections', icon: () => null, isConnection: true },
            { id: 'line-dotted', type: 'connection', label: 'Dotted Line', category: 'Connections', icon: () => null, isConnection: true },
            { id: 'line-dotted-arrow', type: 'connection', label: 'Dotted Arrow', category: 'Connections', icon: () => null, isConnection: true },
            { id: 'line-dotted-double', type: 'connection', label: 'Dotted Double', category: 'Connections', icon: () => null, isConnection: true },
        ];
        return tools.find(t => t.id === toolId) || null;
    }, []);

    const updateConnectionsForShape = useCallback((shapeId: string, shape: Shape) => {
        connections.forEach(connection => {
            if (connection.startShapeId === shapeId || connection.endShapeId === shapeId) {
                const updates: Partial<Connection> = {};

                if (connection.startShapeId === shapeId) {
                    const startPoint = getConnectionPointForShape(shape, connection.startPoint);
                    updates.startPoint = startPoint;
                }

                if (connection.endShapeId === shapeId) {
                    const endPoint = getConnectionPointForShape(shape, connection.endPoint);
                    updates.endPoint = endPoint;
                }

                onConnectionUpdate(connection.id, updates);
            }
        });
    }, [connections, onConnectionUpdate]);

    const getConnectionPointForShape = useCallback((shape: Shape, originalPoint: { x: number; y: number }) => {
        const centerX = shape.x + shape.width / 2;
        const centerY = shape.y + shape.height / 2;

        const distances = {
            top: Math.abs(originalPoint.y - shape.y),
            bottom: Math.abs(originalPoint.y - (shape.y + shape.height)),
            left: Math.abs(originalPoint.x - shape.x),
            right: Math.abs(originalPoint.x - (shape.x + shape.width)),
        };

        const closestSide = Object.keys(distances).reduce((a, b) =>
            distances[a as keyof typeof distances] < distances[b as keyof typeof distances] ? a : b
        ) as 'top' | 'right' | 'bottom' | 'left';

        switch (closestSide) {
            case 'top':
                return { x: centerX, y: shape.y };
            case 'bottom':
                return { x: centerX, y: shape.y + shape.height };
            case 'left':
                return { x: shape.x, y: centerY };
            case 'right':
                return { x: shape.x + shape.width, y: centerY };
            default:
                return { x: centerX, y: centerY };
        }
    }, []);

    const getCanvasCoordinates = useCallback((clientX: number, clientY: number) => {
        const container = containerRef.current;
        if (!container) return { x: 0, y: 0 };

        const rect = container.getBoundingClientRect();
        return {
            x: (clientX - rect.left - pan.x) / zoom,
            y: (clientY - rect.top - pan.y) / zoom,
        };
    }, [pan, zoom]);

    const getShapeAt = useCallback((x: number, y: number): Shape | null => {
        for (let i = shapes.length - 1; i >= 0; i--) {
            const shape = shapes[i];
            if (x >= shape.x && x <= shape.x + shape.width &&
                y >= shape.y && y <= shape.y + shape.height) {
                return shape;
            }
        }
        return null;
    }, [shapes]);

    const getConnectionPoint = useCallback((shape: Shape, x: number, y: number): ConnectionPoint => {
        const centerX = shape.x + shape.width / 2;
        const centerY = shape.y + shape.height / 2;

        const distances = {
            top: Math.abs(y - shape.y),
            bottom: Math.abs(y - (shape.y + shape.height)),
            left: Math.abs(x - shape.x),
            right: Math.abs(x - (shape.x + shape.width)),
        };

        const closestSide = Object.keys(distances).reduce((a, b) =>
            distances[a as keyof typeof distances] < distances[b as keyof typeof distances] ? a : b
        ) as 'top' | 'right' | 'bottom' | 'left';

        let pointX, pointY;
        switch (closestSide) {
            case 'top':
                pointX = centerX;
                pointY = shape.y;
                break;
            case 'bottom':
                pointX = centerX;
                pointY = shape.y + shape.height;
                break;
            case 'left':
                pointX = shape.x;
                pointY = centerY;
                break;
            case 'right':
                pointX = shape.x + shape.width;
                pointY = centerY;
                break;
        }

        return {
            shapeId: shape.id,
            x: pointX,
            y: pointY,
            side: closestSide,
        };
    }, []);

    const getHandleAt = useCallback((x: number, y: number): ConnectionHandle | null => {
        for (const shape of shapes) {
            if (!selectedIds.has(shape.id) && !isConnecting) continue;

            const handles = [
                { shapeId: shape.id, side: 'top' as const, x: shape.x + shape.width / 2, y: shape.y },
                { shapeId: shape.id, side: 'right' as const, x: shape.x + shape.width, y: shape.y + shape.height / 2 },
                { shapeId: shape.id, side: 'bottom' as const, x: shape.x + shape.width / 2, y: shape.y + shape.height },
                { shapeId: shape.id, side: 'left' as const, x: shape.x, y: shape.y + shape.height / 2 },
            ];

            for (const handle of handles) {
                const distance = Math.sqrt(
                    Math.pow(x - handle.x, 2) + Math.pow(y - handle.y, 2)
                );
                if (distance <= 15 / zoom) {
                    return handle;
                }
            }
        }
        return null;
    }, [shapes, selectedIds, isConnecting, zoom]);

    const getResizeHandleAt = useCallback((x: number, y: number, shape: Shape): string | null => {
        const handleSize = 8 / zoom;
        const handles = [
            { position: 'nw', x: shape.x - handleSize / 2, y: shape.y - handleSize / 2 },
            { position: 'ne', x: shape.x + shape.width - handleSize / 2, y: shape.y - handleSize / 2 },
            { position: 'sw', x: shape.x - handleSize / 2, y: shape.y + shape.height - handleSize / 2 },
            { position: 'se', x: shape.x + shape.width - handleSize / 2, y: shape.y + shape.height - handleSize / 2 },
            { position: 'n', x: shape.x + shape.width / 2 - handleSize / 2, y: shape.y - handleSize / 2 },
            { position: 's', x: shape.x + shape.width / 2 - handleSize / 2, y: shape.y + shape.height - handleSize / 2 },
            { position: 'e', x: shape.x + shape.width - handleSize / 2, y: shape.y + shape.height / 2 - handleSize / 2 },
            { position: 'w', x: shape.x - handleSize / 2, y: shape.y + shape.height / 2 - handleSize / 2 },
        ];

        for (const handle of handles) {
            if (x >= handle.x && x <= handle.x + handleSize &&
                y >= handle.y && y <= handle.y + handleSize) {
                return handle.position;
            }
        }
        return null;
    }, [zoom]);

    const handleShapeUpdate = useCallback((id: string, updates: Partial<Shape>) => {
        onShapeUpdate(id, updates);

        const updatedShape = shapes.find(s => s.id === id);
        if (updatedShape) {
            const newShape = { ...updatedShape, ...updates };
            updateConnectionsForShape(id, newShape);
        }
    }, [onShapeUpdate, shapes, updateConnectionsForShape]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        const coords = getCanvasCoordinates(e.clientX, e.clientY);

        if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
            setIsPanning(true);
            setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
            return;
        }

        const handle = getHandleAt(coords.x, coords.y);
        if (handle) {
            if (isConnecting && connectionStart && handle.shapeId !== connectionStart.shapeId) {
                const connectionPoint = {
                    shapeId: handle.shapeId,
                    x: handle.x,
                    y: handle.y,
                    side: handle.side,
                };
                onConnectionComplete(connectionPoint);
                return;
            } else if (selectedTool === 'select' && !isConnecting) {
                const tool = getToolById('line-arrow');
                if (tool) {
                    const connectionPoint = {
                        shapeId: handle.shapeId,
                        x: handle.x,
                        y: handle.y,
                        side: handle.side,
                    };
                    onConnectionStart(connectionPoint, tool);
                }
                return;
            }
        }

        const clickedShape = getShapeAt(coords.x, coords.y);

        if (selectedTool === 'select') {
            if (clickedShape && selectedIds.has(clickedShape.id)) {
                const resizeHandle = getResizeHandleAt(coords.x, coords.y, clickedShape);
                if (resizeHandle) {
                    setIsResizing(true);
                    setResizeStart({
                        x: coords.x,
                        y: coords.y,
                        width: clickedShape.width,
                        height: clickedShape.height,
                    });
                    return;
                }
            }

            if (clickedShape) {
                const multiSelect = e.shiftKey || e.metaKey;
                onShapeSelect(clickedShape.id, multiSelect);

                const initialPositions = new Map();
                selectedIds.forEach(id => {
                    const shape = shapes.find(s => s.id === id);
                    if (shape) {
                        initialPositions.set(id, { x: shape.x, y: shape.y });
                    }
                });

                if (!selectedIds.has(clickedShape.id)) {
                    initialPositions.set(clickedShape.id, { x: clickedShape.x, y: clickedShape.y });
                }

                setDraggedShapes(initialPositions);
                setIsDragging(true);
                setDragStart(coords);
                setDragOffset({
                    x: coords.x - clickedShape.x,
                    y: coords.y - clickedShape.y,
                });
            } else {
                if (isConnecting) {
                    onConnectionCancel();
                    return;
                }

                if (!e.shiftKey && !e.metaKey) {
                    onShapeSelect(null);
                }
                setIsSelecting(true);
                setSelectionBox({
                    startX: coords.x,
                    startY: coords.y,
                    endX: coords.x,
                    endY: coords.y,
                });
            }
        } else {
            const tool = getToolById(selectedTool);
            if (tool) {
                if (tool.isConnection) {
                    if (clickedShape) {
                        const connectionPoint = getConnectionPoint(clickedShape, coords.x, coords.y);
                        onConnectionStart(connectionPoint, tool);
                    }
                } else {
                    onShapeCreate(tool, coords.x, coords.y);
                }
            }
        }
    }, [selectedTool, getCanvasCoordinates, getShapeAt, getHandleAt, getResizeHandleAt, selectedIds, onShapeSelect, onShapeCreate, onConnectionStart, onConnectionComplete, onConnectionCancel, getConnectionPoint, pan, shapes, isConnecting, connectionStart, getToolById]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const coords = getCanvasCoordinates(e.clientX, e.clientY);
        setMousePos(coords);

        const handle = getHandleAt(coords.x, coords.y);
        setHoveredHandle(handle);

        if (isPanning) {
            onPanChange({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
            });
            return;
        }

        if (isSelecting && selectionBox) {
            const newBox = {
                ...selectionBox,
                endX: coords.x,
                endY: coords.y,
            };
            setSelectionBox(newBox);
            onSelectionBoxUpdate?.(newBox);
            return;
        }

        if (isResizing && resizeStart && selectedIds.size === 1) {
            const deltaX = coords.x - resizeStart.x;
            const deltaY = coords.y - resizeStart.y;
            const id = Array.from(selectedIds)[0];

            handleShapeUpdate(id, {
                width: Math.max(20, resizeStart.width + deltaX),
                height: Math.max(20, resizeStart.height + deltaY),
            });
            return;
        }

        if (isDragging && draggedShapes.size > 0) {
            const deltaX = coords.x - dragStart.x;
            const deltaY = coords.y - dragStart.y;

            draggedShapes.forEach((initialPos, id) => {
                handleShapeUpdate(id, {
                    x: initialPos.x + deltaX,
                    y: initialPos.y + deltaY,
                });
            });
            return;
        }
    }, [isDragging, isPanning, isSelecting, isResizing, draggedShapes, dragStart, selectionBox, resizeStart, selectedIds, getCanvasCoordinates, handleShapeUpdate, onPanChange, onSelectionBoxUpdate, getHandleAt]);

    const handleMouseUp = useCallback((e: React.MouseEvent) => {
        if (isConnecting && connectionStart) {
            const coords = getCanvasCoordinates(e.clientX, e.clientY);
            const handle = getHandleAt(coords.x, coords.y);

            if (handle && handle.shapeId !== connectionStart.shapeId) {
                const connectionPoint = {
                    shapeId: handle.shapeId,
                    x: handle.x,
                    y: handle.y,
                    side: handle.side,
                };
                onConnectionComplete(connectionPoint);
            } else {
                const shape = getShapeAt(coords.x, coords.y);
                if (shape && shape.id !== connectionStart.shapeId) {
                    const connectionPoint = getConnectionPoint(shape, coords.x, coords.y);
                    onConnectionComplete(connectionPoint);
                } else {
                    onConnectionCancel();
                }
            }
        }

        if (isSelecting && selectionBox && onMultiSelect) {
            const shapesInBox = shapes.filter(shape => {
                const minX = Math.min(selectionBox.startX, selectionBox.endX);
                const maxX = Math.max(selectionBox.startX, selectionBox.endX);
                const minY = Math.min(selectionBox.startY, selectionBox.endY);
                const maxY = Math.max(selectionBox.startY, selectionBox.endY);

                return shape.x >= minX &&
                    shape.x + shape.width <= maxX &&
                    shape.y >= minY &&
                    shape.y + shape.height <= maxY;
            });

            if (shapesInBox.length > 0) {
                onMultiSelect(shapesInBox.map(s => s.id));
            }
        }

        setIsDragging(false);
        setIsResizing(false);
        setIsPanning(false);
        setIsSelecting(false);
        setSelectionBox(null);
        setDraggedShapes(new Map());
        setResizeStart(null);
    }, [isConnecting, isSelecting, selectionBox, shapes, connectionStart, getCanvasCoordinates, getHandleAt, getShapeAt, getConnectionPoint, onConnectionComplete, onConnectionCancel, onMultiSelect]);

    const handleDoubleClick = useCallback((e: React.MouseEvent) => {
        if (selectedTool !== 'select') return;

        const coords = getCanvasCoordinates(e.clientX, e.clientY);
        const clickedShape = getShapeAt(coords.x, coords.y);

        if (clickedShape) {
            setIsEditingText(true);
            setEditText(clickedShape.text);
            setEditingShapeId(clickedShape.id);
        }
    }, [selectedTool, getCanvasCoordinates, getShapeAt]);

    const handleTextChange = useCallback((newText: string) => {
        setEditText(newText);
        if (editingShapeId) {
            handleShapeUpdate(editingShapeId, { text: newText });
        }
    }, [editingShapeId, handleShapeUpdate]);

    const handleTextSubmit = useCallback(() => {
        setIsEditingText(false);
        setEditText('');
        setEditingShapeId(null);
    }, []);

    const handleConnectionStart = useCallback((handle: ConnectionHandle) => {
        const tool = getToolById('line-arrow');
        if (tool) {
            const connectionPoint = {
                shapeId: handle.shapeId,
                x: handle.x,
                y: handle.y,
                side: handle.side,
            };
            onConnectionStart(connectionPoint, tool);
        }
    }, [onConnectionStart, getToolById]);

    const selectedShape = shapes.find(s => editingShapeId === s.id);

    return (
        <div className="relative w-full h-full overflow-hidden bg-white">
            {showGrid && (
                <div
                    className="absolute inset-0 opacity-50"
                    style={{
                        backgroundImage: `
              linear-gradient(to right, #e5e7eb 1px, transparent 1px),
              linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
            `,
                        backgroundSize: `${GRID_SIZE * zoom}px ${GRID_SIZE * zoom}px`,
                        backgroundPosition: `${pan.x}px ${pan.y}px`,
                    }}
                />
            )}

            <div
                ref={containerRef}
                className="relative w-full h-full"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onDoubleClick={handleDoubleClick}
                style={{
                    cursor: isDragging ? 'grabbing' :
                        isPanning ? 'grabbing' :
                            isConnecting ? 'crosshair' :
                                isResizing ? 'nw-resize' :
                                    hoveredHandle ? 'pointer' :
                                        selectedTool === 'select' ? 'default' : 'crosshair'
                }}
            >
                <div
                    className="absolute inset-0"
                    style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        transformOrigin: '0 0'
                    }}
                >
                    {shapes.map(shape => (
                        <div key={shape.id} className="relative">
                            <ShapeRenderer
                                shape={shape}
                                isSelected={selectedIds.has(shape.id)}
                                onDoubleClick={() => {
                                    setIsEditingText(true);
                                    setEditText(shape.text);
                                    setEditingShapeId(shape.id);
                                }}
                            />

                            <ConnectionHandles
                                shape={shape}
                                isSelected={selectedIds.has(shape.id)}
                                isConnecting={isConnecting}
                                hoveredHandle={hoveredHandle}
                                onConnectionStart={handleConnectionStart}
                                onHandleHover={setHoveredHandle}
                                zoom={zoom}
                            />

                            {selectedIds.has(shape.id) && selectedIds.size === 1 && (
                                <>
                                    {['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'].map(position => (
                                        <div
                                            key={position}
                                            className="absolute bg-blue-500 border border-white cursor-nw-resize"
                                            style={{
                                                width: 8 / zoom,
                                                height: 8 / zoom,
                                                left: position.includes('w') ? shape.x - 4 / zoom :
                                                    position.includes('e') ? shape.x + shape.width - 4 / zoom :
                                                        shape.x + shape.width / 2 - 4 / zoom,
                                                top: position.includes('n') ? shape.y - 4 / zoom :
                                                    position.includes('s') ? shape.y + shape.height - 4 / zoom :
                                                        shape.y + shape.height / 2 - 4 / zoom,
                                                zIndex: 1001,
                                            }}
                                        />
                                    ))}
                                </>
                            )}
                        </div>
                    ))}

                    {selectionBox && (
                        <div
                            className="absolute border-2 border-blue-400 bg-opacity-10 pointer-events-none"
                            style={{
                                left: Math.min(selectionBox.startX, selectionBox.endX),
                                top: Math.min(selectionBox.startY, selectionBox.endY),
                                width: Math.abs(selectionBox.endX - selectionBox.startX),
                                height: Math.abs(selectionBox.endY - selectionBox.startY),
                            }}
                        />
                    )}
                </div>

                <ConnectionLayer
                    connections={connections}
                    shapes={shapes}
                    isConnecting={isConnecting}
                    connectionStart={connectionStart}
                    mousePos={mousePos}
                    zoom={zoom}
                    pan={pan}
                />
            </div>

            {isEditingText && selectedShape && (
                <textarea
                    value={editText}
                    onChange={(e) => handleTextChange(e.target.value)}
                    onBlur={handleTextSubmit}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleTextSubmit();
                        }
                        if (e.key === 'Escape') {
                            setIsEditingText(false);
                            setEditingShapeId(null);
                        }
                    }}
                    autoFocus
                    className="absolute bg-white border-2 border-blue-500 rounded px-2 py-1 text-center resize-none outline-none z-50"
                    style={{
                        left: `${(selectedShape.x * zoom) + pan.x}px`,
                        top: `${(selectedShape.y * zoom) + pan.y}px`,
                        width: `${selectedShape.width * zoom}px`,
                        height: `${selectedShape.height * zoom}px`,
                        fontSize: `${selectedShape.fontSize * zoom}px`,
                        fontFamily: selectedShape.fontFamily,
                    }}
                />
            )}
        </div>
    );
});

Canvas.displayName = 'Canvas';
