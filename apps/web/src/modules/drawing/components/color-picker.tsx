import { Palette } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDrawingStore } from "../store/drawingStore";

const PREDEFINED_COLORS = [
  "#FF3B30", // Red
  "#FF9500", // Orange
  "#FFCC00", // Yellow
  "#4CD964", // Green
  "#5AC8FA", // Light Blue
  "#007AFF", // Blue
  "#5856D6", // Purple
  "#FF2D55", // Pink
  "#000000", // Black
  "#FFFFFF", // White
];

export function ColorPicker() {
  const { t } = useTranslation();
  const selectedColor = useDrawingStore((state) => state.selectedColor);
  const setSelectedColor = useDrawingStore((state) => state.setSelectedColor);
  const recentColors = useDrawingStore((state) => state.recentColors);

  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-12 w-12 rounded-full border-4"
          style={{
            backgroundColor: selectedColor,
            borderColor: "var(--border)",
          }}
          aria-label={t("actions.open_color_picker")}
        />
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" side="top" align="center">
        <div className="grid gap-4">
          <div>
            <h4 className="mb-2 font-medium text-sm">Colors</h4>
            <div className="grid grid-cols-5 gap-2">
              {PREDEFINED_COLORS.map((color) => (
                <button
                  type="button"
                  key={color}
                  className={`h-8 w-8 rounded-full border-1 border-white ${
                    selectedColor === color ? "border-primary" : "border-border"
                  } transition-transform`}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    setSelectedColor(color);
                    setIsOpen(false);
                  }}
                  aria-label={color}
                />
              ))}
            </div>
          </div>

          {recentColors.length > 0 && (
            <div>
              <h4 className="mb-2 font-medium text-sm">Recent</h4>
              <div className="flex gap-2">
                {recentColors.map((color) => (
                  <button
                    type="button"
                    key={color}
                    className="h-8 w-8 rounded-full border-2 border-border"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      setSelectedColor(color);
                      setIsOpen(false);
                    }}
                    aria-label={`Recent ${color}`}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-muted-foreground" />
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="h-8 flex-1 cursor-pointer rounded"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
