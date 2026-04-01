import { create } from "zustand";

export type ToolType =
  | "select"
  | "freehand"
  | "eraser"
  | "background"
  | "circle"
  | "square"
  | "triangle"
  | "text"
  | "emoji"
  | "sticker";

interface DrawingState {
  activeTool: ToolType;
  brushSize: number;
  selectedColor: string;
  selectedEmoji: string;
  selectedSticker: string;
  recentColors: string[];
  history: string[]; // Capped at 30 JSON strings
  historyIndex: number; // 0 is oldest, history.length - 1 is newest

  // Actions
  setActiveTool: (tool: ToolType) => void;
  setBrushSize: (size: number) => void;
  setSelectedColor: (color: string) => void;
  setSelectedEmoji: (emoji: string) => void;
  setSelectedSticker: (sticker: string) => void;
  pushHistory: (json: string) => void;
  undo: () => string | null;
  redo: () => string | null;
  clearHistory: () => void;
}

const MAX_HISTORY = 30;

export const useDrawingStore = create<DrawingState>((set, get) => ({
  activeTool: "freehand",
  brushSize: 10,
  selectedColor: "#FF0000",
  selectedEmoji: "😀",
  selectedSticker: "dog",
  recentColors: [
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
  ],
  history: [],
  historyIndex: -1,

  setActiveTool: (tool) => set({ activeTool: tool }),
  setBrushSize: (size) => set({ brushSize: size }),
  setSelectedEmoji: (emoji) =>
    set({ selectedEmoji: emoji, activeTool: "emoji" }),
  setSelectedSticker: (sticker) =>
    set({ selectedSticker: sticker, activeTool: "sticker" }),
  setSelectedColor: (color) => {
    set((state) => {
      const newRecent = [
        color,
        ...state.recentColors.filter((c) => c !== color),
      ].slice(0, 6);
      return { selectedColor: color, recentColors: newRecent };
    });
  },

  pushHistory: (json: string) => {
    set((state) => {
      // Avoid pushing consecutive identical states to prevent requiring double-undos
      if (
        state.historyIndex >= 0 &&
        state.history[state.historyIndex] === json
      ) {
        return state;
      }

      // If we are not at the end of history, truncate the future
      let newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(json);

      if (newHistory.length > MAX_HISTORY) {
        newHistory = newHistory.slice(newHistory.length - MAX_HISTORY);
      }

      return {
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  },

  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      set({ historyIndex: newIndex });
      return state.history[newIndex];
    }
    return null; // Cannot undo further
  },

  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      set({ historyIndex: newIndex });
      return state.history[newIndex];
    }
    return null; // Cannot redo further
  },

  clearHistory: () => set({ history: [], historyIndex: -1 }),
}));
