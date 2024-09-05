import React, { MouseEvent, useState } from "react";
import {
  Avatar,
  Drawer,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import MenuIcon from "@mui/icons-material/Menu";
import { signOut, User } from "firebase/auth";
import { auth } from "../firebase";
import GeneticDiseaseSearch from "./utilities/GeneticDiseaseSearch";
import { useNavigate } from "react-router-dom";
import UserSettings from "./Modals/UserSettingsModal";
import Sidebar from "./Sidebar/Sidebar";

interface HeaderProps {
  user: User;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Drawer state
  const isMobile = useMediaQuery("(max-width:600px)");

  const handleMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await signOut(auth);
    handleMenuClose();
    navigate("/");
  };

  const handleUserSettingsOpen = () => {
    setIsSettingsModalOpen(true);
    handleMenuClose();
  };

  const handleUserSettingsClose = () => {
    setIsSettingsModalOpen(false);
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <div className="flex items-center w-full p-2.5 bg-header-color overflow-hidden">
      {isMobile && (
        <IconButton onClick={toggleDrawer}>
          <MenuIcon />
        </IconButton>
      )}

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
      </div>

      <div className="flex justify-end flex-grow" onClick={() => navigate("/")}>
        <Tooltip title="About page" arrow>
          <IconButton onClick={() => navigate("/")}>
            <Avatar
              src="/images/logo-no-background.png"
              variant="rounded"
              sx={{
                img: {
                  width: "50px",
                  height: "50px",
                  objectFit: "contain",
                },
              }}
            />
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

      {isMobile && (
        <Drawer
          anchor="left"
          open={isDrawerOpen}
          onClose={toggleDrawer}
          ModalProps={{
            keepMounted: true, // Better performance on mobile
          }}
        >
          <div className="bg-sidebar-color h-full">
            <Sidebar user={user} />
          </div>
        </Drawer>
      )}
    </div>
  );
};

export default Header;
