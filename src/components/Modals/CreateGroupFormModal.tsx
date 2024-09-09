import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  Link,
  MenuItem,
  Modal,
  Select,
  Slider,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
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
import { toast } from "react-toastify";

interface GroupFormModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  groupData?: any; // Optional group data for edit mode
}

interface ValidationErrors {
  diseaseDetails?: string;
  description?: string;
  maxParticipants?: string;
  location?: string;
  contactNumber?: string;
  groupTitle?: string;
  meetingUrl?: string;
  meetingFrequency?: string;
  groupRules?: string;
}

const CreateGroupFormModal: React.FC<GroupFormModalProps> = ({
  open,
  setOpen,
  groupData, // Pass this to enable edit functionality
}) => {
  const [user] = useAuthState(auth);
  const [groupTitle, setGroupTitle] = useState(groupData?.roomTitle || "");
  const [maxParticipants, setMaxParticipants] = useState(
    groupData?.maxMembers || 100,
  ); // default value
  const [location, setLocation] = useState<NominatimSuggestion | undefined>(
    groupData?.location || undefined,
  );
  const [isOnline, setIsOnline] = useState(groupData?.isOnline || true);
  const [contactNumber, setContactNumber] = useState(
    groupData?.contactNumber || "",
  );
  const [description, setDescription] = useState(groupData?.description || "");
  const [diseaseDetails, setDiseaseDetails] = useState<
    diseaseDetails | undefined
  >(groupData?.diseaseDetails || undefined);
  const [meetingUrl, setMeetingUrl] = useState(
    groupData?.meetingUrl || "https://zoom.us/",
  );
  const [meetingFrequency, setMeetingFrequency] = useState<string>(
    groupData?.meetingFrequency || "weekly",
  );
  const [groupRules, setGroupRules] = useState(
    groupData?.groupRules ||
      "Confidentiality – Keep it private.\n" +
        "Respect – Be kind, no judgment.\n" +
        "Stay on Topic – Keep discussions relevant.\n" +
        "No Harassment – No trolling or abuse.\n" +
        "Optional Sharing – Share if you want, no pressure.\n" +
        "No Professional Advice – No medical or legal advice.\n" +
        "Trigger Warnings – Flag sensitive content.\n" +
        "No Ads – No promotions allowed.",
  );
  const navigate = useNavigate();
  const { setSelectedRoom } = useAppContext();
  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    if (groupTitle && open && !groupData) {
      setDescription(
        `This group is for people who have ${groupTitle}. The group is for sharing information and support. Please join if you have ${groupTitle}.`,
      );
    }
  }, [groupTitle, open, groupData]);

  const handleSave = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setOpen(false);
    try {
      if (groupData) {
        await updateChannel(); // Update if groupData is passed (Edit Mode)
      } else {
        await addChannel(); // Create new if no groupData (Create Mode)
      }
    } catch (error) {
      toast.error("Error saving group");
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const resetForm = () => {
    setGroupTitle("");
    setMaxParticipants(100);
    setLocation(undefined);
    setIsOnline(true);
    setContactNumber("");
    setDescription("");
    //   setDiseaseDetails(undefined);
    setMeetingUrl("https://zoom.us/");
    setMeetingFrequency("weekly");
    setGroupRules(
      "Confidentiality – Keep it private.\n" +
        "Respect – Be kind, no judgment.\n" +
        "Stay on Topic – Keep discussions relevant.\n" +
        "No Harassment – No trolling or abuse.\n" +
        "Optional Sharing – Share if you want, no pressure.\n" +
        "No Professional Advice – No medical or legal advice.\n" +
        "Trigger Warnings – Flag sensitive content.\n" +
        "No Ads – No promotions allowed.",
    );
    setErrors({});
  };

  useEffect(() => {
    if (open && !groupData) {
      resetForm(); // Only reset the form if no groupData (Create Mode)
    }
  }, [open, groupData]);

  const validateForm = (): ValidationErrors => {
    const errors: ValidationErrors = {};

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

    if (!meetingFrequency) {
      errors.meetingFrequency = "Meeting frequency is required.";
    }

    if (!groupRules) {
      errors.groupRules = "Group rules are required.";
    }

    return errors;
  };

  const rulesMaxLength = 1000;

  const addChannel = async () => {
    const roomData: any = {
      roomTitle: diseaseDetails?.name || groupTitle,
      roomCategory: diseaseDetails?.name || groupTitle, // Set room category as disease name
      additionalDataLink:
        diseaseDetails?.link ??
        `https://vsearch.nlm.nih.gov/vivisimo/cgi-bin/query-meta?v%3Aproject=medlineplus&v%3Asources=medlineplus-bundle&query=${diseaseDetails?.name}`,
      maxMembers: maxParticipants,
      isOnline,
      contactNumber,
      description,
      meetingUrl,
      meetingFrequency,
      groupRules,
      adminId: user?.uid,
    };

    // Conditionally add 'location' only if the group is offline
    if (!isOnline && location) {
      roomData.location = location; // Set location only when the group is offline
    }

    const roomRef = await addDoc(collection(db, "rooms"), roomData);

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
      title: diseaseDetails?.name || groupTitle,
      linkToData: diseaseDetails?.link,
      favorite: false,
    });

    navigate(`/room/${roomRef.id}`, { replace: true });
    resetForm();
  };

  const updateChannel = async () => {
    const roomRef = doc(db, "rooms", groupData?.id); // Reference to the existing room
    const roomData: any = {
      roomTitle: diseaseDetails?.name || groupTitle,
      roomCategory: diseaseDetails?.name || groupTitle,
      additionalDataLink:
        diseaseDetails?.link ??
        `https://vsearch.nlm.nih.gov/vivisimo/cgi-bin/query-meta?v%3Aproject=medlineplus&v%3Asources=medlineplus-bundle&query=${diseaseDetails?.name}`,
      maxMembers: maxParticipants,
      isOnline,
      contactNumber,
      description,
      meetingUrl,
      meetingFrequency,
      groupRules,
      adminId: user?.uid,
    };

    if (!isOnline && location) {
      roomData.location = location;
    }

    await updateDoc(roomRef, roomData);

    setSelectedRoom({
      id: groupData?.id as string,
      title: diseaseDetails?.name || groupTitle,
      linkToData: diseaseDetails?.link,
      favorite: false,
    });

    navigate(`/room/${groupData?.id}`, { replace: true });
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
          {groupData ? `Edit Group: ${groupTitle}` : "Create New Group"}
        </Typography>

        <Grid container spacing={2}>
          {!groupData && (
            <Grid item xs={12}>
              <GeneticDiseaseSearch
                setDiseaseDetails={(name) => {
                  setDiseaseDetails(name);
                  setGroupTitle(name?.name ?? "");
                }}
              />
            </Grid>
          )}

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
            <FormControl fullWidth>
              <InputLabel id="meeting-frequency-label">
                Meeting Frequency
              </InputLabel>
              <Select
                labelId="meeting-frequency-label"
                value={meetingFrequency}
                label="Meeting Frequency"
                onChange={(e) => setMeetingFrequency(e.target.value)}
              >
                <MenuItem value="weekly">Once a week</MenuItem>
                <MenuItem value="biweekly">Once every two weeks</MenuItem>
                <MenuItem value="monthly">Once a month</MenuItem>
              </Select>
            </FormControl>
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
            <TextField
              rows={5}
              multiline
              fullWidth
              label="Group Rules"
              value={groupRules}
              onChange={(e) =>
                e.target.value.length <= rulesMaxLength &&
                setGroupRules(e.target.value)
              }
              margin="normal"
              error={!!errors.groupRules}
              helperText={
                errors.groupRules ||
                `${rulesMaxLength - groupRules.length} characters left`
              }
            />
          </Grid>

          <Grid item xs={12} display="flex" justifyContent="space-between">
            <Button variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleSave}>
              {groupData ? "Update Group" : "Create Group"}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default CreateGroupFormModal;
