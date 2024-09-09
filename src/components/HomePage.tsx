import React, { lazy, Suspense, useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
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

// Lazy load the AboutPage component
const AboutPage = lazy(() => import("../components/AboutPage"));

// Analytics Data Interface
interface AnalyticsData {
  name: string;
  messagesPerDay: { date: string; count: number }[];
}

type RoomWithId = Room & { id: string };

const HomePage: React.FC = () => {
  const [user] = useAuthState(auth);
  const [adminChannels, setAdminChannels] = useState<RoomWithId[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<RoomWithId | null>(null); // Stores the group to edit
  const [isModalOpen, setIsModalOpen] = useState(false); // Manages the modal state
  const [showAboutPage, setShowAboutPage] = useState(false); // Manage About Page visibility
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const { setNewRoomModalOpen, setGroupSearchModalOpen } = useAppContext();
  const navigate = useNavigate();

  // Fetch channels where the user is an admin
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

  // Fetch messages and aggregate them per day
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

  const handleNavigateToChannel = (roomId: string) => {
    navigate(`/room/${roomId}`);
  };

  // Trigger the modal to edit a group
  const handleEditGroup = (group: RoomWithId) => {
    setSelectedGroup(group); // Set the group to be edited
    setIsModalOpen(true); // Open the modal
  };

  // Toggle About Page visibility
  const handleShowAboutPage = () => {
    setShowAboutPage(!showAboutPage);
  };

  console.log("HomePage rendered", { adminChannels, analyticsData });

  return (
    <Box className="flex flex-col grow-0">
      {" "}
      {/* Ensure the box takes full height */}
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

                    {/* Channel Analytics Graph */}
                    <Box className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={
                            analyticsData.find(
                              (a) => a.name === channel.roomTitle,
                            )?.messagesPerDay || []
                          }
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
                    </Box>

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
    </Box>
  );
};

export default HomePage;
