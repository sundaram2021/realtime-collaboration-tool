export interface Shape {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  fontSize: number;
  fontFamily: string;
  rotation: number;
  opacity: number;
}

export interface Connection {
  end: any;
  start: any;
  id: string;
  startShapeId: string;
  endShapeId: string;
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  type: 'straight' | 'curved';
  style: 'solid' | 'dashed' | 'dotted';
  startArrow: boolean;
  endArrow: boolean;
  color: string;
  width: number;
}

export interface Drawing {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  strokeWidth: number;
}

export interface HistoryEntry {
  shapes: Shape[];
  connections: Connection[];
  drawings: Drawing[];
}

export interface Tool {
  id: string;
  type: string;
  label: string;
  category: string;
  icon: React.ComponentType<any>;
  defaultWidth?: number;
  defaultHeight?: number;
  isConnection?: boolean;
}

export interface ResizeHandle {
  position: 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';
  x: number;
  y: number;
}

export interface ConnectionPoint {
  shapeId: string;
  x: number;
  y: number;
  side: 'top' | 'right' | 'bottom' | 'left';
}

export interface SelectionBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface ConnectionHandle {
  shapeId: string;
  side: 'top' | 'right' | 'bottom' | 'left';
  x: number;
  y: number;
}

export interface ClipboardData {
  shapes: Shape[];
  connections: Connection[];
}