import React, { lazy, Suspense, useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { Room } from "../types/models";
import { useAppContext } from "../redux/Context";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import CreateGroupFormModal from "./Modals/CreateGroupFormModal";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { deleteRoom } from "./utilities/firebaseUtils";

// Lazy load the AboutPage component
const AboutPage = lazy(() => import("../components/AboutPage"));

interface AnalyticsData {
  name: string;
  messagesPerDay: { date: string; count: number }[];
}

type RoomWithId = Room & { id: string };

const HomePage: React.FC = () => {
  const [user] = useAuthState(auth);
  const [adminChannels, setAdminChannels] = useState<RoomWithId[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<RoomWithId | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAboutPage, setShowAboutPage] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const { setNewRoomModalOpen, setGroupSearchModalOpen, setSelectedRoom } =
    useAppContext();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // For delete dialog
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null); // Room to be deleted

  useEffect(() => {
    const fetchAdminChannels = async () => {
      if (!user) return;

      const adminChannelsQuery = query(
        collection(db, "rooms"),
        where("adminId", "==", user.uid),
      );

      const channelDocs = await getDocs(adminChannelsQuery);
      const channels: RoomWithId[] = [];

      channelDocs.forEach((doc) => {
        if (doc.data()?.roomTitle)
          channels.push({ ...doc.data(), id: doc.id } as RoomWithId);
      });
      setAdminChannels(channels);
      fetchMessagesForRooms(channels);
    };

    fetchAdminChannels();
  }, [user]);

  const fetchMessagesForRooms = async (rooms: RoomWithId[]) => {
    const analytics: AnalyticsData[] = [];

    for (const room of rooms) {
      const messagesQuery = query(collection(db, `rooms/${room.id}/messages`));

      const messageDocs = await getDocs(messagesQuery);
      const messageCounts: { [key: string]: number } = {};

      messageDocs.forEach((doc) => {
        const message = doc.data();
        const date = dayjs(message.sentTimestamp).format("YYYY-MM-DD");
        if (!messageCounts[date]) {
          messageCounts[date] = 0;
        }
        messageCounts[date] += 1;
      });

      const messagesPerDay = Object.keys(messageCounts).map((date) => ({
        date,
        count: messageCounts[date],
      }));

      analytics.push({
        name: room.roomTitle,
        messagesPerDay,
      });
    }

    setAnalyticsData(analytics);
  };

  const handleDeleteRoom = async () => {
    if (!roomToDelete) return;

    try {
      await deleteRoom(roomToDelete);

      setAdminChannels((prevChannels) =>
        prevChannels.filter((channel) => channel.id !== roomToDelete),
      );
      setRoomToDelete(null);
      setDeleteDialogOpen(false);
      toast.success("Room deleted successfully");
    } catch (error) {
      toast.error("Failed to delete the room. Please try again.");
    }
  };

  const handleNavigateToChannel = (roomId: string) => {
    navigate(`/room/${roomId}`);
  };

  const handleEditGroup = (group: RoomWithId) => {
    setSelectedGroup(group);
    setIsModalOpen(true);
  };

  const handleShowAboutPage = () => {
    setShowAboutPage(!showAboutPage);
  };

  const handleOpenDeleteDialog = (roomId: string) => {
    setRoomToDelete(roomId);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setRoomToDelete(null);
  };

  const findMessagePerDay = (roomTitle: string) => {
    return (
      analyticsData.find((a) => a.name === roomTitle)?.messagesPerDay || []
    );
  };

  return (
    <Box className="flex flex-col grow-0">
      {/* Header */}
      <Box className="flex flex-col items-center justify-center gap-2 mb-4">
        <img
          src={"/images/logo.png"}
          alt="Support Logo"
          className="h-[50vh] w-[50vh] rounded-full"
        />
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          className="font-bold"
        >
          Dashboard
        </Typography>
      </Box>

      {/* User Panel - Quick Actions */}
      <Box className="flex justify-center gap-4 my-10">
        <Button
          variant="contained"
          color="primary"
          onClick={() => setNewRoomModalOpen(true)}
        >
          Create New Channel
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => setGroupSearchModalOpen(true)}
        >
          Join a Channel
        </Button>
        <Button variant="contained" color="info" onClick={handleShowAboutPage}>
          About
        </Button>
      </Box>

      {/* Managed Channels Section */}
      <Box className="mt-8 flex-grow">
        <Typography
          variant="h5"
          align="center"
          gutterBottom
          className="font-semibold"
        >
          Managed Channels
        </Typography>

        {/* Empty state when there are no managed channels */}
        {adminChannels.length === 0 ? (
          <Paper elevation={3} className="p-6 text-center">
            <Typography variant="h6">You have no managed channels</Typography>
            <Typography className="text-gray-500">
              Create or join a channel to get started.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {adminChannels.map((channel: RoomWithId) => (
              <Grid item xs={12} sm={6} md={4} key={channel.id}>
                <Card className="shadow-lg">
                  <CardContent className="p-4">
                    <Typography variant="h6" className="font-semibold">
                      {channel.roomTitle}
                    </Typography>
                    <Typography className="text-gray-600 mb-4">
                      {channel.description}
                    </Typography>

                    <div className="h-40 flex w-full justify-center mt-5">
                      {findMessagePerDay(channel.roomTitle) &&
                      findMessagePerDay(channel.roomTitle).length === 0 ? (
                        <Typography variant="h6" className="text-gray-500">
                          No messages sent yet
                        </Typography>
                      ) : (
                        <ResponsiveContainer
                          width="100%"
                          height="100%"
                          className="flex justify-center items-center w-full"
                        >
                          <LineChart
                            data={findMessagePerDay(channel.roomTitle)}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="count"
                              stroke="#8884d8"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                    <div className="flex w-full justify-between">
                      {/* Edit button */}
                      <IconButton
                        color="primary"
                        onClick={() => handleEditGroup(channel)}
                        aria-label="edit"
                        size="small"
                        sx={{ mb: 2 }}
                      >
                        <EditIcon fontSize="small" /> Edit
                      </IconButton>

                      {/* Delete button */}
                      <IconButton
                        color="secondary"
                        onClick={() => handleOpenDeleteDialog(channel.id)}
                        aria-label="delete"
                        size="small"
                        sx={{ mb: 2 }}
                      >
                        <DeleteIcon fontSize="small" /> Delete
                      </IconButton>
                    </div>

                    {/* Manage button */}
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={() => handleNavigateToChannel(channel.id)}
                      className="mt-4"
                    >
                      Manage Channel
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Edit Group Modal */}
      {isModalOpen && (
        <CreateGroupFormModal
          open={isModalOpen}
          setOpen={setIsModalOpen}
          groupData={selectedGroup} // Pass the selected group for editing
        />
      )}

      {/* About Page Section */}
      {showAboutPage && (
        <Box className="mt-10">
          <Suspense fallback={<div>Loading About Page...</div>}>
            <AboutPage />
          </Suspense>
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Delete Room"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this room? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteRoom} color="secondary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HomePage;
