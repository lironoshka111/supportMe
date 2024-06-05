// GroupFormModal.tsx

import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
} from "@mui/material";

interface GroupFormModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const GroupFormModal: React.FC<GroupFormModalProps> = ({ open, setOpen }) => {
  const [groupName, setGroupName] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(1);
  const [location, setLocation] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [contactNumber, setContactNumber] = useState("");
  const [description, setDescription] = useState("");
  const handleSave = () => {
    // Handle save logic here
    console.log({
      groupName,
      maxParticipants,
      location,
      isOnline,
      contactNumber,
    });
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
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
        <TextField
          fullWidth
          label="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          margin="normal"
        />
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
