import React from 'react';
import { Map, Minus, Plus, Undo, Redo } from 'lucide-react';

interface BottomBarProps {
    zoom: number;
    onZoomChange: (zoom: number) => void;
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
}

export const BottomBar: React.FC<BottomBarProps> = ({ zoom, onZoomChange, canUndo, canRedo, onUndo, onRedo }) => {
    return (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white rounded-lg shadow-lg border border-gray-200 p-1">
                <button onClick={onUndo} disabled={!canUndo} className="p-2 text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-50"><Undo size={16} /></button>
                <button onClick={onRedo} disabled={!canRedo} className="p-2 text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-50"><Redo size={16} /></button>
            </div>
            <div className="flex items-center gap-1 bg-white rounded-lg shadow-lg border border-gray-200 p-1">
                <button
                    onClick={() => onZoomChange(zoom / 1.2)}
                    className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    <Minus size={16} />
                </button>
                <span className="text-sm text-gray-700 font-medium w-16 text-center cursor-pointer" onClick={() => onZoomChange(1)}>
                    {Math.round(zoom * 100)}%
                </span>
                <button
                    onClick={() => onZoomChange(zoom * 1.2)}
                    className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    <Plus size={16} />
                </button>
            </div>
            <button className="p-3 bg-white rounded-lg shadow-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors">
                <Map size={16} />
            </button>
        </div>
    );
};