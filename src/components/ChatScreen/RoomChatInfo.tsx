import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import GroupIcon from "@mui/icons-material/Group";
import { useAuthState } from "react-firebase-hooks/auth";
import { Room } from "../../types/models";
import { toast } from "react-toastify";

const RoomChatInfo: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>(); // Get the roomId from the URL params
  const [user] = useAuthState(auth);
  const [roomData, setRoomData] = useState<Room | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoomInfo = async () => {
      try {
        if (roomId) {
          const docRef = doc(db, "rooms", roomId);
          const docSnapshot = await getDoc(docRef);

          if (docSnapshot.exists()) {
            setRoomData(docSnapshot.data() as Room);
          } else {
            toast.error("Room not found");
          }
        }
      } catch (error) {
        console.error("Error fetching room data:", error);
      }
    };

    fetchRoomInfo();
  }, [roomId]);

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  const handleEditRoom = () => {
    if (roomData && user?.uid === roomData.adminId) {
      navigate(`/room/${roomId}/edit`); // Navigate to the room edit page
    }
  };

  return (
    <Box
      className="room-chat-info-page"
      sx={{ padding: 4, maxWidth: "900px", margin: "0 auto" }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <IconButton onClick={handleBack}>
          <ArrowBackIcon sx={{ fontSize: 28 }} />
        </IconButton>
        <Typography variant="h5" fontWeight="bold">
          Room Information
        </Typography>
        {roomData?.adminId === user?.uid && (
          <Tooltip title="Edit Room" arrow>
            <IconButton onClick={handleEditRoom}>
              <EditIcon sx={{ fontSize: 28 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {roomData ? (
        <Card
          sx={{
            borderRadius: "16px",
            boxShadow: 3,
            p: 3,
            backgroundColor: "#f9f9f9",
          }}
        >
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {roomData.roomTitle}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {roomData.roomCategory}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={2}>
                <GroupIcon color="primary" />
                <Typography variant="body1">
                  {roomData.maxMembers || "Unlimited"} Max Members
                </Typography>
              </Box>
            </Box>

            {roomData.location && (
              <Box display="flex" alignItems="center" mb={2}>
                <LocationOnIcon color="secondary" />
                <Typography variant="body1" ml={1}>
                  {roomData.location.display_name}
                </Typography>
              </Box>
            )}

            {roomData.description && (
              <Box mb={2}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Description:
                </Typography>
                <Typography variant="body1">{roomData.description}</Typography>
              </Box>
            )}

            {roomData.meetingFrequency && (
              <Box mb={2}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Meeting Frequency:
                </Typography>
                <Typography variant="body1">
                  {roomData.meetingFrequency}
                </Typography>
              </Box>
            )}

            {roomData.groupRules && (
              <Box mb={2}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Group Rules:
                </Typography>
                <Typography variant="body1">{roomData.groupRules}</Typography>
              </Box>
            )}

            {roomData.additionalDataLink && (
              <Box mb={2}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Additional Data:
                </Typography>
                <Button
                  href={roomData.additionalDataLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  color="primary"
                >
                  View Medical Data
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      ) : (
        <Typography>Loading room information...</Typography>
      )}
    </Box>
  );
};

export default RoomChatInfo;
