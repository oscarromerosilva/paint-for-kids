import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Toolbar } from "../modules/drawing/components/toolbar";
import { useFabricCanvas } from "../modules/drawing/hooks/use-fabric-canvas";
import { drawingService } from "../modules/drawing/services/drawingService";
import { useDrawingStore } from "../modules/drawing/store/drawingStore";

export default function Draw() {
  const { t } = useTranslation();

  const history = useDrawingStore((state) => state.history);
  const historyIndex = useDrawingStore((state) => state.historyIndex);
  const setActiveTool = useDrawingStore((state) => state.setActiveTool);
  const { undo, redo, clearHistory } = useDrawingStore.getState();

  const {
    undoCanvas,
    redoCanvas,
    clearCanvas,
    exportPNG,
    loadFromJSON,
    getCanvasJson,
    setBackgroundImage,
  } = useFabricCanvas("kids-drawing-canvas");

  // Load from IndexedDB on mount
  // biome-ignore lint/correctness/useExhaustiveDependencies: necessary for loading the drawing
  useEffect(() => {
    async function load() {
      try {
        const saved = await drawingService.loadCurrentDrawing();
        if (saved) {
          loadFromJSON(saved);
        }
      } catch (e) {
        console.error("Failed to load drawing", e);
      }
    }
    load();
  }, []);

  // Autosave every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      const json = getCanvasJson();
      if (json) {
        drawingService.saveCurrentDrawing(json).catch(console.error);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [getCanvasJson]);

  const handleUndo = () => {
    const jsonStr = undo();
    if (jsonStr) undoCanvas(jsonStr);
  };

  const handleRedo = () => {
    const jsonStr = redo();
    if (jsonStr) redoCanvas(jsonStr);
  };

  const handleClear = () => {
    clearCanvas();
    drawingService.clearCurrentDrawing().catch(console.error);
    clearHistory();
    setActiveTool("freehand");
    toast.success(t("tools.clear"));
  };

  const handleExport = () => {
    const dataUrl = exportPNG();
    if (dataUrl) {
      drawingService.downloadPNG(dataUrl, "my-kid-drawing.png");
      toast.success(t("tools.export"));
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      {/* Canvas Container */}
      <div className="absolute inset-0 pb-[80px]">
        {" "}
        {/* Leave space for toolbar */}
        <canvas id="kids-drawing-canvas" className="h-full w-full touch-none" />
      </div>

      <Toolbar
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
        onExport={handleExport}
        onUploadBackground={setBackgroundImage}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
      />
    </div>
  );
}
