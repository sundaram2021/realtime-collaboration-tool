"use client"

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Toolbar } from './diagram/toolbar';
import { ShapePanel } from './diagram/shape-panel';
import { StylePanel } from './diagram/style-panel';
import { Canvas } from './diagram/canvas';
import { useShapes } from '@/hooks/use-shapes';
import { useSelection } from '@/hooks/use-selection';
import { useHistory } from '@/hooks/use-history';
import { useConnections } from '@/hooks/use-connection';
import { useClipboard } from '@/hooks/use-clipboard';
import { Shape, Tool, Connection, ConnectionPoint, SelectionBox, HistoryEntry } from './diagram/types';
import { useToast } from '@/hooks/use-toast';
import { useDiagrams } from "@/hooks/use-diagrams";
import { supabase } from '@/lib/supabaseClient';
import { ShareDialog } from './diagram/share-dialog';
import html2canvas from 'html2canvas';
import { usePresence } from '@/hooks/use-presence';
import Image from 'next/image';
import Loading from './loading';
import { Session } from '@supabase/supabase-js';

const DiagramEditor: React.FC<{ diagramId: string, permission: 'view' | 'edit', initialSession: Session }> = ({ diagramId, permission, initialSession }) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [session] = useState(initialSession);
    const { presentUsers } = usePresence(diagramId);
    const { toast } = useToast();
    const { diagram, isLoadingDiagram, updateDiagram } = useDiagrams(diagramId);
    const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

    const { shapes, setShapes, addShape, updateShape, addShapes } = useShapes();
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

    const restoreState = useCallback(({ shapes, connections }: HistoryEntry) => {
        setShapes(shapes);
        setConnections(connections);
    }, [setShapes, setConnections]);

    const { saveState, undo, redo, canUndo, canRedo } = useHistory(restoreState);
    const { copyToClipboard, pasteFromClipboard, hasClipboardData } = useClipboard();

    const [shareUrl, setShareUrl] = useState('');
    const [selectedTool, setSelectedTool] = useState<string>('select');
    const [leftPanelOpen, setLeftPanelOpen] = useState(true);
    const [rightPanelOpen, setRightPanelOpen] = useState(true);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [showGrid, setShowGrid] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);
    const [mobilePanel, setMobilePanel] = useState<'shapes' | 'styles' | null>(null);
    const [mobileToolsExpanded, setMobileToolsExpanded] = useState(false);

    // The owner of the diagram will always have edit access.
    // For non-owners, the permission from the URL is respected.
    const effectivePermission = useMemo(() => {
        if (isLoadingDiagram || !diagram || !session?.user) {
            return 'view'; // Default to view while loading
        }

        // Owner always has edit permission
        if (diagram.user_id === session.user.id) {
            return 'edit';
        }

        // For non-owners, the permission from the URL is respected.
        return permission;
    }, [diagram, session?.user, isLoadingDiagram, permission]);


    useEffect(() => {
        if (diagram) {
            setShapes(diagram.data.shapes || []);
            setConnections(diagram.data.connections || []);
        }
    }, [diagram, setShapes, setConnections]);

    useEffect(() => {
        const channel = supabase.channel(`diagram:${diagramId}`);

        channel
            .on('broadcast', { event: 'update' }, (payload) => {
                const { shapes, connections } = payload.payload;
                setShapes(shapes);
                setConnections(connections);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [diagramId, setShapes, setConnections]);

    useEffect(() => {
        // Use `effectivePermission` to control update/broadcast rights.
        if (diagramId && (shapes.length > 0 || connections.length > 0) && effectivePermission === 'edit') {
            const diagramData = {
                shapes,
                connections,
            };

            const broadcastChanges = () => {
                const channel = supabase.channel(`diagram:${diagramId}`);
                channel.send({
                    type: 'broadcast',
                    event: 'update',
                    payload: { shapes, connections },
                });
            };

            const timeoutId = setTimeout(() => {
                updateDiagram({ id: diagramId, data: diagramData });
                broadcastChanges();
            }, 500);

            return () => clearTimeout(timeoutId);
        }
    }, [shapes, connections, diagramId, updateDiagram, effectivePermission]);

    useEffect(() => {
        const checkScreenSize = () => {
            const width = window.innerWidth;
            setIsMobile(width < 768);
            setIsTablet(width >= 768 && width < 1024);
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    useEffect(() => {
        saveState({ shapes, connections });
    }, [shapes, connections, saveState]);

    const handleToolSelect = useCallback((toolId: string) => {
        setSelectedTool(toolId);
        if (toolId !== 'select') {
            clearSelection();
        }
        if (isConnecting) {
            cancelConnection();
        }
        if (isMobile) {
            setMobileToolsExpanded(false);
        }
    }, [clearSelection, isConnecting, cancelConnection, isMobile]);

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

    const handleShapeDelete = useCallback(() => {
        if (selectedIds.size > 0 && effectivePermission === 'edit') {
            const newShapes = shapes.filter(shape => !selectedIds.has(shape.id));
            const newConnections = connections.filter(
                conn => !selectedIds.has(conn.startShapeId) && !selectedIds.has(conn.endShapeId)
            );
            setShapes(newShapes);
            setConnections(newConnections);
            clearSelection();
        }
    }, [selectedIds, shapes, connections, setShapes, setConnections, clearSelection, effectivePermission]);

    const handleCopy = useCallback(() => {
        if (selectedShapes.length > 0) {
            const relevantConnections = connections.filter(conn =>
                selectedIds.has(conn.startShapeId) && selectedIds.has(conn.endShapeId)
            );
            copyToClipboard(selectedShapes, relevantConnections);
        }
    }, [selectedShapes, selectedIds, connections, copyToClipboard]);

    const handlePaste = useCallback(() => {
        if (hasClipboardData && effectivePermission === 'edit') {
            const { shapes: newShapes, connections: newConnections } = pasteFromClipboard();
            addShapes(newShapes);
            addConnections(newConnections);
            selectShapes(newShapes.map(s => s.id));
        }
    }, [hasClipboardData, pasteFromClipboard, addShapes, addConnections, selectShapes, effectivePermission]);

    const handleSelectAll = useCallback(() => {
        selectAll();
    }, [selectAll]);

    const handleSaveToDrive = useCallback(async () => {
        if (!session || !session.provider_token) {
            toast({
                title: "Authentication Error",
                description: "You need to re-authenticate with Google Drive.",
                variant: "destructive",
            });
            return;
        }

        if (!canvasRef.current) {
            toast({
                title: "Error",
                description: "Could not find the canvas to save.",
                variant: "destructive",
            });
            return;
        }

        try {
            const canvas = await html2canvas(canvasRef.current, { backgroundColor: '#ffffff' });
            canvas.toBlob(async (blob) => {
                if (!blob) {
                    toast({
                        title: "Error",
                        description: "Failed to create image from diagram.",
                        variant: "destructive",
                    });
                    return;
                }

                const fileName = `diagram-${new Date().toISOString()}.png`;
                const metadata = {
                    name: fileName,
                    mimeType: 'image/png',
                };

                const form = new FormData();
                form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
                form.append('file', blob);

                const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${session.provider_token}`,
                    },
                    body: form,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error.message || 'Failed to upload file.');
                }

                toast({
                    title: "Diagram Saved",
                    description: "Your diagram has been saved to Google Drive as an image.",
                });

            }, 'image/png');

        } catch (error: any) {
            console.error("Error saving to Google Drive:", error);
            toast({
                title: "Error",
                description: error.message || "There was an error saving your diagram to Google Drive.",
                variant: "destructive",
            });
        }
    }, [session, toast]);


    const handleConnectionStart = useCallback((point: ConnectionPoint, tool: Tool) => {
        if (effectivePermission === 'edit') {
            startConnection(point, tool);
        }
    }, [startConnection, effectivePermission]);

    const handleConnectionComplete = useCallback((endPoint: ConnectionPoint) => {
        if (effectivePermission === 'edit') {
            completeConnection(endPoint);
        }
    }, [completeConnection, effectivePermission]);

    const handleConnectionCancel = useCallback(() => {
        cancelConnection();
    }, [cancelConnection]);

    const handleConnectionUpdate = useCallback((id: string, updates: Partial<any>) => {
        if (effectivePermission === 'edit') {
            updateConnection(id, updates);
        }
    }, [updateConnection, effectivePermission]);

    const handleSelectionBoxUpdate = useCallback((box: SelectionBox | null) => {
    }, []);

    const handleDownload = useCallback(() => {
        if (!canvasRef.current) {
            toast({
                title: "Error",
                description: "Could not find the canvas to download.",
                variant: "destructive",
            });
            return;
        }

        html2canvas(canvasRef.current, { backgroundColor: '#ffffff' }).then((canvas) => {
            const link = document.createElement('a');
            link.download = `diagram-${new Date().toISOString()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    }, [toast]);


    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

        if (e.key === 'Delete' || e.key === 'Backspace') {
            handleShapeDelete();
        }

        if (e.key === 'Escape' && isConnecting) {
            cancelConnection();
        }

        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            undo();
        }
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
            e.preventDefault();
            redo();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
            e.preventDefault();
            redo();
        }

        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
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

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.origin + "/diagram");
            url.searchParams.set('id', diagramId);
            url.searchParams.set('permission', btoa('view'));
            setShareUrl(url.toString());
        }
    }, [diagramId]);


    const renderPresence = (p: any) => {
        console.log("Presence: ", p);

        // Check if presence data exists and has user_metadata
        if (!p || !p.user_metadata) return null;

        const { user_metadata } = p;
        const userId = p.id;
        const fullName = user_metadata.full_name;
        const avatarUrl = user_metadata.avatar_url;
        const email = p.email;

        // Ensure we have required fields
        if (!fullName || !avatarUrl) return null;

        return (
            <div key={userId} className="relative group">
                <div className="relative">
                    {/* Avatar with border and glow effect */}
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-green-400 shadow-lg ring-2 ring-green-300 ring-opacity-50 transition-all duration-300 hover:ring-4 hover:ring-green-200">
                        <Image
                            src={avatarUrl}
                            alt={fullName}
                            width={40}
                            height={40}
                            className="object-cover"
                        />
                    </div>

                    {/* Online indicator dot */}
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm">
                        <div className="w-full h-full bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                </div>

                {/* Tooltip on hover */}
                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                    <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg whitespace-nowrap">
                        <div className="font-medium">{fullName}</div>
                        <div className="text-gray-300 text-xs">{email}</div>
                        <div className="text-green-400 text-xs flex items-center mt-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                            Online
                        </div>
                        {/* Tooltip arrow */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
                    </div>
                </div>
            </div>
        );
    };

    const PresenceIndicators = ({ presentUsers }: { presentUsers: any[] }) => {
        return (
            <div className="flex items-center space-x-3">
                {presentUsers?.length > 0 && (
                    <>
                        <div className="flex items-center space-x-2">
                            {presentUsers.slice(0, 4).map(renderPresence)}
                        </div>

                        {presentUsers.length > 4 && (
                            <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center text-xs font-medium text-gray-600 shadow-sm">
                                +{presentUsers.length - 4}
                            </div>
                        )}

                        <div className="hidden sm:flex items-center text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                            {presentUsers.length} online
                        </div>
                    </>
                )}
            </div>
        );
    };

    if (isLoadingDiagram) {
        return <Loading />;
    }

    if (isMobile) {
        return (
            <div className="h-screen bg-gray-50 flex flex-col">
                <header className="bg-white border-b border-gray-200 px-3 py-2 flex items-center justify-between shadow-sm">
                    <h1 className="text-base font-semibold text-gray-800">Diagram Creator</h1>
                    <PresenceIndicators presentUsers={presentUsers} />
                </header>

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
                        onConnectionUpdate={handleConnectionUpdate}
                        onSelectionBoxUpdate={handleSelectionBoxUpdate}
                    />
                </div>

                <div className="bg-white border-t border-gray-200 shadow-lg">
                    <div className="px-3 py-2 flex items-center justify-between border-b border-gray-100">
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setMobileToolsExpanded(!mobileToolsExpanded)}
                                className={`p-2 rounded-md transition-colors ${selectedTool !== 'select' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
                                    }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </button>
                            <div className="flex items-center space-x-1">
                                <button
                                    onClick={undo}
                                    disabled={!canUndo}
                                    className="p-2 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                    </svg>
                                </button>
                                <button
                                    onClick={redo}
                                    disabled={!canRedo}
                                    className="p-2 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2m18-10l-6-6m6 6l-6 6" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setMobilePanel(mobilePanel === 'shapes' ? null : 'shapes')}
                                className={`px-3 py-2 rounded-md text-xs font-medium transition-colors ${mobilePanel === 'shapes' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
                                    }`}
                            >
                                Shapes
                            </button>
                            <button
                                onClick={() => setMobilePanel(mobilePanel === 'styles' ? null : 'styles')}
                                className={`px-3 py-2 rounded-md text-xs font-medium transition-colors ${mobilePanel === 'styles' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
                                    }`}
                            >
                                Style
                            </button>
                        </div>
                    </div>

                    {mobileToolsExpanded && (
                        <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                            <div className="grid grid-cols-6 gap-2">
                                <button
                                    onClick={() => handleToolSelect('select')}
                                    className={`p-3 rounded-lg transition-colors ${selectedTool === 'select' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 border border-gray-200'
                                        }`}
                                >
                                    <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handleToolSelect('rectangle')}
                                    className={`p-3 rounded-lg transition-colors ${selectedTool === 'rectangle' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 border border-gray-200'
                                        }`}
                                >
                                    <div className="w-5 h-3 mx-auto border-2 border-current"></div>
                                </button>
                                <button
                                    onClick={() => handleToolSelect('circle')}
                                    className={`p-3 rounded-lg transition-colors ${selectedTool === 'circle' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 border border-gray-200'
                                        }`}
                                >
                                    <div className="w-5 h-5 mx-auto border-2 border-current rounded-full"></div>
                                </button>
                                <button
                                    onClick={() => handleToolSelect('triangle')}
                                    className={`p-3 rounded-lg transition-colors ${selectedTool === 'triangle' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 border border-gray-200'
                                        }`}
                                >
                                    <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3l9 18H3l9-18z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handleToolSelect('diamond')}
                                    className={`p-3 rounded-lg transition-colors ${selectedTool === 'diamond' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 border border-gray-200'
                                        }`}
                                >
                                    <div className="w-4 h-4 mx-auto border-2 border-current transform rotate-45"></div>
                                </button>
                                <button
                                    onClick={() => handleToolSelect('line-arrow')}
                                    className={`p-3 rounded-lg transition-colors ${selectedTool === 'line-arrow' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 border border-gray-200'
                                        }`}
                                >
                                    <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {mobilePanel && (
                        <div className="max-h-64 overflow-y-auto">
                            {mobilePanel === 'shapes' && (
                                <ShapePanel
                                    selectedTool={selectedTool}
                                    onToolSelect={handleToolSelect}
                                />
                            )}
                            {mobilePanel === 'styles' && (
                                <StylePanel
                                    selectedShape={primarySelectedShape}
                                    selectedShapes={selectedShapes}
                                    onShapeUpdate={handleShapeUpdate}
                                    showGrid={showGrid}
                                    onShowGridChange={setShowGrid}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (isTablet) {
        return (
            <div className="h-screen bg-gray-100 flex flex-col">
                <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm">
                    <h1 className="text-lg font-semibold text-gray-800">Diagram Creator</h1>
                    <PresenceIndicators presentUsers={presentUsers} />
                </header>
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
                    onDownload={handleDownload}
                    onSaveToDrive={handleSaveToDrive}
                    onPaste={handlePaste}
                    onSelectAll={handleSelectAll}
                    hasSelection={selectedIds.size > 0}
                    hasClipboard={hasClipboardData}
                    leftPanelOpen={leftPanelOpen}
                    rightPanelOpen={rightPanelOpen}
                    onToggleLeftPanel={() => setLeftPanelOpen(!leftPanelOpen)}
                    onToggleRightPanel={() => setRightPanelOpen(!rightPanelOpen)}
                    setIsShareDialogOpen={setIsShareDialogOpen}
                />
                <div className="flex-1 flex overflow-hidden">
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
                            onConnectionUpdate={handleConnectionUpdate}
                            onSelectionBoxUpdate={handleSelectionBoxUpdate}
                        />
                    </div>
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
                {leftPanelOpen && (
                    <div className="bg-white border-t border-gray-200 shadow-sm max-h-48">
                        <ShapePanel
                            selectedTool={selectedTool}
                            onToolSelect={handleToolSelect}
                        />
                    </div>
                )}
            </div>
        );
    }
    return (
        <div className="h-screen bg-gray-100 flex flex-col">
            {isShareDialogOpen && <ShareDialog diagramId={diagramId} onClose={() => setIsShareDialogOpen(false)} />}
            <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-6">
                    <h1 className="text-xl font-semibold text-gray-800">Diagram Creator</h1>
                </div>
                <PresenceIndicators presentUsers={presentUsers} />
            </header>
            <Toolbar
                selectedTool={selectedTool}
                onToolSelect={handleToolSelect}
                zoom={zoom}
                onZoomChange={setZoom}
                canUndo={canUndo}
                onDownload={handleDownload}
                canRedo={canRedo}
                onUndo={undo}
                onRedo={redo}
                onDelete={handleShapeDelete}
                onCopy={handleCopy}
                onPaste={handlePaste}
                onSaveToDrive={handleSaveToDrive}
                onSelectAll={handleSelectAll}
                hasSelection={selectedIds.size > 0}
                hasClipboard={hasClipboardData}
                leftPanelOpen={leftPanelOpen}
                rightPanelOpen={rightPanelOpen}
                onToggleLeftPanel={() => setLeftPanelOpen(!leftPanelOpen)}
                onToggleRightPanel={() => setRightPanelOpen(!rightPanelOpen)}
                setIsShareDialogOpen={setIsShareDialogOpen}
            />
            <div className="flex-1 flex overflow-hidden">
                {leftPanelOpen && (
                    <div className="w-64 bg-white border-r border-gray-200 shadow-sm">
                        <ShapePanel
                            selectedTool={selectedTool}
                            onToolSelect={handleToolSelect}
                        />
                    </div>
                )}
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
                        onConnectionUpdate={handleConnectionUpdate}
                        onSelectionBoxUpdate={handleSelectionBoxUpdate}
                    />
                </div>
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