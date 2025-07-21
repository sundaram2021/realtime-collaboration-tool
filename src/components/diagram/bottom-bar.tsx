import React from 'react';
import { Map, Minus, Plus } from 'lucide-react';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface BottomBarProps {
    zoom: number;
    onZoomChange: (zoom: number) => void;
}

export const BottomBar: React.FC<BottomBarProps> = ({ zoom, onZoomChange }) => {
    return (
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white rounded-lg shadow-lg border border-gray-200 p-1">
                <TooltipProvider>
                    <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => onZoomChange(zoom / 1.2)}
                                className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                <Minus size={16} />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent><p>Zoom out</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <span className="text-sm text-gray-700 font-medium w-16 text-center cursor-pointer" onClick={() => onZoomChange(1)}>
                    {Math.round(zoom * 100)}%
                </span>

                <TooltipProvider>
                    <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => onZoomChange(zoom * 1.2)}
                                className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                <Plus size={16} />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent><p>Zoom in</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            <TooltipProvider>
                <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                        <button className="p-3 bg-white rounded-lg shadow-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors">
                            <Map size={16} />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent><p>Mini-map</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>

        </div>
    );
};