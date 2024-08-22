import React, { useState } from "react";
import {
  Modal,
  Box,
  TextField,
  Button,
  Avatar,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { updateProfile } from "firebase/auth";
import { User } from "firebase/auth";

interface UserSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

const dummyAvatars = [
  "https://api.dicebear.com/8.x/adventurer/svg?seed=Daisy",
  "https://api.dicebear.com/8.x/adventurer/svg?seed=Abby",
  "https://api.dicebear.com/8.x/adventurer/svg?seed=Sam",
  "https://api.dicebear.com/8.x/adventurer/svg?seed=Rocky",
  "https://api.dicebear.com/8.x/lorelei-neutral/svg?seed=Patches",
  "https://api.dicebear.com/8.x/open-peeps/svg?seed=Patches",
  "https://api.dicebear.com/8.x/pixel-art/svg?seed=Patches",
  "https://api.dicebear.com/8.x/thumbs/svg?seed=Miss%20kitty",
];

const UserSettings: React.FC<UserSettingsProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [nickname, setNickname] = useState<string>(user.displayName || "");
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(
    user.photoURL || dummyAvatars[0],
  );
  const [loading, setLoading] = useState<boolean>(false);

  const handleNicknameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(event.target.value);
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await updateProfile(user, {
        displayName: nickname,
        photoURL: selectedAvatar,
      });
      // Optionally, trigger any state updates or notifications here
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="user-settings-modal"
      aria-describedby="user-settings-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 300, // Reduced width
          height: "auto", // Adjust height
          maxHeight: "80vh", // Ensure it doesn't exceed viewport height
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          overflowY: "auto", // Enable scrolling if content overflows
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" id="user-settings-modal" sx={{ mb: 2 }}>
          User Settings
        </Typography>
        <TextField
          fullWidth
          label="Nickname"
          value={nickname}
          onChange={handleNicknameChange}
          margin="normal"
          sx={{ mb: 2 }}
        />
        <Typography variant="h6" id="avatar-change-modal" sx={{ mb: 2 }}>
          Change Avatar
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 2,
            mb: 2,
          }}
        >
          {dummyAvatars.map((avatar, index) => (
            <IconButton
              key={index}
              onClick={() => setSelectedAvatar(avatar)}
              sx={{
                border: selectedAvatar === avatar ? "5px solid black" : "none",
                borderRadius: "50%",
                padding: 0,
                shadow: 1,
                width: "33.33%", // Ensures three avatars per line
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Avatar src={avatar} sx={{ width: 60, height: 60 }} />
            </IconButton>
          ))}
        </Box>
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveSettings}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default UserSettings;
