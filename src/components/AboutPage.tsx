import { Tooltip } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import { ArrowLeft } from "@mui/icons-material";
import React from "react";
import { useNavigate } from "react-router-dom";

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col w-full">
      <Tooltip title={"go back"} arrow>
        <IconButton
          className="p-2.5 bg-black w-10 h-10 rounded-full"
          aria-label="back"
          onClick={() => navigate("/")}
        >
          <ArrowLeft />
        </IconButton>
      </Tooltip>
      <div className="flex flex-col justify-center items-center">
        <div className="text-3xl font-bold">About Us</div>
        <div className="text-lg font-semibold text-start p-5">
          "SupportMe" is a dedicated community support application for the
          medical field. It provides a platform where individuals facing similar
          health challenges can connect, share experiences, and find support.
          The app emphasizes in-app segregation, anonymity, and moderation tools
          to ensure focused and respectful discussions while preserving user
          privacy. Users can create or join support groups tailored to specific
          medical topics, share resources, and customize their profiles.
          Flexible notification settings allow users to stay informed without
          feeling overwhelmed.
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
