// src/GapSlider.tsx
import { Slider, Typography } from "@mui/material";
import React from "react";

interface GapSliderProps {
  value: number;
  onChange: (newValue: number) => void;
}

const GapSlider: React.FC<GapSliderProps> = ({ value, onChange }) => {
  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    onChange(newValue as number);
  };

  return (
    <div className="w-full mt-4 pr-4">
      <Slider
        value={value}
        onChange={handleSliderChange}
        aria-labelledby="gap-slider"
        valueLabelDisplay="auto"
        step={1}
        marks
        min={1}
        max={200}
      />
      <Typography>Selected Gap: {value} km</Typography>
    </div>
  );
};

export default GapSlider;
