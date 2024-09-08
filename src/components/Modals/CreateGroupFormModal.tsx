import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControlLabel,
  Grid,
  IconButton,
  Link,
  Modal,
  Slider,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { addDoc, collection } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import GeneticDiseaseSearch, {
  diseaseDetails,
} from "../utilities/GeneticDiseaseSearch";
import { useAuthState } from "react-firebase-hooks/auth";
import { useAppContext } from "../../redux/Context";
import LocationAutocomplete, {
  NominatimSuggestion,
} from "../utilities/LocationAutocomplete";
import CloseIcon from "@mui/icons-material/Close";

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
  groupTitle?: string;
  meetingUrl?: string;
}

const CreateGroupFormModal: React.FC<GroupFormModalProps> = ({
  open,
  setOpen,
}) => {
  const [user] = useAuthState(auth);
  const [groupTitle, setGroupTitle] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(100); // default value
  const [location, setLocation] = useState<NominatimSuggestion>();
  const [isOnline, setIsOnline] = useState(true);
  const [contactNumber, setContactNumber] = useState("");
  const [description, setDescription] = useState("");
  const [diseaseDetails, setDiseaseDetails] = useState<diseaseDetails>();
  const [meetingUrl, setMeetingUrl] = useState("");
  const navigate = useNavigate();
  const { setSelectedRoom } = useAppContext();
  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    if (diseaseDetails?.name && open) {
      setDescription(
        `This group is for people who have ${diseaseDetails?.name}. The group is for sharing information and support. Please join if you have ${diseaseDetails?.name}.`,
      );
    }
  }, [diseaseDetails?.name, open]);

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
    setMaxParticipants(100);
    setLocation(undefined);
    setIsOnline(true);
    setContactNumber("");
    setDescription("");
    setDiseaseDetails(undefined);
    setMeetingUrl("");
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

    if (description.split(" ").length < 10) {
      errors.description = "Description must be at least 10 words.";
    }

    if (!maxParticipants || maxParticipants <= 0) {
      errors.maxParticipants =
        "Max number of participants must be a positive number.";
    }

    if (!isOnline && !location) {
      errors.location = "Location is required for offline events.";
    }

    if (!groupTitle) {
      errors.groupTitle = "Group Title is required";
    }

    if (isOnline && !meetingUrl) {
      errors.meetingUrl = "Meeting URL is required for online groups.";
    }

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
      meetingUrl,
      adminId: user?.uid,
    });

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
    navigate(`/room/${roomRef.id}`);
    resetForm();
  };

  return (
    <Modal open={open} onClose={handleCancel}>
      <Box
        className="rounded-lg"
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90vw", sm: "60vw", md: "50vw" },
          maxHeight: "90vh",
          overflowY: "auto",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
        }}
      >
        <IconButton
          onClick={handleCancel}
          sx={{ position: "absolute", top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h6" component="h2">
          Create New Group
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <GeneticDiseaseSearch
              setDiseaseDetails={(name) => {
                setDiseaseDetails(name);
                setGroupTitle(name?.name ?? "");
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Group Title"
              value={groupTitle}
              onChange={(e) => setGroupTitle(e.target.value)}
              margin="normal"
              error={!!errors.groupTitle}
              helperText={errors.groupTitle}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography color="secondary" gutterBottom>
              Max Number of Participants
            </Typography>
            <Slider
              value={maxParticipants}
              onChange={(e, value) => setMaxParticipants(value as number)}
              valueLabelDisplay="on"
              step={5}
              marks={[
                {
                  value: 5,
                  label: "5",
                },
                {
                  value: 100,
                  label: "100",
                },
              ]}
              min={5}
              max={100}
              aria-labelledby="max-participants-slider"
            />
          </Grid>

          <Grid item xs={12}>
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
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={isOnline}
                  onChange={(e) => setIsOnline(e.target.checked)}
                />
              }
              label="Online"
            />
          </Grid>

          {isOnline ? (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meeting URL"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                margin="normal"
                error={!!errors.meetingUrl}
                helperText={errors.meetingUrl}
              />
            </Grid>
          ) : (
            <>
              <Grid item xs={12}>
                <LocationAutocomplete
                  onSelect={(location) => setLocation(location)}
                  error={errors.location}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Contact Number"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  margin="normal"
                  error={!!errors.contactNumber}
                  helperText={errors.contactNumber}
                />
              </Grid>
            </>
          )}

          {diseaseDetails?.link && (
            <Grid item xs={12}>
              <Typography mt={2}>
                <Link
                  href={diseaseDetails.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  More information about {diseaseDetails.name}
                </Link>
              </Typography>
            </Grid>
          )}

          <Grid item xs={12}>
            {errors.diseaseDetails && (
              <Typography color="error" variant="body2">
                {errors.diseaseDetails}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} display="flex" justifyContent="space-between">
            <Button variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleSave}>
              Save
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default CreateGroupFormModal;
