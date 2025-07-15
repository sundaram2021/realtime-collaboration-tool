import React, { useState } from 'react';
import {
    Square, Circle, Triangle, Diamond, Hexagon, Star, Pentagon,
    ArrowRight, Type, Search, ChevronDown, Minus, MoreHorizontal,
    ArrowRightLeft, ArrowUpDown, Zap, Heart, Hash
} from 'lucide-react';
import { Tool } from './types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
const shapes: Tool[] = [
    // Basic shapes
    { id: 'rectangle', type: 'rectangle', label: 'Rectangle', category: 'Basic', icon: Square, defaultWidth: 120, defaultHeight: 80 },
    { id: 'circle', type: 'circle', label: 'Circle', category: 'Basic', icon: Circle, defaultWidth: 100, defaultHeight: 100 },
    { id: 'triangle', type: 'triangle', label: 'Triangle', category: 'Basic', icon: Triangle, defaultWidth: 100, defaultHeight: 80 },
    { id: 'diamond', type: 'diamond', label: 'Diamond', category: 'Basic', icon: Diamond, defaultWidth: 100, defaultHeight: 80 },
    { id: 'hexagon', type: 'hexagon', label: 'Hexagon', category: 'Basic', icon: Hexagon, defaultWidth: 100, defaultHeight: 80 },
    { id: 'pentagon', type: 'pentagon', label: 'Pentagon', category: 'Basic', icon: Pentagon, defaultWidth: 100, defaultHeight: 80 },
    { id: 'star', type: 'star', label: 'Star', category: 'Basic', icon: Star, defaultWidth: 100, defaultHeight: 80 },
    { id: 'heart', type: 'heart', label: 'Heart', category: 'Basic', icon: Heart, defaultWidth: 100, defaultHeight: 80 },
    { id: 'text', type: 'text', label: 'Text', category: 'Basic', icon: Type, defaultWidth: 100, defaultHeight: 30 },

    // Connection tools
    { id: 'line-straight', type: 'connection', label: 'Line', category: 'Connections', icon: Minus, isConnection: true },
    { id: 'line-arrow', type: 'connection', label: 'Arrow', category: 'Connections', icon: ArrowRight, isConnection: true },
    { id: 'line-double-arrow', type: 'connection', label: 'Double Arrow', category: 'Connections', icon: ArrowRightLeft, isConnection: true },
    { id: 'line-dotted', type: 'connection', label: 'Dotted Line', category: 'Connections', icon: MoreHorizontal, isConnection: true },
    { id: 'line-dotted-arrow', type: 'connection', label: 'Dotted Arrow', category: 'Connections', icon: ArrowUpDown, isConnection: true },
    { id: 'line-dotted-double', type: 'connection', label: 'Dotted Double', category: 'Connections', icon: Zap, isConnection: true },
];

const categories = ['Basic', 'Connections'];

interface ShapePanelProps {
    selectedTool: string;
    onToolSelect: (toolId: string) => void;
}

export const ShapePanel: React.FC<ShapePanelProps> = ({
    selectedTool,
    onToolSelect,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
        new Set(['Basic', 'Connections'])
    );

    const toggleCategory = (category: string) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(category)) {
            newExpanded.delete(category);
        } else {
            newExpanded.add(category);
        }
        setExpandedCategories(newExpanded);
    };

    const filteredShapes = shapes.filter(shape =>
        shape.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search shapes"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-8"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="p-2">
                    {categories.map(category => {
                        const categoryShapes = filteredShapes.filter(shape => shape.category === category);
                        if (categoryShapes.length === 0) return null;

                        const isExpanded = expandedCategories.has(category);

                        return (
                            <div key={category} className="mb-2">
                                <button
                                    onClick={() => toggleCategory(category)}
                                    className="flex items-center justify-between w-full px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded"
                                >
                                    <span>{category.toUpperCase()}</span>
                                    <ChevronDown
                                        size={12}
                                        className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                {isExpanded && (
                                    <div className="grid grid-cols-4 gap-1 mt-2 px-1">
                                        {categoryShapes.map(shape => (
                                            <Button
                                                key={shape.id}
                                                variant={selectedTool === shape.id ? 'default' : 'ghost'}
                                                size="sm"
                                                onClick={() => onToolSelect(shape.id)}
                                                className="h-12 w-full flex flex-col items-center justify-center p-1 text-xs"
                                                title={shape.label}
                                            >
                                                <shape.icon size={16} />
                                                <span className="mt-1 truncate text-[10px]">{shape.label}</span>
                                            </Button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
