import React, { lazy, Suspense, useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { Room } from "../types/models";
import { useAppContext } from "../redux/Context";

// Lazy load the AboutPage component
const AboutPage = lazy(() => import("../components/AboutPage"));

// Analytics Data Interface
interface AnalyticsData {
  name: string;
  messages: number;
  participants: number;
}

type RoomWithId = Room & { id: string };

const HomePage: React.FC = () => {
  const [user] = useAuthState(auth);
  const [adminChannels, setAdminChannels] = useState<RoomWithId[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const { setNewRoomModalOpen, setGroupSearchModalOpen } = useAppContext();
  const [showAboutPage, setShowAboutPage] = useState(false);
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
        channels.push({ ...doc.data(), id: doc.id } as RoomWithId);
      });
      setAdminChannels(channels);

      // Mock analytics data based on channels
      const analytics = channels.map((channel) => ({
        name: channel.roomTitle,
        messages: Math.floor(Math.random() * 100), // Placeholder for actual data
        participants: channel.maxMembers || 0,
      }));
      setAnalyticsData(analytics);
    };

    fetchAdminChannels();
  }, [user]);

  const handleNavigateToChannel = (roomId: string) => {
    navigate(`/room/${roomId}`);
  };

  const handleShowAboutPage = () => {
    setShowAboutPage(true);
  };

  return (
    <Box className="p-6">
      {/* Header */}
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        className="font-bold"
      >
        Dashboard
      </Typography>

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
      </Box>

      {/* Overall Analytics Section */}
      <Box className="mt-6">
        <Typography
          variant="h5"
          align="center"
          gutterBottom
          className="font-semibold"
        >
          Overall Channel Analytics
        </Typography>
        <Box className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={analyticsData}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="messages" stroke="#8884d8" />
              <Line type="monotone" dataKey="participants" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      {/* Admin Channels Section */}
      <Box className="mt-8">
        <Typography
          variant="h5"
          align="center"
          gutterBottom
          className="font-semibold"
        >
          Managed Channels
        </Typography>
        <Grid container spacing={3}>
          {adminChannels.map((channel: RoomWithId) => (
            <Grid item xs={12} sm={6} md={4} key={channel.id}>
              <Card className="shadow-lg">
                <CardContent className="p-4">
                  {/* Display Image for the Channel */}
                  <Typography variant="h6" className="font-semibold">
                    {channel.roomTitle}
                  </Typography>
                  <Typography className="text-gray-600 mb-4">
                    {channel.description}
                  </Typography>

                  {/* Graph for each room */}
                  <Box className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={[
                          {
                            name: "Messages",
                            value: Math.floor(Math.random() * 100), // Placeholder
                          },
                          {
                            name: "Participants",
                            value: channel.maxMembers || 0,
                          },
                        ]}
                        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#8884d8"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>

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
      </Box>

      {/* Load About Page */}

      <Box className="mt-10">
        <Suspense fallback={<div>Loading About Page...</div>}>
          <AboutPage />
        </Suspense>
      </Box>
    </Box>
  );
};

export default HomePage;
