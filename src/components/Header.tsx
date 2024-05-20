import React from "react";
import { Avatar } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { signOut, User } from "firebase/auth";
import { auth } from "../firebase";
import GeneticDiseaseSearch from "./GeneticDiseaseSearch";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  user: User;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center w-full p-2.5 bg-slack-color overflow-hidden">
      <div className="flex items-center justify-between flex-grow">
        <Avatar
          className="ml-5 cursor-pointer hover:opacity-80"
          onClick={() => signOut(auth)}
          src={user.photoURL as string}
        />
        <AccessTimeIcon className="cursor-pointer text-white mr-5" />
      </div>

      <div className="flex items-center flex-grow mx-5 border border-gray-500 rounded bg-gray-200">
        <GeneticDiseaseSearch />
      </div>

      <div
        className="flex justify-end flex-grow"
        onClick={() => navigate("/about")}
      >
        <HelpOutlineIcon className="cursor-pointer text-white mr-5" />
      </div>
    </div>
  );
};

export default Header;
