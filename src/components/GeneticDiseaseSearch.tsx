import React, { useState } from "react";
import axios from "axios";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";

const GeneticDiseaseSearch: React.FC = () => {
  const [options, setOptions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>("");

  const fetchDiseases = async (query: string) => {
    if (!query) return;
    try {
      const response = await axios.get(
        `https://clinicaltables.nlm.nih.gov/api/conditions/v3/search?authenticity_token=&terms=${query}`,
      );
      setOptions(response.data[3] ?? []); // Adjust based on the actual API response structure
    } catch (error) {
      console.error("Error fetching diseases:", error);
    }
  };

  return (
    <Autocomplete
      className="w-full"
      freeSolo
      options={options.map((option) => option?.[0])}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
        fetchDiseases(newInputValue);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search Genetic Diseases"
          variant="outlined"
        />
      )}
    />
  );
};

export default GeneticDiseaseSearch;
