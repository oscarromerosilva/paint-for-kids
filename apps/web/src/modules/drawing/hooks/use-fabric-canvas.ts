import * as fabric from "fabric";
import { createElement, useCallback, useEffect, useRef } from "react";
import { renderToString } from "react-dom/server";
import { useFeedback } from "@/shared/hooks/use-feedback";
import { STICKERS } from "../components/sticker-picker";
import { useDrawingStore } from "../store/drawingStore";

const ERASER_CURSOR = `url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='white' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21'/%3E%3Cpath d='M22 21H7'/%3E%3Cpath d='m13.3 4.7 5.2 5.2'/%3E%3C/svg%3E") 0 32, pointer`;
const BUCKET_CURSOR = `url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='white' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z'/%3E%3Cpath d='m5 2 5 5'/%3E%3Cpath d='M2 13h15'/%3E%3Cpath d='M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z'/%3E%3C/svg%3E") 0 32, pointer`;

export function useFabricCanvas(canvasId: string) {
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const isRestoring = useRef(false);

  const activeTool = useDrawingStore((state) => state.activeTool);
  const brushSize = useDrawingStore((state) => state.brushSize);
  const selectedColor = useDrawingStore((state) => state.selectedColor);
  const selectedEmoji = useDrawingStore((state) => state.selectedEmoji);
  const selectedSticker = useDrawingStore((state) => state.selectedSticker);
  const pushHistory = useDrawingStore((state) => state.pushHistory);

  const { playAudio, triggerVibration } = useFeedback();

  // Initialize Canvas
  useEffect(() => {
    const el = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!el) return;

    // Use full window size or parent container size.
    // We assume the parent is styled to full height/width.
    const parent = el.parentElement;
    const width = parent?.clientWidth || window.innerWidth;
    const height = parent?.clientHeight || window.innerHeight;

    const canvas = new fabric.Canvas(el, {
      width,
      height,
      selection: true,
      preserveObjectStacking: true,
      backgroundColor: "#ffffff",
    });

    canvasRef.current = canvas;

    // Save initial state
    const json = JSON.stringify(canvas.toJSON());
    pushHistory(json);

    // Event listener to capture drawing history
    const updateHistory = () => {
      if (isRestoring.current) return;
      const stateJson = JSON.stringify(canvas.toJSON());
      pushHistory(stateJson);
    };

    canvas.on("path:created", () => {
      if (isRestoring.current) return;
      playAudio("tap");
      updateHistory();
    });
    canvas.on("object:modified", updateHistory);
    canvas.on("object:added", (e) => {
      if (isRestoring.current) return;
      // Avoid adding history immediately on load
      if (
        !e.target ||
        (e.target as unknown as Record<string, unknown>).__isRestoring
      )
        return;
      playAudio("tap");
      updateHistory();
    });

    const handleResize = () => {
      if (!parent) return;
      canvas.setDimensions({
        width: parent.clientWidth,
        height: parent.clientHeight,
      });
      canvas.renderAll();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.dispose();
      canvasRef.current = null;
    };
  }, [canvasId, pushHistory, playAudio]);

  // Sync tools and brush settings
  // biome-ignore lint/correctness/useExhaustiveDependencies: necessary for syncing tools and brush settings
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Default: not drawing mode
    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.defaultCursor = "default";
    canvas.hoverCursor = "move";

    // Map tool behavior
    if (activeTool === "freehand") {
      canvas.isDrawingMode = true;
      const brush = new fabric.PencilBrush(canvas);
      brush.color = selectedColor;
      brush.width = brushSize;
      canvas.freeDrawingBrush = brush;
    } else if (activeTool === "eraser") {
      canvas.isDrawingMode = false;
      canvas.selection = false;
      canvas.defaultCursor = ERASER_CURSOR;
      canvas.hoverCursor = ERASER_CURSOR;
    } else if (activeTool === "background") {
      canvas.isDrawingMode = false;
      canvas.selection = false;
      canvas.defaultCursor = BUCKET_CURSOR;
      canvas.hoverCursor = BUCKET_CURSOR;
    } else if (activeTool === "select") {
      canvas.selection = true;
      canvas.defaultCursor = "default";
      canvas.hoverCursor = "move";
    } else {
      // Shapes and others. Let them drag/select objects.
      canvas.selection = true;
      canvas.defaultCursor = "crosshair";
      canvas.hoverCursor = "crosshair";
    }

    // Set interactive properties for objects based on tool
    canvas.getObjects().forEach((obj) => {
      const isSelectable =
        activeTool === "select" ||
        (activeTool !== "freehand" &&
          activeTool !== "eraser" &&
          activeTool !== "background" &&
          activeTool !== "emoji" &&
          activeTool !== "sticker");
      obj.selectable = isSelectable;
      // We want Bucket and Eraser to detect clicks on shapes too!
      obj.evented =
        activeTool === "background" || activeTool === "eraser" || isSelectable;
    });

    canvas.renderAll();
  }, [activeTool, brushSize, selectedColor, pushHistory, playAudio]);

  // Click to add shapes (circle, square, triangle, text)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (opt: fabric.TPointerEventInfo) => {
      if (!canvas) return;
      if (activeTool === "background") {
        if (opt.target) {
          if (opt.target instanceof fabric.Group) {
            opt.target.getObjects().forEach((child: fabric.FabricObject) => {
              child.set("fill", selectedColor);
            });
          } else {
            opt.target.set("fill", selectedColor);
          }
        } else {
          canvas.backgroundColor = selectedColor;
        }
        canvas.renderAll();
        triggerVibration("light");
        playAudio("success");
        pushHistory(JSON.stringify(canvas.toJSON()));
        return;
      }

      // Eraser logic
      if (activeTool === "eraser") {
        if (opt.target) {
          canvas.remove(opt.target);
          canvas.renderAll();
          triggerVibration("medium");
          playAudio("success");
          pushHistory(JSON.stringify(canvas.toJSON()));
        }
        return;
      }

      if (activeTool === "select" || activeTool === "freehand") return;
      // Do not place shape if we clicked on an existing object
      if (opt.target) return;

      const pointer = canvas.getPointer(opt.e);
      let newObj: fabric.FabricObject | null = null;

      const commonProps = {
        left: pointer.x,
        top: pointer.y,
        originX: "center" as const,
        originY: "center" as const,
      };

      const shapeProps = {
        ...commonProps,
        fill: "transparent",
        stroke: "#000000",
        strokeWidth: 4,
      };

      if (activeTool === "emoji") {
        newObj = new fabric.IText(selectedEmoji, {
          ...commonProps,
          fontSize: 80,
          fontFamily: "sans-serif",
        });
      } else if (activeTool === "sticker") {
        if (selectedSticker === "circle") {
          newObj = new fabric.Circle({ ...shapeProps, radius: 50 });
        } else if (selectedSticker === "square") {
          newObj = new fabric.Rect({ ...shapeProps, width: 100, height: 100 });
        } else if (selectedSticker === "triangle") {
          newObj = new fabric.Triangle({
            ...shapeProps,
            width: 100,
            height: 100,
          });
        } else {
          const IconComponent = STICKERS[selectedSticker];
          if (IconComponent) {
            const svgMarkup = renderToString(
              createElement(IconComponent, {
                size: 24,
                color: "#000000",
                strokeWidth: 1,
              }),
            );
            fabric.loadSVGFromString(svgMarkup).then(({ objects }) => {
              if (!canvas) return;
              const valid = objects.filter(
                (o): o is fabric.FabricObject => !!o,
              );
              const group = new fabric.Group(valid);

              group.set({
                left: pointer.x,
                top: pointer.y,
                originX: "center",
                originY: "center",
                scaleX: 4,
                scaleY: 4,
              });

              canvas.add(group);
              canvas.setActiveObject(group);
              canvas.renderAll();
              triggerVibration("light");

              const stateJson = JSON.stringify(canvas.toJSON());
              pushHistory(stateJson);
            });
            return;
          }
        }
      } else if (activeTool === "text") {
        newObj = new fabric.IText("Hello", {
          ...commonProps,
          fill: selectedColor,
          fontSize: 60,
          fontFamily: "Raleway Variable",
        });
      }

      if (newObj) {
        canvas.add(newObj as fabric.FabricObject);
        canvas.setActiveObject(newObj as fabric.FabricObject);
        triggerVibration("light");
      }
    };

    canvas.on("mouse:down", handleMouseDown);

    return () => {
      canvas.off("mouse:down", handleMouseDown);
    };
  }, [
    activeTool,
    selectedColor,
    selectedEmoji,
    selectedSticker,
    triggerVibration,
    pushHistory,
    playAudio,
  ]);

  // Handle keyboard deletes (backspace / delete)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Backspace" || e.key === "Delete") {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const activeObjects = canvas.getActiveObjects();
        if (activeObjects.length > 0) {
          activeObjects.forEach((obj) => {
            canvas.remove(obj);
          });
          canvas.discardActiveObject();
          canvas.renderAll();
          playAudio("success");
          pushHistory(JSON.stringify(canvas.toJSON()));
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pushHistory, playAudio]);

  // Exposed API
  const undoCanvas = useCallback(async (jsonString: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    isRestoring.current = true;
    try {
      await canvas.loadFromJSON(jsonString);
      canvas.renderAll();
    } finally {
      isRestoring.current = false;
    }
  }, []);

  const redoCanvas = useCallback(async (jsonString: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    isRestoring.current = true;
    try {
      await canvas.loadFromJSON(jsonString);
      canvas.renderAll();
    } finally {
      isRestoring.current = false;
    }
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    isRestoring.current = true;
    canvas.clear();
    canvas.backgroundColor = "#ffffff";
    playAudio("clear");
    isRestoring.current = false;
    pushHistory(JSON.stringify(canvas.toJSON()));
  }, [pushHistory, playAudio]);

  const loadFromJSON = useCallback(async (jsonString: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    isRestoring.current = true;
    try {
      await canvas.loadFromJSON(jsonString);
      canvas.renderAll();
    } finally {
      isRestoring.current = false;
    }
  }, []);

  const exportPNG = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.toDataURL({
      format: "png",
      multiplier: window.devicePixelRatio || 1,
    });
  }, []);

  const setBackgroundImage = useCallback(
    (imageUrl: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      isRestoring.current = true;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const fImg = new fabric.Image(img);
        // Scale to fit
        const scaleX = (canvas.width ?? 1) / fImg.width;
        const scaleY = (canvas.height ?? 1) / fImg.height;
        const scale = Math.min(scaleX, scaleY);

        fImg.set({
          originX: "center",
          originY: "center",
          scaleX: scale,
          scaleY: scale,
          left: (canvas.width ?? 1) / 2,
          top: (canvas.height ?? 1) / 2,
        });

        canvas.backgroundImage = fImg;
        canvas.renderAll();
        isRestoring.current = false;
        pushHistory(JSON.stringify(canvas.toJSON()));
        playAudio("success");
      };
      img.src = imageUrl;
    },
    [pushHistory, playAudio],
  );

  const getCanvasJson = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.toJSON();
  }, []);

  return {
    canvasRef,
    undoCanvas,
    redoCanvas,
    clearCanvas,
    exportPNG,
    loadFromJSON,
    getCanvasJson,
    setBackgroundImage,
  };
}
