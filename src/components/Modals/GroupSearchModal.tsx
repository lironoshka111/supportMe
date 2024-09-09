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
    const fetchRoomTitles = async () => {
      if (!user?.uid) return;

      try {
        const joinedRoomsQuery = query(
          collection(db, "groupMembers"),
          where("userId", "==", user.uid),
        );
        const joinedRoomsSnapshot = await getDocs(joinedRoomsQuery);
        const joinedRoomIds = joinedRoomsSnapshot.docs.map(
          (doc) => doc.data().roomId,
        );

        const roomTitles: string[] = [];
        const roomsQuery = query(
          collection(db, "rooms"),
          where("adminId", "!=", user.uid),
        );
        const roomsSnapshot = await getDocs(roomsQuery);

        for (const doc of roomsSnapshot.docs) {
          const room = doc.data() as RoomWithId;
          if (room.maxMembers) {
            const groupMembersRef = collection(db, "groupMembers");
            const membersQuery = query(
              groupMembersRef,
              where("roomId", "==", doc.id),
            );
            const membersSnapshot = await getDocs(membersQuery);
            const currentMembersCount = membersSnapshot.size;
            if (
              currentMembersCount >= room.maxMembers ||
              joinedRoomIds.includes(doc.id)
            ) {
              continue;
            }
          }
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
      if (!user?.uid) return;

      // Step 1: Fetch the rooms the user has already joined
      const joinedRoomsQuery = query(
        collection(db, "groupMembers"),
        where("userId", "==", user.uid),
      );
      const joinedRoomsSnapshot = await getDocs(joinedRoomsQuery);
      const joinedRoomIds = joinedRoomsSnapshot.docs.map(
        (doc) => doc.data().roomId,
      );

      // Step 2: Fetch rooms (either online or offline depending on filter)
      let q;
      if (isOnlineFilter) {
        q = query(collection(db, "rooms"), where("isOnline", "==", true));
      } else {
        q = query(collection(db, "rooms"), where("isOnline", "==", false));
      }

      const querySnapshot = await getDocs(q);
      let rooms: RoomWithId[] = [];
      querySnapshot.forEach((doc) => {
        const room = doc.data() as RoomWithId;

        // Filter out rooms that the user is already in
        if (!joinedRoomIds.includes(doc.id)) {
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
        }
      });

      // Step 3: Apply location-based filtering and sorting (if not online)
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
            room["distance"] = distance;
            return distance <= locationRange;
          })
          .sort((a, b) => {
            return sortOrder === "closest"
              ? a.distance! - b.distance!
              : b.distance! - a.distance!;
          });
      }

      setResults(rooms);
    } catch (error) {
      toast.error("Error searching rooms");
    }
  };

  const joinGroup = async (roomId: string, maxMembers?: number) => {
    if (!user?.uid) return;
    setOpen(false);
    try {
      const groupMembersRef = collection(db, "groupMembers");
      const membersQuery = query(
        groupMembersRef,
        where("roomId", "==", roomId),
      );
      const membersSnapshot = await getDocs(membersQuery);
      const currentMembersCount = membersSnapshot.size;

      if (maxMembers && currentMembersCount >= maxMembers) {
        toast.error("The group is full. Unable to join.");
        return;
      }

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

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isOnlineFilter}
                  onChange={(e) => setIsOnlineFilter(e.target.checked)}
                />
              }
              label="Online"
            />
          </Grid>

          {!isOnlineFilter && (
            <>
              <Grid item xs={12}>
                <InputLabel>Distance (km)</InputLabel>
                <Slider
                  value={locationRange}
                  onChange={(event, value) => setLocationRange(value as number)}
                  valueLabelDisplay="on"
                  step={5}
                  min={0}
                  max={200}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography>Sort by:</Typography>
                <ToggleButtonGroup
                  value={sortOrder}
                  exclusive
                  onChange={(event, newOrder) => {
                    if (newOrder !== null) setSortOrder(newOrder);
                  }}
                  aria-label="Sort by"
                >
                  <ToggleButton value="closest" aria-label="Closest">
                    Closest
                  </ToggleButton>
                  <ToggleButton value="farthest" aria-label="Farthest">
                    Farthest
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid>
            </>
          )}

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

          <Grid item xs={12}>
            <Typography variant="h6" style={{ marginTop: "20px" }}>
              Results {results.length ? `(${results.length})` : ""}
            </Typography>
            {results.length === 0 ? (
              <Typography>No results found</Typography>
            ) : (
              results.map((room) => (
                <Card key={room.id} style={{ marginBottom: "10px" }}>
                  <CardContent>
                    <Typography variant="h6">{room.roomTitle}</Typography>
                    <Typography variant="body2">{room.description}</Typography>
                    <Typography variant="body2">
                      {room.isOnline
                        ? "Online"
                        : `Distance: ${room.distance?.toFixed(2)} km`}
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
              ))
            )}
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default GroupSearchModal;
