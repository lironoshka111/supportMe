import React, { useState, useEffect } from "react";
import axios from "axios";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useCollection } from "react-firebase-hooks/firestore";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";
import { useOwnDispatch, useOwnSelector } from "..";
import { roomSelected } from "../redux/channelSlice";
import { Alert, Snackbar } from "@mui/material";

interface Room {
  name: string;
  id: string;
}
const GeneticDiseaseSearch: React.FC = () => {
  const [snapshot, loading, error] = useCollection(collection(db, "rooms"));
  const [options, setOptions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const dispatch = useOwnDispatch();
  const [value, setValue] = useState<string | null>(null); // Initialize value state
  const [link, setLink] = useState<string>("");

  const isRoomExist = (roomName: string) => {
    let isExist = null;
    if (snapshot) {
      snapshot.docs.map((doc) => {
        if (doc.data().name === roomName) {
          isExist = { name: doc.data().name, id: doc.id };
        }
      });
    }
    return isExist;
  };
  const addChannel = async (name: string) => {
    const res = await addDoc(collection(db, "rooms"), {
      name: name,
      link: link,
    });
    dispatch(
      roomSelected({
        id: res.id as string,
        title: name as string,
      }),
    );
  };

  useEffect(() => {
    if (!value) {
      return;
    }
    const room = isRoomExist(value);
    if (!!room) {
      dispatch(
        roomSelected({
          id: room["id"] as string,
          title: room["name"] as string,
        }),
      );
    } else {
      addChannel(value);
    }
  }, [value, snapshot]);

  const fetchDiseases = async (query: string) => {
    if (!query) return;
    try {
      const response = await axios.get(
        `https://clinicaltables.nlm.nih.gov/api/conditions/v3/search?authenticity_token=&terms=${query}&cf=info_link_data`,
      );
      setOptions(response.data[3] ?? []); // Adjust based on the actual API response structure
      const link = response.data[1]?.[0]?.[0]?.[0];
      setLink(link);
    } catch (error) {
      console.error("Error fetching diseases:", error);
    }
  };

  return (
    <>
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
            label="Search Genetic Diseases"
            variant="outlined"
          />
        )}
      />
    </>
  );
};

export default GeneticDiseaseSearch;
