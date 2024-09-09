import { LoginContainer } from "../Login";
import { CircularProgress } from "@mui/material";
import React from "react";

export const Loader = () => (
  <LoginContainer>
    <CircularProgress size={100} className="text-black" color="inherit" />
  </LoginContainer>
);
