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
  ToggleButton,
  ToggleButtonGroup,
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
import { useNavigate } from "react-router-dom";

type RoomWithId = Room & { id: string; distance?: number };

interface GroupSearchModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  title?: string;
}

const GroupSearchModal = ({ open, setOpen, title }: GroupSearchModalProps) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isOnlineFilter, setIsOnlineFilter] = useState<boolean>(true);
  const [results, setResults] = useState<RoomWithId[]>([]);
  const [autocompleteOptions, setAutocompleteOptions] = useState<string[]>([]);
  const [user] = useAuthState(auth);
  const [locationRange, setLocationRange] = useState<number>(50); // default range
  const [sortOrder, setSortOrder] = useState<"closest" | "farthest">("closest"); // Default sorting order
  const currentLocation = useAsyncMemo(getCurrentLocation, []);
  const navigate = useNavigate();

  useEffect(() => {
    if (title) {
      setSearchTerm(title);
    }
  }, [title]);

  useEffect(() => {
    // Fetch room titles for autocomplete
    const fetchRoomTitles = async () => {
      if (!user?.uid) return;

      try {
        // Step 1: Fetch the rooms where the user has already joined
        const joinedRoomsQuery = query(
          collection(db, "groupMembers"),
          where("userId", "==", user.uid),
        );
        const joinedRoomsSnapshot = await getDocs(joinedRoomsQuery);
        const joinedRoomIds = joinedRoomsSnapshot.docs.map(
          (doc) => doc.data().roomId,
        );

        // Step 2: Fetch room titles from the rooms collection, excluding joined rooms
        const roomTitles: string[] = [];
        const roomsQuery = query(
          collection(db, "rooms"),
          where("adminId", "!=", user.uid),
        );
        const roomsSnapshot = await getDocs(roomsQuery);

        // Iterate through the rooms
        for (const doc of roomsSnapshot.docs) {
          const room = doc.data() as RoomWithId;

          // Check if room is already full
          if (room.maxMembers) {
            // Query to count current members in the group
            const groupMembersRef = collection(db, "groupMembers");
            const membersQuery = query(
              groupMembersRef,
              where("roomId", "==", doc.id),
            );
            const membersSnapshot = await getDocs(membersQuery);
            const currentMembersCount = membersSnapshot.size;

            // If the group is full or the user has already joined, skip it
            if (
              currentMembersCount >= room.maxMembers ||
              joinedRoomIds.includes(doc.id)
            ) {
              continue;
            }
          }

          // Add the room title if it passes the checks
          if (room.roomTitle) {
            roomTitles.push(room.roomTitle);
          }
        }

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
      let q;
      if (isOnlineFilter) {
        // Query for online rooms only
        q = query(collection(db, "rooms"), where("isOnline", "==", true));
      } else {
        // Query for offline rooms only
        q = query(collection(db, "rooms"), where("isOnline", "==", false));
      }

      const querySnapshot = await getDocs(q);
      let rooms: RoomWithId[] = [];
      querySnapshot.forEach((doc) => {
        const room = doc.data() as RoomWithId;

        // Filter locally by room title
        if (
          room.roomTitle >= searchTerm &&
          room.roomTitle <= searchTerm + "\uf8ff"
        ) {
          rooms.push({
            ...room,
            id: doc.id,
          });
        }
      });

      // If location filter is applied (for offline rooms), filter rooms based on distance
      if (!isOnlineFilter && currentLocation) {
        rooms = rooms
          .filter((room) => {
            if (!room.location) return false;
            const distance = calculateDistance(
              currentLocation.lat,
              currentLocation.lon,
              +room.location.lat,
              +room.location.lon,
            );
            room["distance"] = distance; // Add distance to the room object for sorting
            return distance <= locationRange;
          })
          .sort((a, b) => {
            // Sort based on the selected order
            return sortOrder === "closest"
              ? a.distance! - b.distance!
              : b.distance! - a.distance!;
          });
      }

      setResults(rooms);
    } catch (error) {
      console.error("Error searching rooms: ", error);
    }
  };

  const joinGroup = async (roomId: string, maxMembers?: number) => {
    if (!user?.uid) return;
    setOpen(false);
    try {
      // Query to count current members in the group
      const groupMembersRef = collection(db, "groupMembers");
      const membersQuery = query(
        groupMembersRef,
        where("roomId", "==", roomId),
      );
      const membersSnapshot = await getDocs(membersQuery);
      const currentMembersCount = membersSnapshot.size;

      // Check if group is full
      if (maxMembers && currentMembersCount >= maxMembers) {
        toast.error("The group is full. Unable to join.");
        return;
      }

      // Add user to the group if not full
      const newGroupMember: GroupMember = {
        userId: user.uid,
        roomId,
        isFavorite: false,
      };

      await addDoc(groupMembersRef, newGroupMember);
      navigate(`/room/${roomId}`, { replace: true });
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
            <>
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

              {/* Sorting */}
              <Grid item xs={12} sm={6}>
                <Typography>Sort by:</Typography>
                <ToggleButtonGroup
                  value={sortOrder}
                  exclusive
                  onChange={(event, newOrder) => setSortOrder(newOrder)}
                  aria-label="Sort by"
                >
                  <ToggleButton value="closest" aria-label="Closest First">
                    Closest First
                  </ToggleButton>
                  <ToggleButton value="farthest" aria-label="Farthest First">
                    Farthest First
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid>
            </>
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
                        onClick={() => joinGroup(room.id, room.maxMembers)}
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
