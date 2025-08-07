import { create } from 'zustand';
import {
    Shape,
    Connection,
    Drawing,
    Tool,
    ConnectionPoint,
    HistoryEntry,
} from '@/components/diagram/types';
import { produce } from 'immer';

let shapeCounter = 1;
let connectionCounter = 1;
let drawingCounter = 1;

// Define the state and actions for the store
interface DiagramState {
    shapes: Shape[];
    connections: Connection[];
    drawings: Drawing[];
    selectedIds: Set<string>;
    history: HistoryEntry[];
    historyIndex: number;

    addShape: (tool: Tool, x: number, y: number) => void;
    updateShape: (id: string, updates: Partial<Shape>) => void;
    addConnection: (connection: Connection) => void;
    updateConnection: (id: string, updates: Partial<Connection>) => void;
    startDrawing: (x: number, y: number, color: string, strokeWidth: number) => void;
    addPointToDrawing: (x: number, y: number) => void;
    finishDrawing: () => void;
    selectShape: (id: string, multiSelect?: boolean) => void;
    undo: () => void;
    redo: () => void;
    saveState: () => void;
}

const useDiagramStore = create<DiagramState>((set, get) => ({
    shapes: [],
    connections: [],
    drawings: [],
    selectedIds: new Set(),
    history: [{ shapes: [], connections: [], drawings: [] }],
    historyIndex: 0,

    addShape: (tool, x, y) => {
        const newShape: Shape = {
            id: `${tool.type}_${shapeCounter++}`,
            type: tool.type,
            x: x - (tool.defaultWidth || 100) / 2,
            y: y - (tool.defaultHeight || 60) / 2,
            width: tool.defaultWidth || 100,
            height: tool.defaultHeight || 60,
            text: tool.label,
            fillColor: '#ffffff',
            strokeColor: '#000000',
            strokeWidth: 2,
            fontSize: 16,
            fontFamily: 'Arial',
            rotation: 0,
            opacity: 1,
        };
        set(
            produce((draft) => {
                draft.shapes.push(newShape);
            })
        );
        get().saveState();
    },

    updateShape: (id, updates) => {
        set(
            produce((draft) => {
                const shape = draft.shapes.find((s: { id: string; }) => s.id === id);
                if (shape) {
                    Object.assign(shape, updates);
                }
            })
        );
        get().saveState();
    },

    addConnection: (connection) => {
        set(
            produce((draft) => {
                draft.connections.push({ ...connection, id: `connection_${connectionCounter++}` });
            })
        );
        get().saveState();
    },

    updateConnection: (id, updates) => {
        set(
            produce((draft) => {
                const connection = draft.connections.find((c: { id: string; }) => c.id === id);
                if (connection) {
                    Object.assign(connection, updates);
                }
            })
        );
        get().saveState();
    },

    startDrawing: (x, y, color, strokeWidth) => {
        const newDrawing: Drawing = {
            id: `drawing_${drawingCounter++}`,
            points: [{ x, y }],
            color,
            strokeWidth,
        };
        set(
            produce((draft) => {
                draft.drawings.push(newDrawing);
            })
        );
    },

    addPointToDrawing: (x, y) => {
        set(
            produce((draft) => {
                const currentDrawing = draft.drawings[draft.drawings.length - 1];
                if (currentDrawing) {
                    currentDrawing.points.push({ x, y });
                }
            })
        );
    },

    finishDrawing: () => {
        get().saveState();
    },

    selectShape: (id, multiSelect = false) => {
        set(
            produce((draft) => {
                if (multiSelect) {
                    if (draft.selectedIds.has(id)) {
                        draft.selectedIds.delete(id);
                    } else {
                        draft.selectedIds.add(id);
                    }
                } else {
                    draft.selectedIds = new Set(id ? [id] : []);
                }
            })
        );
    },

    saveState: () => {
        set(
            produce((draft) => {
                const { shapes, connections, drawings, history, historyIndex } = draft;
                const newHistory = history.slice(0, historyIndex + 1);
                newHistory.push({ shapes, connections, drawings });
                draft.history = newHistory;
                draft.historyIndex = newHistory.length - 1;
            })
        );
    },

    undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex > 0) {
            const prevState = history[historyIndex - 1];
            set({
                shapes: prevState.shapes,
                connections: prevState.connections,
                drawings: prevState.drawings,
                historyIndex: historyIndex - 1,
            });
        }
    },

    redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex < history.length - 1) {
            const nextState = history[historyIndex + 1];
            set({
                shapes: nextState.shapes,
                connections: nextState.connections,
                drawings: nextState.drawings,
                historyIndex: historyIndex + 1,
            });
        }
    },
}));

export default useDiagramStore;