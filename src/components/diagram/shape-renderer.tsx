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

    const baseStyle: React.CSSProperties = {
        left: x,
        top: y,
        width,
        height,
        backgroundColor: fillColor === 'transparent' ? 'transparent' : fillColor,
        border: `${isSelected ? Math.max(2, strokeWidth) : strokeWidth}px solid ${isSelected ? '#3b82f6' : strokeColor}`,
        opacity,
        fontSize,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#000000',
        fontFamily: 'Arial, sans-serif',
        cursor: 'move',
        userSelect: 'none' as const,
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: isSelected ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : undefined,
    };

    const renderShapeContent = () => {
        if (type === 'triangle') {
            return (
                <div
                    className="absolute flex items-center justify-center"
                    style={{
                        ...baseStyle,
                        backgroundColor: 'transparent',
                        border: 'none',
                    }}
                    onDoubleClick={onDoubleClick}
                >
                    <svg
                        width={width}
                        height={height}
                        style={{ position: 'absolute', top: 0, left: 0 }}
                    >
                        <polygon
                            points={`${width / 2},5 5,${height - 5} ${width - 5},${height - 5}`}
                            fill={fillColor === 'transparent' ? 'transparent' : fillColor}
                            stroke={isSelected ? '#3b82f6' : strokeColor}
                            strokeWidth={isSelected ? Math.max(2, strokeWidth) : strokeWidth}
                        />
                    </svg>
                    <span className="relative z-10 text-center break-words max-w-full">
                        {text}
                    </span>
                </div>
            );
        }

        if (type === 'diamond') {
            return (
                <div
                    className="absolute flex items-center justify-center"
                    style={{
                        ...baseStyle,
                        backgroundColor: 'transparent',
                        border: 'none',
                    }}
                    onDoubleClick={onDoubleClick}
                >
                    <svg
                        width={width}
                        height={height}
                        style={{ position: 'absolute', top: 0, left: 0 }}
                    >
                        <polygon
                            points={`${width / 2},5 ${width - 5},${height / 2} ${width / 2},${height - 5} 5,${height / 2}`}
                            fill={fillColor === 'transparent' ? 'transparent' : fillColor}
                            stroke={isSelected ? '#3b82f6' : strokeColor}
                            strokeWidth={isSelected ? Math.max(2, strokeWidth) : strokeWidth}
                        />
                    </svg>
                    <span className="relative z-10 text-center break-words max-w-full">
                        {text}
                    </span>
                </div>
            );
        }

        if (type === 'circle') {
            return (
                <div
                    className="absolute rounded-full flex items-center justify-center"
                    style={baseStyle}
                    onDoubleClick={onDoubleClick}
                >
                    <span className="text-center break-words max-w-full">
                        {text}
                    </span>
                </div>
            );
        }

        if (type === 'hexagon') {
            return (
                <div
                    className="absolute flex items-center justify-center"
                    style={{
                        ...baseStyle,
                        backgroundColor: 'transparent',
                        border: 'none',
                    }}
                    onDoubleClick={onDoubleClick}
                >
                    <svg
                        width={width}
                        height={height}
                        style={{ position: 'absolute', top: 0, left: 0 }}
                    >
                        <polygon
                            points={`${width * 0.25},5 ${width * 0.75},5 ${width - 5},${height / 2} ${width * 0.75},${height - 5} ${width * 0.25},${height - 5} 5,${height / 2}`}
                            fill={fillColor === 'transparent' ? 'transparent' : fillColor}
                            stroke={isSelected ? '#3b82f6' : strokeColor}
                            strokeWidth={isSelected ? Math.max(2, strokeWidth) : strokeWidth}
                        />
                    </svg>
                    <span className="relative z-10 text-center break-words max-w-full">
                        {text}
                    </span>
                </div>
            );
        }

        if (type === 'pentagon') {
            return (
                <div
                    className="absolute flex items-center justify-center"
                    style={{
                        ...baseStyle,
                        backgroundColor: 'transparent',
                        border: 'none',
                    }}
                    onDoubleClick={onDoubleClick}
                >
                    <svg
                        width={width}
                        height={height}
                        style={{ position: 'absolute', top: 0, left: 0 }}
                    >
                        <polygon
                            points={`${width / 2},5 ${width - 5},${height * 0.4} ${width * 0.8},${height - 5} ${width * 0.2},${height - 5} 5,${height * 0.4}`}
                            fill={fillColor === 'transparent' ? 'transparent' : fillColor}
                            stroke={isSelected ? '#3b82f6' : strokeColor}
                            strokeWidth={isSelected ? Math.max(2, strokeWidth) : strokeWidth}
                        />
                    </svg>
                    <span className="relative z-10 text-center break-words max-w-full">
                        {text}
                    </span>
                </div>
            );
        }

        if (type === 'star') {
            return (
                <div
                    className="absolute flex items-center justify-center"
                    style={{
                        ...baseStyle,
                        backgroundColor: 'transparent',
                        border: 'none',
                    }}
                    onDoubleClick={onDoubleClick}
                >
                    <svg
                        width={width}
                        height={height}
                        style={{ position: 'absolute', top: 0, left: 0 }}
                    >
                        <polygon
                            points={`${width / 2},5 ${width * 0.61},${height * 0.35} ${width - 5},${height * 0.35} ${width * 0.68},${height * 0.57} ${width * 0.79},${height - 5} ${width / 2},${height * 0.7} ${width * 0.21},${height - 5} ${width * 0.32},${height * 0.57} 5,${height * 0.35} ${width * 0.39},${height * 0.35}`}
                            fill={fillColor === 'transparent' ? 'transparent' : fillColor}
                            stroke={isSelected ? '#3b82f6' : strokeColor}
                            strokeWidth={isSelected ? Math.max(2, strokeWidth) : strokeWidth}
                        />
                    </svg>
                    <span className="relative z-10 text-center break-words max-w-full">
                        {text}
                    </span>
                </div>
            );
        }

        if (type === 'heart') {
            return (
                <div
                    className="absolute flex items-center justify-center"
                    style={{
                        ...baseStyle,
                        backgroundColor: 'transparent',
                        border: 'none',
                    }}
                    onDoubleClick={onDoubleClick}
                >
                    <svg
                        width={width}
                        height={height}
                        style={{ position: 'absolute', top: 0, left: 0 }}
                    >
                        <path
                            d={`M${width / 2},${height * 0.85} C${width * 0.2},${height * 0.4} ${width * 0.2},${height * 0.15} ${width * 0.35},${height * 0.15} C${width * 0.42},${height * 0.15} ${width / 2},${height * 0.25} ${width / 2},${height * 0.25} C${width / 2},${height * 0.25} ${width * 0.58},${height * 0.15} ${width * 0.65},${height * 0.15} C${width * 0.8},${height * 0.15} ${width * 0.8},${height * 0.4} ${width / 2},${height * 0.85} Z`}
                            fill={fillColor === 'transparent' ? 'transparent' : fillColor}
                            stroke={isSelected ? '#3b82f6' : strokeColor}
                            strokeWidth={isSelected ? Math.max(2, strokeWidth) : strokeWidth}
                        />
                    </svg>
                    <span className="relative z-10 text-center break-words max-w-full">
                        {text}
                    </span>
                </div>
            );
        }

        // Default rectangle and text shapes
        return (
            <div
                className="absolute rounded-md flex items-center justify-center"
                style={baseStyle}
                onDoubleClick={onDoubleClick}
            >
                <span className="text-center break-words max-w-full">
                    {text}
                </span>
            </div>
        );
    };

    return renderShapeContent();
};
