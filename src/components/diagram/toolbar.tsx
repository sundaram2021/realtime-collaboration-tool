import React from 'react';
import {
    MousePointer, ZoomIn, ZoomOut, Undo, Redo, Trash2,
    Copy, Download, Upload, Home, Grid, Eye, ChevronRight,
    Square, Clipboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ToolbarProps {
    selectedTool: string;
    onToolSelect: (tool: string) => void;
    zoom: number;
    onZoomChange: (zoom: number) => void;
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
    onDelete: () => void;
    onCopy: () => void;
    onPaste: () => void;
    onSelectAll: () => void;
    hasSelection: boolean;
    hasClipboard: boolean;
    leftPanelOpen: boolean;
    rightPanelOpen: boolean;
    onToggleLeftPanel: () => void;
    onToggleRightPanel: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
    selectedTool,
    onToolSelect,
    zoom,
    onZoomChange,
    canUndo,
    canRedo,
    onUndo,
    onRedo,
    onDelete,
    onCopy,
    onPaste,
    onSelectAll,
    hasSelection,
    hasClipboard,
    leftPanelOpen,
    rightPanelOpen,
    onToggleLeftPanel,
    onToggleRightPanel,
}) => {
    return (
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2">
                {/* Navigation tools */}
                <Button
                    variant={selectedTool === 'select' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onToolSelect('select')}
                    className="p-2"
                >
                    <MousePointer size={16} />
                </Button>

                <div className="w-px h-6 bg-gray-300" />

                {/* Zoom controls */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onZoomChange(1)}
                    className="p-2"
                >
                    <Home size={16} />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onZoomChange(zoom * 1.2)}
                    className="p-2"
                >
                    <ZoomIn size={16} />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onZoomChange(zoom / 1.2)}
                    className="p-2"
                >
                    <ZoomOut size={16} />
                </Button>
                <span className="text-sm text-gray-600 px-2 min-w-[60px]">
                    {Math.round(zoom * 100)}%
                </span>

                <div className="w-px h-6 bg-gray-300" />

                {/* History controls */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onUndo}
                    disabled={!canUndo}
                    className="p-2"
                >
                    <Undo size={16} />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRedo}
                    disabled={!canRedo}
                    className="p-2"
                >
                    <Redo size={16} />
                </Button>

                <div className="w-px h-6 bg-gray-300" />

                {/* Edit tools */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSelectAll}
                    className="p-2"
                    title="Select All (Ctrl+A)"
                >
                    <Square size={16} />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onCopy}
                    disabled={!hasSelection}
                    className="p-2"
                    title="Copy (Ctrl+C)"
                >
                    <Copy size={16} />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onPaste}
                    disabled={!hasClipboard}
                    className="p-2"
                    title="Paste (Ctrl+V)"
                >
                    <Clipboard size={16} />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDelete}
                    disabled={!hasSelection}
                    className="p-2"
                    title="Delete (Del)"
                >
                    <Trash2 size={16} />
                </Button>

                <div className="w-px h-6 bg-gray-300" />

                {/* File operations */}
                <Button variant="ghost" size="sm" className="p-2">
                    <Download size={16} />
                </Button>
                <Button variant="ghost" size="sm" className="p-2">
                    <Upload size={16} />
                </Button>
            </div>

            {/* Right side controls */}
            <div className="flex items-center space-x-2">
                <Button
                    variant={leftPanelOpen ? 'default' : 'ghost'}
                    size="sm"
                    onClick={onToggleLeftPanel}
                    className="flex items-center space-x-1 px-3"
                >
                    <span className="text-sm">Shapes</span>
                    <ChevronRight
                        size={14}
                        className={`transition-transform ${leftPanelOpen ? 'rotate-180' : ''}`}
                    />
                </Button>
                <Button
                    variant={rightPanelOpen ? 'default' : 'ghost'}
                    size="sm"
                    onClick={onToggleRightPanel}
                    className="flex items-center space-x-1 px-3"
                >
                    <span className="text-sm">Format</span>
                    <ChevronRight
                        size={14}
                        className={`transition-transform ${rightPanelOpen ? 'rotate-180' : ''}`}
                    />
                </Button>
            </div>
        </div>
    );
};
