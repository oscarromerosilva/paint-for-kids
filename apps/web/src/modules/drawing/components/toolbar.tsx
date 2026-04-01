import {
  Download,
  Eraser,
  Image as ImageIcon,
  MousePointer2,
  PaintBucket,
  Pen,
  Redo,
  Trash2,
  Type,
  Undo,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type ToolType, useDrawingStore } from "../store/drawingStore";
import { ColorPicker } from "./color-picker";
import { EmojiPicker } from "./emoji-picker";
import { StickerPicker } from "./sticker-picker";

interface ToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onExport: () => void;
  onUploadBackground: (url: string) => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function Toolbar({
  onUndo,
  onRedo,
  onClear,
  onExport,
  onUploadBackground,
  canUndo,
  canRedo,
}: ToolbarProps) {
  const { t } = useTranslation();
  const activeTool = useDrawingStore((state) => state.activeTool);
  const setActiveTool = useDrawingStore((state) => state.setActiveTool);

  const tools: { id: ToolType; icon: React.ReactNode; labelKey: string }[] = [
    {
      id: "select",
      icon: <MousePointer2 className="h-6 w-6" />,
      labelKey: "tools.select",
    },
    {
      id: "freehand",
      icon: <Pen className="h-6 w-6" />,
      labelKey: "tools.freehand",
    },
    {
      id: "eraser",
      icon: <Eraser className="h-6 w-6" />,
      labelKey: "tools.eraser",
    },
    {
      id: "background",
      icon: <PaintBucket className="h-6 w-6" />,
      labelKey: "tools.background",
    },
    { id: "text", icon: <Type className="h-6 w-6" />, labelKey: "tools.text" },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        onUploadBackground(event.target.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="pointer-events-none fixed right-2 bottom-2 left-2 z-50 md:bottom-6 md:left-1/2 md:w-full md:max-w-3xl md:-translate-x-1/2">
      <div className="pointer-events-auto flex flex-col gap-3">
        {/* Actions Row (Top) */}
        <div className="flex w-full items-end justify-end px-2">
          {/* Right Actions: Undo / Redo / Clear / Export */}
          <div className="flex gap-1 rounded-[2rem] border-[4px] border-blue-100 bg-white/95 px-2 py-1.5 shadow-xl backdrop-blur-xl">
            <Button
              disabled={!canUndo}
              onClick={onUndo}
              variant="ghost"
              className="h-12 w-12 rounded-2xl text-blue-500 transition-transform hover:bg-blue-100 active:scale-90"
            >
              <Undo className="h-6 w-6" />
            </Button>
            <Button
              disabled={!canRedo}
              onClick={onRedo}
              variant="ghost"
              className="h-12 w-12 rounded-2xl text-blue-500 transition-transform hover:bg-blue-100 active:scale-90"
            >
              <Redo className="h-6 w-6" />
            </Button>
            <div className="mx-1 my-2 w-1.5 rounded-full bg-blue-100" />
            <Button
              onClick={onClear}
              variant="ghost"
              className="h-12 w-12 rounded-2xl text-red-500 transition-transform hover:bg-red-100 active:scale-90"
            >
              <Trash2 className="h-6 w-6" />
            </Button>
            <Button
              onClick={onExport}
              variant="ghost"
              className="h-12 w-12 rounded-2xl text-green-500 transition-transform hover:bg-green-100 active:scale-90"
            >
              <Download className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Tools Row (Bottom) */}
        <div className="scrollbar-hide flex w-full items-center overflow-x-auto rounded-[2.5rem] border-[4px] border-blue-200 bg-white/95 px-2 py-3 shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex min-w-max items-center gap-2 px-2">
            <div className="z-20 shrink-0 drop-shadow-xl transition-transform hover:scale-105 active:scale-95">
              <ColorPicker />
            </div>

            <div className="mx-1 h-10 w-1.5 shrink-0 rounded-full bg-blue-100" />

            {tools.map((tool) => {
              const isActive = activeTool === tool.id;
              return (
                <Button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id)}
                  title={t(tool.labelKey)}
                  variant="ghost"
                  className={cn(
                    "pointer-events-auto h-14 w-14 shrink-0 rounded-[1.2rem] transition-all duration-300",
                    isActive
                      ? "-translate-y-1 scale-110 bg-blue-500 text-white shadow-blue-500/40 shadow-lg hover:bg-blue-600 hover:text-white"
                      : "bg-transparent text-slate-500 hover:bg-blue-100 hover:text-blue-600 active:scale-95",
                  )}
                >
                  {tool.icon}
                </Button>
              );
            })}

            <div className="mx-1 h-10 w-1.5 rounded-full bg-blue-100" />

            <EmojiPicker />
            <StickerPicker />

            <div className="mx-1 h-10 w-1.5 rounded-full bg-indigo-100" />

            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="background-upload"
              onChange={handleImageUpload}
            />
            <Button
              variant="ghost"
              className="pointer-events-auto h-14 w-14 shrink-0 rounded-[1.2rem] bg-transparent text-slate-500 transition-all duration-300 hover:bg-indigo-100 hover:text-indigo-600 active:scale-95"
              onClick={() =>
                document.getElementById("background-upload")?.click()
              }
              title={t("tools.image", "Upload Background")}
            >
              <ImageIcon className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
