import React from "react";
import { Avatar } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SearchIcon from "@mui/icons-material/Search";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { signOut, User } from "firebase/auth";
import { auth } from "../firebase";
import GeneticDiseaseSearch from "./GeneticDiseaseSearch";

interface HeaderProps {
  user: User;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  return (
    <div className="flex items-center w-full px-2.5 bg-slack-color">
      <div className="flex items-center justify-between flex-1/3">
        <Avatar
          className="ml-5 cursor-pointer hover:opacity-80"
          onClick={() => signOut(auth)}
          src={user.photoURL as string}
        />
        <AccessTimeIcon className="cursor-pointer text-white Fmr-7.5" />
      </div>

      <div className="flex items-center flex-2/5 border border-gray-500 rounded bg-gray-200">
        <GeneticDiseaseSearch />
      </div>

      <div className="flex justify-end flex-1/3">
        <HelpOutlineIcon className="cursor-pointer text-white mr-5" />
      </div>
    </div>
  );
};

export default Header;
