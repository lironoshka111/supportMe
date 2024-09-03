import React, { useState } from "react";
import axios from "axios";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

export interface diseaseDetails {
  name: string;
  link: string;
}

export interface GeneticDiseaseSearchProps {
  setDiseaseDetails?: (diseaseDetails?: diseaseDetails) => void;
}

const GeneticDiseaseSearch = ({
  setDiseaseDetails,
}: GeneticDiseaseSearchProps) => {
  const [options, setOptions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [value, setValue] = useState<string | null>(null); // Initialize value state

  const shouldSaveTheResult = (data: string[][], text: string) =>
    data.some((item) => item[0] === text);

  const fetchDiseases = async (query: string) => {
    if (!query) return;
    try {
      setDiseaseDetails?.(undefined);
      const response = await axios.get(
        `https://clinicaltables.nlm.nih.gov/api/conditions/v3/search?authenticity_token=&terms=${query}&cf=info_link_data`,
      );
      setOptions(response.data[3] ?? []); // Adjust based on the actual API response structure
      let link = response.data[1]?.[0]?.[0]?.[0];
      if (shouldSaveTheResult(response.data[3], query)) {
        if (query.toLowerCase().includes("ptsd")) {
          link = "https://medlineplus.gov/posttraumaticstressdisorder.html";
        }
        setDiseaseDetails?.({ name: query, link });
      }
      return link;
    } catch (error) {
      console.error("Error fetching diseases:", error);
    }
  };

  return (
    <div className="flex bg-white w-full p-2 rounded-xl">
      <Autocomplete
        className="w-full h-full"
        freeSolo
        options={options.map((option) => option?.[0])}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
          fetchDiseases(newInputValue);
        }}
        value={value} // Set value prop to controlled state
        onChange={(event: any, newValue: string | null) => {
          setValue(newValue);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            className="bg-white rounded-lg"
            label="Search Genetic Diseases"
            variant="outlined"
          />
        )}
      />
    </div>
  );
};

export default GeneticDiseaseSearch;
