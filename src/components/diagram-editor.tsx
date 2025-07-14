"use client"

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Toolbar } from './diagram/toolbar';
import { ShapePanel } from './diagram/shape-panel';
import { StylePanel } from './diagram/style-panel';
import { Canvas } from './diagram/canvas';
import { useShapes } from '@/hooks/use-shapes';
import { useSelection } from '@/hooks/use-selection';
import { useHistory } from '@/hooks/use-history';
import { useConnections } from '@/hooks/use-connection';
import { useClipboard } from '@/hooks/use-clipboard';
import { Shape, Tool, ConnectionPoint, SelectionBox } from './diagram/types';

const DiagramEditor: React.FC = () => {
    const canvasRef = useRef<HTMLDivElement>(null);

    // Core state management
    const { shapes, addShape, updateShape, deleteShape, clearShapes, addShapes } = useShapes();
    const {
        selectedIds,
        selectedShapes,
        primarySelectedShape,
        selectShape,
        selectShapes,
        clearSelection,
        selectAll,
        isSelecting,
        setIsSelecting,
        selectionBox,
        setSelectionBox,
        getShapesInBox
    } = useSelection(shapes);

    const { saveState, undo, redo, canUndo, canRedo } = useHistory(shapes);
    const {
        connections,
        isConnecting,
        connectionStart,
        startConnection,
        completeConnection,
        cancelConnection,
        addConnections
    } = useConnections();

    const { copyToClipboard, pasteFromClipboard, hasClipboardData } = useClipboard();

    // UI state
    const [selectedTool, setSelectedTool] = useState<string>('select');
    const [leftPanelOpen, setLeftPanelOpen] = useState(true);
    const [rightPanelOpen, setRightPanelOpen] = useState(true);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [showGrid, setShowGrid] = useState(true);

    // Save state when shapes change
    useEffect(() => {
        saveState(shapes);
    }, [shapes, saveState]);

    const handleToolSelect = useCallback((toolId: string) => {
        setSelectedTool(toolId);
        if (toolId !== 'select') {
            clearSelection();
        }
        // Cancel any ongoing connection
        if (isConnecting) {
            cancelConnection();
        }
    }, [clearSelection, isConnecting, cancelConnection]);

    const handleShapeCreate = useCallback((tool: Tool, x: number, y: number) => {
        const shape = addShape(tool, x, y);
        selectShape(shape.id);
        setSelectedTool('select');
    }, [addShape, selectShape]);

    const handleShapeSelect = useCallback((id: string | null, multiSelect = false) => {
        if (id === null) {
            clearSelection();
        } else {
            selectShape(id, multiSelect);
        }
    }, [selectShape, clearSelection]);

    const handleMultiSelect = useCallback((ids: string[]) => {
        selectShapes(ids);
    }, [selectShapes]);

    const handleShapeUpdate = useCallback((id: string, updates: Partial<Shape>) => {
        updateShape(id, updates);
    }, [updateShape]);

    const handleShapeDelete = useCallback(() => {
        if (selectedIds.size > 0) {
            selectedIds.forEach(id => {
                deleteShape(id);
            });
            clearSelection();
        }
    }, [selectedIds, deleteShape, clearSelection]);

    const handleCopy = useCallback(() => {
        if (selectedShapes.length > 0) {
            const relevantConnections = connections.filter(conn =>
                selectedIds.has(conn.startShapeId) && selectedIds.has(conn.endShapeId)
            );
            copyToClipboard(selectedShapes, relevantConnections);
        }
    }, [selectedShapes, selectedIds, connections, copyToClipboard]);

    const handlePaste = useCallback(() => {
        if (hasClipboardData) {
            const { shapes: newShapes, connections: newConnections } = pasteFromClipboard();
            addShapes(newShapes);
            addConnections(newConnections);
            selectShapes(newShapes.map((s: { id: any; }) => s.id));
        }
    }, [hasClipboardData, pasteFromClipboard, addShapes, addConnections, selectShapes]);

    const handleSelectAll = useCallback(() => {
        selectAll();
    }, [selectAll]);

    const handleConnectionStart = useCallback((point: ConnectionPoint, tool: Tool) => {
        startConnection(point, tool);
    }, [startConnection]);

    const handleConnectionComplete = useCallback((endPoint: ConnectionPoint) => {
        completeConnection(endPoint);
    }, [completeConnection]);

    const handleConnectionCancel = useCallback(() => {
        cancelConnection();
    }, [cancelConnection]);

    const handleSelectionBoxUpdate = useCallback((box: SelectionBox) => {
        setSelectionBox(box);
    }, [setSelectionBox]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

        if (e.key === 'Delete' || e.key === 'Backspace') {
            handleShapeDelete();
        }

        if (e.key === 'Escape' && isConnecting) {
            cancelConnection();
        }

        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'z':
                    e.preventDefault();
                    undo();
                    break;
                case 'y':
                    e.preventDefault();
                    redo();
                    break;
                case 'c':
                    e.preventDefault();
                    handleCopy();
                    break;
                case 'v':
                    e.preventDefault();
                    handlePaste();
                    break;
                case 'a':
                    e.preventDefault();
                    handleSelectAll();
                    break;
            }
        }
    }, [handleShapeDelete, undo, redo, isConnecting, cancelConnection, handleCopy, handlePaste, handleSelectAll]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return (
        <div className="h-screen bg-gray-100 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-6">
                    <h1 className="text-xl font-semibold text-gray-800">Diagram Creator</h1>
                    <nav className="flex space-x-4 text-sm text-gray-600">
                        <button className="hover:text-gray-800 transition-colors">File</button>
                        <button className="hover:text-gray-800 transition-colors">Edit</button>
                        <button className="hover:text-gray-800 transition-colors">View</button>
                        <button className="hover:text-gray-800 transition-colors">Arrange</button>
                    </nav>
                </div>
                <div className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600 transition-colors cursor-pointer">
                    Unsaved changes. Click here to save.
                </div>
            </header>

            {/* Toolbar */}
            <Toolbar
                selectedTool={selectedTool}
                onToolSelect={handleToolSelect}
                zoom={zoom}
                onZoomChange={setZoom}
                canUndo={canUndo}
                canRedo={canRedo}
                onUndo={undo}
                onRedo={redo}
                onDelete={handleShapeDelete}
                onCopy={handleCopy}
                onPaste={handlePaste}
                onSelectAll={handleSelectAll}
                hasSelection={selectedIds.size > 0}
                hasClipboard={hasClipboardData}
                leftPanelOpen={leftPanelOpen}
                rightPanelOpen={rightPanelOpen}
                onToggleLeftPanel={() => setLeftPanelOpen(!leftPanelOpen)}
                onToggleRightPanel={() => setRightPanelOpen(!rightPanelOpen)}
            />

            {/* Main content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left panel - Shapes */}
                {leftPanelOpen && (
                    <div className="w-64 bg-white border-r border-gray-200 shadow-sm">
                        <ShapePanel
                            selectedTool={selectedTool}
                            onToolSelect={handleToolSelect}
                        />
                    </div>
                )}

                {/* Canvas area */}
                <div className="flex-1 relative">
                    <Canvas
                        ref={canvasRef}
                        shapes={shapes}
                        connections={connections}
                        selectedIds={selectedIds}
                        selectedTool={selectedTool}
                        zoom={zoom}
                        pan={pan}
                        showGrid={showGrid}
                        isConnecting={isConnecting}
                        connectionStart={connectionStart}
                        onShapeCreate={handleShapeCreate}
                        onShapeSelect={handleShapeSelect}
                        onMultiSelect={handleMultiSelect}
                        onShapeUpdate={handleShapeUpdate}
                        onPanChange={setPan}
                        onConnectionStart={handleConnectionStart}
                        onConnectionComplete={handleConnectionComplete}
                        onConnectionCancel={handleConnectionCancel}
                        onSelectionBoxUpdate={handleSelectionBoxUpdate}
                    />
                </div>

                {/* Right panel - Styles */}
                {rightPanelOpen && (
                    <div className="w-64 bg-white border-l border-gray-200 shadow-sm">
                        <StylePanel
                            selectedShape={primarySelectedShape}
                            selectedShapes={selectedShapes}
                            onShapeUpdate={handleShapeUpdate}
                            showGrid={showGrid}
                            onShowGridChange={setShowGrid}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiagramEditor;
