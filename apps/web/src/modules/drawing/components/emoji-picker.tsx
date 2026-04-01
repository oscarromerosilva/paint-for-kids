import { Smile } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useDrawingStore } from "../store/drawingStore";

const EMOJIS = [
  "😀",
  "😂",
  "🥰",
  "😎",
  "🐶",
  "🐱",
  "🐰",
  "🦊",
  "🍎",
  "🍓",
  "🚗",
  "🚀",
  "⚽️",
  "🎨",
  "🌟",
  "🎈",
  "🎉",
];

export function EmojiPicker() {
  const selectedEmoji = useDrawingStore((state) => state.selectedEmoji);
  const setSelectedEmoji = useDrawingStore((state) => state.setSelectedEmoji);
  const activeTool = useDrawingStore((state) => state.activeTool);
  const setActiveTool = useDrawingStore((state) => state.setActiveTool);

  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "pointer-events-auto h-11 w-11 shrink-0 rounded-[1.2rem] text-3xl transition-all duration-300",
            activeTool === "emoji"
              ? "-translate-y-1 bg-purple-500 text-white shadow-lg shadow-purple-500/40 hover:bg-purple-600 hover:text-white"
              : "bg-transparent text-slate-500 hover:bg-purple-100 hover:text-purple-600",
          )}
          aria-label="Emoji Picker"
        >
          {activeTool === "emoji" ? (
            selectedEmoji
          ) : (
            <Smile className="h-6 w-6" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" side="top" align="center">
        <div className="grid gap-2">
          <h4 className="mb-2 font-medium text-sm">Emojis</h4>
          <div className="grid grid-cols-4 gap-2">
            {EMOJIS.map((emoji) => (
              <button
                type="button"
                key={emoji}
                className={`flex h-14 w-14 items-center justify-center rounded-2xl text-4xl transition-all hover:bg-purple-100 active:scale-90 ${
                  selectedEmoji === emoji ? "bg-purple-200" : ""
                }`}
                onClick={() => {
                  setSelectedEmoji(emoji);
                  setActiveTool("emoji");
                  setIsOpen(false);
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
