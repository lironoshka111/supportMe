import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControlLabel,
  Link,
  Modal,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { addDoc, collection } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import GeneticDiseaseSearch, { diseaseDetails } from "./GeneticDiseaseSearch";
import { useAuthState } from "react-firebase-hooks/auth";
import { useAppContext } from "../redux/Context";

interface GroupFormModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface ValidationErrors {
  diseaseDetails?: string;
  description?: string;
  maxParticipants?: string;
  location?: string;
  contactNumber?: string;
}

const GroupFormModal: React.FC<GroupFormModalProps> = ({ open, setOpen }) => {
  const [user] = useAuthState(auth);
  const [maxParticipants, setMaxParticipants] = useState(1);
  const [location, setLocation] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [contactNumber, setContactNumber] = useState("");
  const [description, setDescription] = useState("");
  const [diseaseDetails, setDiseaseDetails] = useState<diseaseDetails>();
  const navigate = useNavigate();
  const { setSelectedRoom } = useAppContext();
  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    if (diseaseDetails?.name && open) {
      setDescription(
        `This group is for people who have ${diseaseDetails?.name}. The group is for sharing information and support. Please join if you have ${diseaseDetails?.name}.`,
      );
    }
  }, [diseaseDetails?.name]);

  const handleSave = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    await addChannel();
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const resetForm = () => {
    setMaxParticipants(1);
    setLocation("");
    setIsOnline(true);
    setContactNumber("");
    setDescription("");
    setDiseaseDetails(undefined);
    setErrors({});
  };

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  const validateForm = (): ValidationErrors => {
    const errors: ValidationErrors = {};

    if (!diseaseDetails?.name) {
      errors.diseaseDetails = "Disease details must contain a valid name";
    }

    if (description.split(" ").length < 2) {
      errors.description = "Description must be at least 10 words.";
    }

    if (!maxParticipants || maxParticipants <= 0) {
      errors.maxParticipants =
        "Max number of participants must be a positive number.";
    }

    if (!isOnline && !location) {
      errors.location = "Location is required for offline events.";
    }

    // if (!contactNumber) {
    //   errors.contactNumber = "Contact number is required.";
    // }

    return errors;
  };

  const addChannel = async () => {
    const roomRef = await addDoc(collection(db, "rooms"), {
      roomTitle: diseaseDetails?.name,
      additionalDataLink: diseaseDetails?.link,
      maxMembers: maxParticipants,
      location,
      isOnline,
      contactNumber,
      description,
      adminId: user?.uid,
    });

    // Add the user who created the room as a member in the groupMembers collection
    await addDoc(collection(db, "groupMembers"), {
      userId: user?.uid,
      roomId: roomRef.id,
      isFavorite: false,
      isAnonymous: false,
      nickname: user?.displayName,
      avatar: user?.photoURL,
    });

    setSelectedRoom({
      id: roomRef.id as string,
      title: diseaseDetails?.name as string,
      linkToData: diseaseDetails?.link,
      favorite: false,
    });
    navigate(`/room/${roomRef.id}`); // Navigate to the newly created rooms
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
          error={!!errors.maxParticipants}
          helperText={errors.maxParticipants}
        />

        <TextField
          multiline
          fullWidth
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin="normal"
          error={!!errors.description}
          helperText={errors.description}
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
              error={!!errors.location}
              helperText={errors.location}
            />
            <TextField
              fullWidth
              label="Contact Number"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              margin="normal"
              error={!!errors.contactNumber}
              helperText={errors.contactNumber}
            />
          </div>
        )}

        {diseaseDetails?.link && (
          <Typography mt={2}>
            <Link
              href={diseaseDetails.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              More information about {diseaseDetails.name}
            </Link>
          </Typography>
        )}

        <Box mt={2}>
          {errors.diseaseDetails && (
            <Typography color="error" variant="body2">
              {errors.diseaseDetails}
            </Typography>
          )}
        </Box>

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
