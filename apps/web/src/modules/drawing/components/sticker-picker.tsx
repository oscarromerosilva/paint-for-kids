import type { LucideProps } from "lucide-react";
import {
  Bird,
  Bug,
  Car,
  Cat,
  Circle,
  Cloud,
  Dog,
  Fish,
  Flower,
  Heart,
  Moon,
  Rabbit,
  Rainbow,
  Rocket,
  Snail,
  Square,
  Star,
  Sun,
  Triangle,
  Turtle,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useDrawingStore } from "../store/drawingStore";

export const STICKERS: Record<string, React.FC<LucideProps>> = {
  circle: Circle,
  square: Square,
  triangle: Triangle,
  dog: Dog,
  cat: Cat,
  car: Car,
  rocket: Rocket,
  bug: Bug,
  bird: Bird,
  rabbit: Rabbit,
  snail: Snail,
  turtle: Turtle,
  fish: Fish,
  star: Star,
  heart: Heart,
  sun: Sun,
  moon: Moon,
  cloud: Cloud,
  rainbow: Rainbow,
  flower: Flower,
};

const STICKER_KEYS = Object.keys(STICKERS);

export function StickerPicker() {
  const selectedSticker = useDrawingStore((state) => state.selectedSticker);
  const setSelectedSticker = useDrawingStore(
    (state) => state.setSelectedSticker,
  );
  const activeTool = useDrawingStore((state) => state.activeTool);
  const setActiveTool = useDrawingStore((state) => state.setActiveTool);

  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "pointer-events-auto h-11 w-11 shrink-0 rounded-[1.2rem] text-xl transition-all duration-300",
            activeTool === "sticker"
              ? "-translate-y-1 bg-indigo-500 text-white shadow-indigo-500/40 shadow-lg hover:bg-indigo-600 hover:text-white"
              : "bg-transparent text-slate-500 hover:bg-indigo-100 hover:text-indigo-600",
          )}
          aria-label="Sticker Picker"
        >
          {activeTool === "sticker" ? (
            (() => {
              const Icon = STICKERS[selectedSticker];
              return Icon ? (
                <Icon className="h-7 w-7" />
              ) : (
                <Star className="h-7 w-7" />
              );
            })()
          ) : (
            <Star className="h-7 w-7" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" side="top" align="center">
        <div className="grid gap-2">
          <h4 className="mb-2 font-medium text-sm">Stickers</h4>
          <div className="grid h-auto grid-cols-5 gap-2 overflow-y-auto">
            {STICKER_KEYS.map((key) => {
              const Icon = STICKERS[key];
              return (
                <button
                  type="button"
                  key={key}
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-colors hover:bg-indigo-100 hover:text-indigo-700 ${
                    selectedSticker === key
                      ? "bg-indigo-200 text-indigo-700"
                      : "text-slate-600"
                  }`}
                  onClick={() => {
                    setSelectedSticker(key);
                    setActiveTool("sticker");
                    setIsOpen(false);
                  }}
                  title={key}
                >
                  <Icon
                    className={`h-6 w-6 hover:text-indigo-700 ${selectedSticker === key ? "text-indigo-700" : "text-white"}`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
