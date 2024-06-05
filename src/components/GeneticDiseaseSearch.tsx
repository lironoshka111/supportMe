import React, { useState, useEffect } from "react";
import axios from "axios";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useCollection } from "react-firebase-hooks/firestore";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useRedux } from "../redux/reduxStateContext";

interface Room {
  name: string;
  id: string;
}

export interface diseaseDetails {
  name: string;
  link: string;
}

export interface GeneticDiseaseSearchProps {
  setDiseaseDetails?: (diseaseDetails: diseaseDetails) => void;
}

const GeneticDiseaseSearch = ({
  setDiseaseDetails,
}: GeneticDiseaseSearchProps) => {
  // const [snapshot, loading, error] = useCollection(collection(db, "rooms"));
  const [options, setOptions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [value, setValue] = useState<string | null>(null); // Initialize value state

  // const isRoomExist = (roomName: string) => {
  //   let isExist = null;
  //   if (snapshot) {
  //     snapshot.docs.map((doc) => {
  //       if (doc.data().name === roomName) {
  //         isExist = { name: doc.data().name, id: doc.id } as Room;
  //       }
  //     });
  //   }
  //   return isExist;
  // };

  const fetchDiseases = async (query: string) => {
    if (!query) return;
    try {
      const response = await axios.get(
        `https://clinicaltables.nlm.nih.gov/api/conditions/v3/search?authenticity_token=&terms=${query}&cf=info_link_data`,
      );
      setOptions(response.data[3] ?? []); // Adjust based on the actual API response structure
      const link = response.data[1]?.[0]?.[0]?.[0];
      if (link) {
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
        onClose={() => {
          if (!value) return;
          //  const isExist = isRoomExist(value) as unknown as Room;
          //if (!isExist?.id) return;
          // return navigate(`/room/${isExist?.id}`);
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
