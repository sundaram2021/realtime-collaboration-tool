import React from 'react';
import { Shape } from './types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';

interface StylePanelProps {
    selectedShape: Shape | null;
    selectedShapes: Shape[];
    onShapeUpdate: (id: string, updates: Partial<Shape>) => void;
    showGrid: boolean;
    onShowGridChange: (show: boolean) => void;
}

export const StylePanel: React.FC<StylePanelProps> = React.memo(({
    selectedShape,
    selectedShapes,
    onShapeUpdate,
    showGrid,
    onShowGridChange,
}) => {
    const updateShape = (updates: Partial<Shape>) => {
        if (selectedShape) {
            onShapeUpdate(selectedShape.id, updates);
        }
    };

    const updateAllSelectedShapes = (updates: Partial<Shape>) => {
        selectedShapes.forEach(shape => {
            onShapeUpdate(shape.id, updates);
        });
    };

    const hasMultipleShapes = selectedShapes.length > 1;
    const activeShape = selectedShape || (selectedShapes.length === 1 ? selectedShapes[0] : null);

    return (
        <div className="w-64 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
                <h3 className="font-medium text-sm text-gray-800">Style</h3>
                {hasMultipleShapes && (
                    <p className="text-xs text-gray-500 mt-1">{selectedShapes.length} shapes selected</p>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* View options */}
                <div>
                    <h4 className="text-xs font-medium text-gray-500 mb-3">VIEW</h4>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="grid" className="text-sm">Grid</Label>
                            <Checkbox
                                id="grid"
                                checked={showGrid}
                                onCheckedChange={onShowGridChange}
                            />
                        </div>
                    </div>
                </div>

                {activeShape ? (
                    <>
                        {/* Fill and stroke */}
                        <div>
                            <h4 className="text-xs font-medium text-gray-500 mb-3">APPEARANCE</h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="fill" className="text-sm">Fill</Label>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            id="fill"
                                            type="color"
                                            value={activeShape.fillColor}
                                            onChange={(e) => hasMultipleShapes ? updateAllSelectedShapes({ fillColor: e.target.value }) : updateShape({ fillColor: e.target.value })}
                                            className="w-8 h-6 rounded border border-gray-300 cursor-pointer"
                                        />
                                        <Input
                                            type="text"
                                            value={activeShape.fillColor}
                                            onChange={(e) => hasMultipleShapes ? updateAllSelectedShapes({ fillColor: e.target.value }) : updateShape({ fillColor: e.target.value })}
                                            className="w-20 h-6 text-xs"
                                            placeholder="#ffffff"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="stroke" className="text-sm">Stroke</Label>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            id="stroke"
                                            type="color"
                                            value={activeShape.strokeColor}
                                            onChange={(e) => hasMultipleShapes ? updateAllSelectedShapes({ strokeColor: e.target.value }) : updateShape({ strokeColor: e.target.value })}
                                            className="w-8 h-6 rounded border border-gray-300 cursor-pointer"
                                        />
                                        <Input
                                            type="text"
                                            value={activeShape.strokeColor}
                                            onChange={(e) => hasMultipleShapes ? updateAllSelectedShapes({ strokeColor: e.target.value }) : updateShape({ strokeColor: e.target.value })}
                                            className="w-20 h-6 text-xs"
                                            placeholder="#000000"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="strokeWidth" className="text-sm block mb-1">
                                        Stroke Width: {activeShape.strokeWidth}px
                                    </Label>
                                    <Slider
                                        id="strokeWidth"
                                        min={0}
                                        max={10}
                                        step={1}
                                        value={[activeShape.strokeWidth]}
                                        onValueChange={([value]) => hasMultipleShapes ? updateAllSelectedShapes({ strokeWidth: value }) : updateShape({ strokeWidth: value })}
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="opacity" className="text-sm block mb-1">
                                        Opacity: {Math.round(activeShape.opacity * 100)}%
                                    </Label>
                                    <Slider
                                        id="opacity"
                                        min={0}
                                        max={1}
                                        step={0.1}
                                        value={[activeShape.opacity]}
                                        onValueChange={([value]) => hasMultipleShapes ? updateAllSelectedShapes({ opacity: value }) : updateShape({ opacity: value })}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Text properties - only show for single selection */}
                        {!hasMultipleShapes && (
                            <div>
                                <h4 className="text-xs font-medium text-gray-500 mb-3">TEXT</h4>
                                <div className="space-y-3">
                                    <div>
                                        <Label htmlFor="text" className="text-sm block mb-1">Text</Label>
                                        <Input
                                            id="text"
                                            type="text"
                                            value={activeShape.text}
                                            onChange={(e) => updateShape({ text: e.target.value })}
                                            className="h-8 text-sm"
                                            placeholder="Enter text"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="fontSize" className="text-sm block mb-1">
                                            Font Size: {activeShape.fontSize}px
                                        </Label>
                                        <Slider
                                            id="fontSize"
                                            min={8}
                                            max={48}
                                            step={1}
                                            value={[activeShape.fontSize]}
                                            onValueChange={([value]) => updateShape({ fontSize: value })}
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Position and size - only show for single selection */}
                        {!hasMultipleShapes && (
                            <div>
                                <h4 className="text-xs font-medium text-gray-500 mb-3">POSITION & SIZE</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <Label htmlFor="x" className="text-xs">X</Label>
                                        <Input
                                            id="x"
                                            type="number"
                                            value={Math.round(activeShape.x)}
                                            onChange={(e) => updateShape({ x: parseInt(e.target.value) || 0 })}
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="y" className="text-xs">Y</Label>
                                        <Input
                                            id="y"
                                            type="number"
                                            value={Math.round(activeShape.y)}
                                            onChange={(e) => updateShape({ y: parseInt(e.target.value) || 0 })}
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="width" className="text-xs">Width</Label>
                                        <Input
                                            id="width"
                                            type="number"
                                            value={Math.round(activeShape.width)}
                                            onChange={(e) => updateShape({ width: parseInt(e.target.value) || 1 })}
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="height" className="text-xs">Height</Label>
                                        <Input
                                            id="height"
                                            type="number"
                                            value={Math.round(activeShape.height)}
                                            onChange={(e) => updateShape({ height: parseInt(e.target.value) || 1 })}
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center text-gray-400 py-8">
                        <p className="text-sm">Select a shape to edit its properties</p>
                    </div>
                )}
            </div>
        </div>
    );
});
