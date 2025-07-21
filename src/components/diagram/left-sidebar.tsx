import React from 'react';
import { MousePointer, Pen, Square, Circle, Triangle, Diamond, Type, ArrowRight, Undo, Redo } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ToolButton {
    id: string;
    label: string;
    icon: React.ElementType;
}

const tools: ToolButton[] = [
    { id: 'select', label: 'Select', icon: MousePointer },
    { id: 'pen', label: 'Pen', icon: Pen },
    { id: 'rectangle', label: 'Rectangle', icon: Square },
    { id: 'circle', label: 'Circle', icon: Circle },
    { id: 'triangle', label: 'Triangle', icon: Triangle },
    { id: 'diamond', label: 'Diamond', icon: Diamond },
    { id: 'text', label: 'Text', icon: Type },
    { id: 'line-arrow', label: 'Arrow', icon: ArrowRight },
];

interface LeftSidebarProps {
    selectedTool: string;
    onToolSelect: (toolId: string) => void;
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ selectedTool, onToolSelect, canUndo, canRedo, onUndo, onRedo }) => {
    return (
        <aside className="absolute top-1/2 left-4 transform -translate-y-1/2 z-20 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex flex-col gap-2">
            <TooltipProvider>
                {tools.map((tool) => (
                    <Tooltip key={tool.id} delayDuration={100}>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => onToolSelect(tool.id)}
                                className={cn(
                                    'p-3 rounded-md transition-colors duration-150',
                                    selectedTool === tool.id
                                        ? 'bg-blue-500 text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                )}
                            >
                                <tool.icon size={20} />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={10}>
                            <p>{tool.label}</p>
                        </TooltipContent>
                    </Tooltip>
                ))}

                <div className="border-t my-1 border-gray-200" />

                <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                        <button onClick={onUndo} disabled={!canUndo} className="p-3 text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"><Undo size={20} /></button>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={10}><p>Undo</p></TooltipContent>
                </Tooltip>
                <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                        <button onClick={onRedo} disabled={!canRedo} className="p-3 text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"><Redo size={20} /></button>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={10}><p>Redo</p></TooltipContent>
                </Tooltip>

            </TooltipProvider>
        </aside>
    );
};