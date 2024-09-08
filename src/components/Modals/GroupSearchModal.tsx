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
  const [locationRange, setLocationRange] = useState<number>(0);

  useEffect(() => {
    if (title) {
      setSearchTerm(title);
    }
  }, [title]);

  useEffect(() => {
    // Fetch room titles for autocomplete
    const fetchRoomTitles = async () => {
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
      console.log(roomTitles);
      setAutocompleteOptions(roomTitles);
    };

    fetchRoomTitles();
  }, []);

  const handleSearch = async () => {
    const constraints = [
      where("roomTitle", ">=", searchTerm),
      where("roomTitle", "<=", searchTerm + "\uf8ff"),
    ];

    if (locationRange) {
      // constraints.push(where("location", "==", locationFilter));
    }

    if (isOnlineFilter) {
      constraints.push(where("isOnline", "==", true));
    }

    const q = query(collection(db, "rooms"), ...constraints);

    const querySnapshot = await getDocs(q);
    const rooms: Room[] = [];
    querySnapshot.forEach((doc) => {
      rooms.push({ ...doc.data(), id: doc.id } as RoomWithId);
    });
    setResults(rooms as RoomWithId[]);
  };

  const joinGroup = async (roomId: string) => {
    if (!user?.uid) return;
    try {
      setOpen(false);
      const groupMemberRef = collection(db, "groupMembers");
      const newGroupMember: GroupMember = {
        userId: user.uid ?? "",
        roomId: roomId,
        isFavorite: false,
      };

      // Add the new group member
      await addDoc(groupMemberRef, newGroupMember);

      toast.success("Joined the group successfully!");
    } catch (error) {
      console.error("Error joining the group: ", error);
      toast.error("Failed to join the group.");
    }
  };

  return (
    <div>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <div className="flex justify-between p-1">
          <DialogTitle>Search Groups</DialogTitle>
          <div>
            <IconButton onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </div>
        </div>
        <DialogContent>
          <Autocomplete
            freeSolo
            options={autocompleteOptions}
            value={searchTerm}
            onInputChange={(event, newInputValue) => {
              setSearchTerm(newInputValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search by Title"
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
          {!isOnlineFilter && (
            <div className="flex w-full gap-1 mt-4">
              <InputLabel>Location</InputLabel>
              <div className="flex flex-grow">
                <Slider
                  value={locationRange}
                  onChange={(event, value) => setLocationRange(value as number)}
                  aria-labelledby="gap-slider"
                  valueLabelDisplay="on"
                  step={5}
                  marks
                  min={0}
                  max={200}
                />
              </div>
            </div>
          )}
          <div style={{ marginTop: "20px" }}>
            {results?.map((room) => (
              <Card key={room.roomTitle} style={{ marginBottom: "10px" }}>
                <CardContent>
                  <Typography variant="h6">{room.roomTitle}</Typography>
                  <Typography>{room.description}</Typography>
                  <Typography>{room.location?.display_name}</Typography>
                  <Button
                    variant="contained"
                    onClick={() => joinGroup(room.id)}
                  >
                    Join Group
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GroupSearchModal;
