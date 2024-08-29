import React, { useState, MouseEvent } from "react";
import { Avatar, Tooltip, Menu, MenuItem, IconButton } from "@mui/material";

import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import { signOut, User } from "firebase/auth";
import { auth } from "../firebase";
import GeneticDiseaseSearch from "./GeneticDiseaseSearch";
import { useNavigate } from "react-router-dom";
import UserSettings from "./UserSettings";

interface HeaderProps {
  user: User;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const navigate = useNavigate();
  const [gapValue, setGapValue] = useState<number>(50);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const handleMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    signOut(auth);
    handleMenuClose();
  };

  const handleUserSettingsOpen = () => {
    setIsSettingsModalOpen(true);
    handleMenuClose();
  };

  const handleUserSettingsClose = () => {
    setIsSettingsModalOpen(false);
  };

  return (
    <div className="flex items-center w-full p-2.5 bg-orange-800 overflow-hidden">
      <div className="flex items-center justify-between flex-grow">
        <Tooltip title={`Menu`} arrow>
          <Avatar
            className="ml-5 cursor-pointer hover:opacity-80"
            onClick={handleMenuOpen}
            src={user.photoURL as string}
          />
        </Tooltip>
      </div>

      <div className="flex flex-grow justify-center items-center m-5 gap-2">
        <GeneticDiseaseSearch />
        {/*<GapSlider value={gapValue} onChange={setGapValue} />*/}
      </div>

      <div
        className="flex justify-end flex-grow"
        onClick={() => navigate("/about")}
      >
        <Tooltip title="About page" arrow>
          <IconButton
            onClick={() => navigate("/about")}
            sx={{
              shadow: 1,
              width: "30%", // Ensures three avatars per line
              display: "flex",
              justifyContent: "center",
                objectFit: "contain",
            }}
          >
            <Avatar src="/images/logo-no-background.png" sx={{width: 90,
                height: 80,
                objectFit: "contain",
                borderRadius: 0,}} />
          </IconButton>
        </Tooltip>
      </div>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleUserSettingsOpen}>
          <SettingsIcon fontSize="small" className="mr-2" />
          User Settings
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <LogoutIcon fontSize="small" className="mr-2" />
          Logout
        </MenuItem>
      </Menu>

      <UserSettings
        isOpen={isSettingsModalOpen}
        onClose={handleUserSettingsClose}
        user={user}
      />
    </div>
  );
};

export default Header;
