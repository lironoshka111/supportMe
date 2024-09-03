import React, { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";

interface LocationAutocompleteProps {
  initialValue?: string;
  onSelect: (location: NominatimSuggestion) => void; // Callback for when a location is selected
}
export type NominatimSuggestion = {
  place_id: string;
  lat: string;
  lon: string;
  display_name: string;
  type?: string;
  address?: {
    [key: string]: string;
  };
};

const fetchSuggestions = async (query: string) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1`,
  );
  return (await response.json()) as NominatimSuggestion[];
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// Function to get current location

// Function to get current location
export const getCurrentLocation = (): Promise<{ lat: number; lon: number }> => {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          resolve(location);
        },
        (error) => {
          console.error("Error getting location:", error);
          reject(error);
        },
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      reject(new Error("Geolocation is not supported by this browser."));
    }
  });
};

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  onSelect,
  initialValue = "",
}) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lon: number;
  }>();
  const [shouldShowSuggestions, setShouldShowSuggestions] = useState(false);
  useEffect(() => {
    getCurrentLocation().then(setUserLocation);
  }, []);
  useEffect(() => {
    if (!shouldShowSuggestions) {
      return;
    }
    if (inputValue.length > 2) {
      fetchSuggestions(inputValue).then(setSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [inputValue, shouldShowSuggestions]);

  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  const onSelectItem = (suggestion: NominatimSuggestion) => {
    setInputValue(suggestion.display_name);
    onSelect(suggestion);
    setSuggestions([]);
    setShouldShowSuggestions(false);
  };
  return (
    <div>
      <TextField
        value={inputValue}
        onChange={(e) => {
          setShouldShowSuggestions(true);
          return setInputValue(e.target.value);
        }}
        label="Enter location"
        variant="outlined"
        fullWidth
      />
      {shouldShowSuggestions && suggestions.length > 0 && (
        <Paper elevation={3} style={{ marginTop: 8 }}>
          <List>
            {suggestions
              ?.slice(0, 5)
              ?.map((suggestion: NominatimSuggestion) => (
                <React.Fragment key={suggestion.place_id}>
                  <ListItem onClick={() => onSelectItem(suggestion)}>
                    <ListItemText
                      primary={suggestion.display_name}
                      secondary={
                        userLocation
                          ? `Distance: ${calculateDistance(
                              userLocation?.lat ?? 0,
                              userLocation?.lon ?? 0,
                              +suggestion.lat,
                              +suggestion.lon,
                            ).toFixed(2)} km`
                          : undefined
                      }
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
          </List>
        </Paper>
      )}
    </div>
  );
};

export default LocationAutocomplete;
