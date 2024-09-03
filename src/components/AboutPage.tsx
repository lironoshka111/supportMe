import { Tooltip } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import { ArrowLeft } from "@mui/icons-material";
import React from "react";
import { useNavigate } from "react-router-dom";

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col  w-full">
      <div className="flex justify-start mb-4">
        <Tooltip title={"Go back"} arrow>
          <IconButton
            className="p-2 bg-black text-white hover:bg-gray-800 transition-colors duration-300"
            aria-label="Back"
            onClick={() => navigate("/")}
          >
            <ArrowLeft />
          </IconButton>
        </Tooltip>
      </div>
      <div className="flex flex-col items-center bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-4">About Us</h1>
        <p className="text-lg font-medium text-gray-700 leading-relaxed">
          "SupportMe" is a dedicated community support application for the
          medical field. It provides a platform where individuals facing similar
          health challenges can connect, share experiences, and find support.
          The app emphasizes in-app segregation, anonymity, and moderation tools
          to ensure focused and respectful discussions while preserving user
          privacy. Users can create or join support groups tailored to specific
          medical topics, share resources, and customize their profiles.
          Flexible notification settings allow users to stay informed without
          feeling overwhelmed.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
