// src/GapSlider.tsx
import { Slider } from "@mui/material";
import React from "react";

interface GapSliderProps {
  value: number;
  onChange: (newValue: number) => void;
  step?: number;
  min?: number;
  max?: number;
}

const GapSlider: React.FC<GapSliderProps> = ({
  value,
  onChange,
  step,
  min,
  max,
}) => {
  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    onChange(newValue as number);
  };

  return (
    <div className="w-full">
      <Slider
        value={value}
        onChange={handleSliderChange}
        aria-labelledby="gap-slider"
        valueLabelDisplay="on"
        step={step ?? 1}
        marks
        min={min ?? 1}
        max={max ?? 200}
      />
    </div>
  );
};

export default GapSlider;
