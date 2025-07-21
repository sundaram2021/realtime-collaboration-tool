"use client"

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Canvas } from './diagram/canvas';
import { useShapes } from '@/hooks/use-shapes';
import { useSelection } from '@/hooks/use-selection';
import { useHistory } from '@/hooks/use-history';
import { useConnections } from '@/hooks/use-connection';
import { useDrawing } from '@/hooks/use-drawing';
import { useClipboard } from '@/hooks/use-clipboard';
import { Shape, Tool, Connection, ConnectionPoint, SelectionBox, HistoryEntry, Drawing } from './diagram/types';
import { useToast } from '@/hooks/use-toast';
import { useDiagrams } from "@/hooks/use-diagrams";
import { supabase } from '@/lib/supabaseClient';
import { ShareDialog } from './diagram/share-dialog';
import html2canvas from 'html2canvas';
import { usePresence } from '@/hooks/use-presence';
import Loading from './loading';
import { Session } from '@supabase/supabase-js';
import { LeftSidebar } from './diagram/left-sidebar';
import { TopBar } from './diagram/top-bar';
import { BottomBar } from './diagram/bottom-bar';
import { StylePanel } from './diagram/style-panel';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';

const DiagramEditor: React.FC<{ diagramId: string, permission: 'view' | 'edit', initialSession: Session }> = ({ diagramId, permission, initialSession }) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [session] = useState(initialSession);
    const { signOut } = useSupabaseAuth();
    const { presentUsers } = usePresence(diagramId);
    const { toast } = useToast();
    const { diagram, isLoadingDiagram, updateDiagram } = useDiagrams(diagramId);
    const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

    const { shapes, setShapes, addShape, updateShape, addShapes } = useShapes();
    const { drawings, setDrawings, isDrawing, startDrawing, addPointToDrawing, finishDrawing } = useDrawing();
    const {
        selectedIds,
        selectedShapes,
        primarySelectedShape,
        selectShape,
        selectShapes,
        clearSelection,
        selectAll,
    } = useSelection(shapes);

    const {
        connections,
        setConnections,
        isConnecting,
        connectionStart,
        startConnection,
        completeConnection,
        cancelConnection,
        addConnections,
        updateConnection
    } = useConnections();

    const restoreState = useCallback(({ shapes, connections, drawings }: HistoryEntry) => {
        setShapes(shapes);
        setConnections(connections);
        setDrawings(drawings);
    }, [setShapes, setConnections, setDrawings]);

    const { saveState, undo, redo, canUndo, canRedo } = useHistory(restoreState);
    const { copyToClipboard, pasteFromClipboard, hasClipboardData } = useClipboard();

    const [rightPanelOpen, setRightPanelOpen] = useState(true);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [showGrid, setShowGrid] = useState(true);
    const [selectedTool, setSelectedTool] = useState<string>('select');

    // Drawing style state
    const [penColor, setPenColor] = useState('#000000');
    const [penWidth, setPenWidth] = useState(3);

    const effectivePermission = useMemo(() => {
        if (isLoadingDiagram || !diagram || !session?.user) return 'view';
        if (diagram.user_id === session.user.id) return 'edit';
        return permission;
    }, [diagram, session?.user, isLoadingDiagram, permission]);

    useEffect(() => {
        if (diagram) {
            setShapes(diagram.data.shapes || []);
            setConnections(diagram.data.connections || []);
            setDrawings(diagram.data.drawings || []);
        }
    }, [diagram, setShapes, setConnections, setDrawings]);

    useEffect(() => {
        const channel = supabase.channel(`diagram:${diagramId}`);
        channel
            .on('broadcast', { event: 'update' }, (payload) => {
                const { shapes, connections, drawings } = payload.payload;
                if (shapes) setShapes(shapes);
                if (connections) setConnections(connections);
                if (drawings) setDrawings(drawings);
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [diagramId, setShapes, setConnections, setDrawings]);

    useEffect(() => {
        if (diagramId && effectivePermission === 'edit') {
            const diagramData = { shapes, connections, drawings };
            const broadcastChanges = () => {
                const channel = supabase.channel(`diagram:${diagramId}`);
                channel.send({
                    type: 'broadcast',
                    event: 'update',
                    payload: diagramData,
                });
            };
            const timeoutId = setTimeout(() => {
                updateDiagram({ id: diagramId, data: diagramData });
                broadcastChanges();
            }, 500);
            return () => clearTimeout(timeoutId);
        }
    }, [shapes, connections, drawings, diagramId, updateDiagram, effectivePermission]);

    useEffect(() => {
        saveState({ shapes, connections, drawings });
    }, [shapes, connections, drawings, saveState]);

    const handleDrawingStart = useCallback((x: number, y: number) => {
        if (effectivePermission === 'edit') {
            startDrawing(x, y, penColor, penWidth);
        }
    }, [effectivePermission, startDrawing, penColor, penWidth]);

    const handleDrawingUpdate = useCallback((x: number, y: number) => {
        if (effectivePermission === 'edit') {
            addPointToDrawing(x, y);
        }
    }, [effectivePermission, addPointToDrawing]);

    const handleDrawingEnd = useCallback(() => {
        if (effectivePermission === 'edit') {
            finishDrawing();
        }
    }, [effectivePermission, finishDrawing]);

    const handleShapeCreate = useCallback((tool: Tool, x: number, y: number) => {
        if (effectivePermission === 'edit') {
            const shape = addShape(tool, x, y);
            selectShape(shape.id);
            setSelectedTool('select');
        }
    }, [addShape, selectShape, effectivePermission]);

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
        if (effectivePermission === 'edit') {
            updateShape(id, updates);
        }
    }, [updateShape, effectivePermission]);

    if (isLoadingDiagram) {
        return <Loading />;
    }

    return (
        <div className="h-screen w-screen bg-gray-50 flex flex-col overflow-hidden">
            {isShareDialogOpen && <ShareDialog diagramId={diagramId} onClose={() => setIsShareDialogOpen(false)} />}

            <TopBar
                diagramTitle={diagram?.title || "Untitled Diagram"}
                presentUsers={presentUsers}
                setIsShareDialogOpen={setIsShareDialogOpen}
                signOut={signOut}
            />

            <main className="flex-1 relative">
                <Canvas
                    ref={canvasRef}
                    shapes={shapes}
                    connections={connections}
                    drawings={drawings}
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
                    onConnectionStart={startConnection}
                    onConnectionComplete={completeConnection}
                    onConnectionCancel={cancelConnection}
                    onConnectionUpdate={updateConnection}
                    onDrawingStart={handleDrawingStart}
                    onDrawingUpdate={handleDrawingUpdate}
                    onDrawingEnd={handleDrawingEnd}
                />

                <LeftSidebar selectedTool={selectedTool} onToolSelect={setSelectedTool} />

                <BottomBar
                    zoom={zoom}
                    onZoomChange={setZoom}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    onUndo={undo}
                    onRedo={redo}
                />

                {rightPanelOpen && (
                    <aside className="absolute top-16 right-4 bottom-16 z-20">
                        <StylePanel
                            selectedShape={primarySelectedShape}
                            selectedShapes={selectedShapes}
                            onShapeUpdate={handleShapeUpdate}
                            showGrid={showGrid}
                            onShowGridChange={setShowGrid}
                        />
                    </aside>
                )}
            </main>
        </div>
    );
};

export default DiagramEditor;