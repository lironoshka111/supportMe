import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  Slider,
  TextField,
  Typography,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { GroupMember, Room } from "../../types/models";
import { useAuthState } from "react-firebase-hooks/auth";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";
import {
  calculateDistance,
  getCurrentLocation,
} from "../utilities/LocationAutocomplete";
import { useAsyncMemo } from "use-async-memo";

type RoomWithId = Room & { id: string };
interface GroupSearchModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  title?: string;
}

const GroupSearchModal = ({ open, setOpen, title }: GroupSearchModalProps) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isOnlineFilter, setIsOnlineFilter] = useState<boolean>(true);
  const [results, setResults] = useState<RoomWithId[]>([] as RoomWithId[]);
  const [autocompleteOptions, setAutocompleteOptions] = useState<string[]>([]);
  const [user] = useAuthState(auth);
  const [locationRange, setLocationRange] = useState<number>(50); // default range
  const currentLocation = useAsyncMemo(getCurrentLocation, []);

  if (!currentLocation) {
    toast.error("Location not available. Please enable location services.");
    return null;
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (title) {
      setSearchTerm(title);
    }
  }, [title]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    // Fetch room titles for autocomplete
    const fetchRoomTitles = async () => {
      try {
        const roomTitles: string[] = [];
        const q = query(
          collection(db, "rooms"),
          where("adminId", "!=", user?.uid),
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          const room = doc.data() as Room;
          if (room.roomTitle) roomTitles.push(room.roomTitle);
        });
        setAutocompleteOptions(roomTitles);
      } catch (error) {
        console.error("Error fetching room titles: ", error);
      }
    };

    fetchRoomTitles();
  }, [user?.uid]);

  const handleSearch = async () => {
    setResults([]);
    try {
      const constraints = [
        where("roomTitle", ">=", searchTerm),
        where("roomTitle", "<=", searchTerm + "\uf8ff"),
      ];

      if (isOnlineFilter) {
        constraints.push(where("isOnline", "==", true));
      } else if (locationRange > 0) {
        constraints.push(
          where("location", ">=", {
            lat: currentLocation?.lat - locationRange * 0.01,
            lon: currentLocation?.lon - locationRange * 0.01,
          }),
        );
        constraints.push(
          where("location", "<=", {
            lat: currentLocation?.lat + locationRange * 0.01,
            lon: currentLocation?.lon + locationRange * 0.01,
          }),
        );
        // Apply additional location-based filter logic, e.g., using a geo-query
      }

      const q = query(collection(db, "rooms"), ...constraints);
      // if (q.) {
      //   setResults([]);
      // }
      const querySnapshot = await getDocs(q);
      const rooms: RoomWithId[] = [];
      querySnapshot.forEach((doc) => {
        rooms.push({
          ...doc.data(),
          id: doc.id,
        } as RoomWithId); // Mock distance
      });
      setResults(rooms);
    } catch (error) {
      console.error("Error searching rooms: ", error);
    }
  };

  const joinGroup = async (roomId: string) => {
    if (!user?.uid) return;
    try {
      setOpen(false);
      const groupMemberRef = collection(db, "groupMembers");
      const newGroupMember: GroupMember = {
        userId: user.uid,
        roomId,
        isFavorite: false,
      };

      await addDoc(groupMemberRef, newGroupMember);
      toast.success("Joined the group successfully!");
    } catch (error) {
      console.error("Error joining the group: ", error);
      toast.error("Failed to join the group.");
    }
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
      <div className="flex justify-between p-1">
        <DialogTitle>Search Groups</DialogTitle>
        <IconButton onClick={() => setOpen(false)}>
          <CloseIcon />
        </IconButton>
      </div>
      <DialogContent>
        <Grid container spacing={2}>
          {/* Search Bar */}
          <Grid item xs={12}>
            <Autocomplete
              freeSolo
              options={autocompleteOptions}
              value={searchTerm}
              onInputChange={(event, newInputValue) =>
                setSearchTerm(newInputValue)
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search by Title"
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <IconButton onClick={handleSearch}>
                        <Search />
                      </IconButton>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          {/* Filters */}
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isOnlineFilter}
                  onChange={(e) => setIsOnlineFilter(e.target.checked)}
                />
              }
              label={<InputLabel>Online</InputLabel>}
              style={{ marginTop: "10px" }}
            />
          </Grid>
          {!isOnlineFilter && (
            <Grid item xs={12} sm={6}>
              <InputLabel>Distance (km)</InputLabel>
              <Slider
                value={locationRange}
                onChange={(event, value) => setLocationRange(value as number)}
                aria-labelledby="distance-slider"
                valueLabelDisplay="on"
                step={5}
                marks
                min={0}
                max={200}
              />
            </Grid>
          )}

          {/* Search Button */}
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearch}
              fullWidth
            >
              Search
            </Button>
          </Grid>

          {/* Results */}
          <Grid item xs={12}>
            <Typography variant="h6" style={{ marginTop: "20px" }}>
              Results {results.length ? `(${results.length})` : ""}
            </Typography>
            {results.length === 0 ? (
              <Typography>No results found</Typography>
            ) : (
              results.map((room) => {
                const distance =
                  room.location && currentLocation
                    ? calculateDistance(
                        currentLocation.lat,
                        currentLocation.lon,
                        +room.location.lat,
                        +room.location.lon,
                      )
                    : 0;
                return (
                  <Card key={room.id} style={{ marginBottom: "10px" }}>
                    <CardContent>
                      <Typography variant="h6">{room.roomTitle}</Typography>
                      <Typography variant="body2">
                        {room.description}
                      </Typography>
                      <Typography variant="body2">
                        {room.isOnline
                          ? "Online"
                          : distance && `Distance: ${distance.toFixed(2)} km`}
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={() => joinGroup(room.id)}
                        style={{ marginTop: "10px" }}
                      >
                        Join Group
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default GroupSearchModal;
