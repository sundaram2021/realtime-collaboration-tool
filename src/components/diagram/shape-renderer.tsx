import React from 'react';
import { Shape } from './types';

interface ShapeRendererProps {
    shape: Shape;
    isSelected: boolean;
    onDoubleClick: () => void;
}

export const ShapeRenderer: React.FC<ShapeRendererProps> = ({
    shape,
    isSelected,
    onDoubleClick,
}) => {
    const { x, y, width, height, type, text, fillColor, strokeColor, strokeWidth, fontSize, opacity } = shape;

    const shapeStyle: React.CSSProperties = {
        left: x,
        top: y,
        width,
        height,
        backgroundColor: fillColor === 'transparent' ? 'transparent' : fillColor,
        borderColor: isSelected ? '#3b82f6' : strokeColor,
        borderWidth: isSelected ? Math.max(2, strokeWidth) : strokeWidth,
        borderStyle: 'solid',
        opacity,
        fontSize,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#000000',
        fontFamily: 'Arial, sans-serif',
        cursor: 'move',
        userSelect: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: isSelected ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : undefined,
    };

    const getShapeClassName = () => {
        switch (type) {
            case 'circle':
                return 'rounded-full';
            case 'diamond':
                return 'transform rotate-45 flex items-center justify-center';
            default:
                return 'rounded-md';
        }
    };

    const renderShape = () => {
        if (type === 'diamond') {
            return (
                <div
                    className={`absolute ${getShapeClassName()}`}
                    style={shapeStyle}
                    onDoubleClick={onDoubleClick}
                >
                    <span className="transform -rotate-45 text-center">
                        {text}
                    </span>
                </div>
            );
        }

        return (
            <div
                className={`absolute ${getShapeClassName()}`}
                style={shapeStyle}
                onDoubleClick={onDoubleClick}
            >
                <span className="text-center break-words max-w-full">
                    {text}
                </span>
            </div>
        );
    };

    return renderShape();
};
