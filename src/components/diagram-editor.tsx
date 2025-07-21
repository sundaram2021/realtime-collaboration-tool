"use client"

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Canvas } from './diagram/canvas';
import { useShapes } from '@/hooks/use-shapes';
import { useSelection } from '@/hooks/use-selection';
import { useHistory } from '@/hooks/use-history';
import { useConnections } from '@/hooks/use-connection';
import { useDrawing } from '@/hooks/use-drawing';
import { useClipboard } from '@/hooks/use-clipboard';
import { Shape, Tool, Connection, ConnectionPoint, SelectionBox, HistoryEntry } from './diagram/types';
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
    const { drawings, setDrawings, startDrawing, addPointToDrawing, finishDrawing } = useDrawing();
    const {
        selectedIds,
        selectedShapes,
        primarySelectedShape,
        selectShape,
        selectShapes,
        clearSelection,
    } = useSelection(shapes);

    const {
        connections,
        setConnections,
        isConnecting,
        connectionStart,
        startConnection,
        completeConnection,
        cancelConnection,
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
                supabase.channel(`diagram:${diagramId}`).send({
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
            addShape(tool, x, y);
            setSelectedTool('select');
        }
    }, [addShape, effectivePermission]);

    const handleShapeUpdate = useCallback((id: string, updates: Partial<Shape>) => {
        if (effectivePermission === 'edit') {
            updateShape(id, updates);
        }
    }, [updateShape, effectivePermission]);

    const handleSaveToDrive = useCallback(async () => {
        if (!session || !session.provider_token) {
            toast({
                title: "Authentication Error",
                description: "You need to re-authenticate with Google Drive.",
                variant: "destructive",
            });
            return;
        }

        if (!canvasRef.current) return;

        try {
            const canvas = await html2canvas(canvasRef.current, { backgroundColor: '#f9fafb' });
            canvas.toBlob(async (blob) => {
                if (!blob) return;
                const fileName = `${diagram?.title || 'diagram'}-${new Date().toISOString()}.png`;
                const metadata = { name: fileName, mimeType: 'image/png' };
                const form = new FormData();
                form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
                form.append('file', blob);

                const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${session.provider_token}` },
                    body: form,
                });

                if (!response.ok) throw new Error('Failed to upload file.');

                toast({
                    title: "Diagram Saved",
                    description: "Your diagram has been saved to Google Drive.",
                });
            }, 'image/png');
        } catch (error: any) {
            toast({
                title: "Error Saving",
                description: error.message || "Could not save to Google Drive.",
                variant: "destructive",
            });
        }
    }, [session, toast, diagram?.title]);


    const handleDownload = useCallback(() => {
        if (!canvasRef.current) return;
        html2canvas(canvasRef.current, { backgroundColor: '#f9fafb' }).then((canvas) => {
            const link = document.createElement('a');
            link.download = `${diagram?.title || 'diagram'}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    }, [diagram?.title]);


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
                onSaveToDrive={handleSaveToDrive}
                onDownload={handleDownload}
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
                    onShapeSelect={selectShape}
                    onMultiSelect={selectShapes}
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

                <LeftSidebar
                    selectedTool={selectedTool}
                    onToolSelect={setSelectedTool}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    onUndo={undo}
                    onRedo={redo}
                />

                <BottomBar
                    zoom={zoom}
                    onZoomChange={setZoom}
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