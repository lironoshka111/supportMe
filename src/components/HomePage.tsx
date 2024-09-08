import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { colors } from "../theme/colors";

const HomePage = () => {
  const navigate = useNavigate();

  const handleCreateNewChat = () => {
    navigate("/create-chat");
  };

  const handleFindChat = () => {
    navigate("/find-chat");
  };

  const handleGoToAboutPage = () => {
    navigate("/about");
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      bgcolor={colors.primary.lightCream}
    >
      <Typography variant="h3" mb={4} color={colors.text.black}>
        Welcome to the Support Group
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleCreateNewChat}
        sx={{ mb: 2, bgcolor: colors.button.teal }}
      >
        Create New Chat
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={handleFindChat}
        sx={{ mb: 2, bgcolor: colors.button.teal }}
      >
        Find Chat
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={handleGoToAboutPage}
        sx={{ bgcolor: colors.button.teal }}
      >
        Go to About Page
      </Button>
    </Box>
  );
};

export default HomePage;
