// GroupFormModal.tsx

import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { addDoc, collection } from "firebase/firestore";
import { auth, db } from "../firebase";
import { roomSelected } from "../redux/channelSlice";
import { useNavigate } from "react-router-dom";
import GeneticDiseaseSearch, { diseaseDetails } from "./GeneticDiseaseSearch";
import { useAuthState } from "react-firebase-hooks/auth";

interface GroupFormModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const GroupFormModal: React.FC<GroupFormModalProps> = ({ open, setOpen }) => {
  const [user] = useAuthState(auth);
  const [maxParticipants, setMaxParticipants] = useState(1);
  const [location, setLocation] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [contactNumber, setContactNumber] = useState("");
  const [description, setDescription] = useState("");
  const [diseaseDetails, setDiseaseDetails] = useState<diseaseDetails>();
  const navigate = useNavigate();
  const handleSave = () => {
    // Handle save logic here
    addChannel();
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const resetForm = () => {
    setMaxParticipants(1);
    setLocation("");
    setIsOnline(false);
    setContactNumber("");
    setDescription("");
    setDiseaseDetails(undefined);
  };

  const addChannel = async () => {
    const res = await addDoc(collection(db, "rooms"), {
      name: diseaseDetails?.name,
      link: diseaseDetails?.link,
      maxParticipants,
      location,
      isOnline,
      contactNumber,
      adminId: user?.uid,
    });
    roomSelected({
      id: res.id as string,
      title: diseaseDetails?.name as string,
    });
    navigate(`/room/${res.id}`); // Navigate to the newly created rooms
    debugger;
    resetForm();
  };

  return (
    <Modal open={open} onClose={handleCancel}>
      <Box
        sx={{
          position: "absolute" as "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography variant="h6" component="h2">
          Group Details
        </Typography>
        <GeneticDiseaseSearch setDiseaseDetails={setDiseaseDetails} />
        <TextField
          fullWidth
          label="Max Number of Participants"
          type="number"
          value={maxParticipants}
          onChange={(e) => setMaxParticipants(+e.target.value)}
          margin="normal"
        />
        <TextField
          multiline
          fullWidth
          label="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin="normal"
        />
        <FormControlLabel
          control={
            <Switch
              checked={isOnline}
              onChange={(e) => setIsOnline(e.target.checked)}
            />
          }
          label="Online"
        />
        {!isOnline && (
          <div className="flex flex-col">
            <TextField
              fullWidth
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              margin="normal"
              disabled={isOnline}
            />
            <TextField
              fullWidth
              label="Contact Number"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              margin="normal"
            />
          </div>
        )}
        <Box display="flex" justifyContent="space-between" mt={2}>
          <Button variant="outlined" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleSave}>
            Save
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default GroupFormModal;
