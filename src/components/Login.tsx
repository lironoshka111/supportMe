import styled from "@emotion/styled";
import { Button } from "@mui/material";
import { signInWithPopup } from "firebase/auth";
import React from "react";
import { auth, provider } from "../firebase";
import Loader from "./utilities/Loader";

interface LoginProps {
  loading: boolean;
}
const Login: React.FC<LoginProps> = ({ loading }) => {
  const login = () => {
    signInWithPopup(auth, provider);
  };
  return (
    <LoginContainer>
      {loading ? (
        <>
          <img src="/images/logo.jpg" alt="logo" />
          <Loader />
        </>
      ) : (
        <div className="flex flex-col gap-10 justify-center items-center">
          <img
            src="/images/logo.jpg"
            alt="logo"
            className="w-[280px] rounded-xl"
          />
          <Button
            onClick={login}
            variant="contained"
            sx={{
              display: "flex",
              justifyContent: "center",
              width: "250px",
              height: "40px",
              borderRadius: "10%",
              // background: "grey",
              ":hover": {
                background: "grey",
              },
            }}
          >
            Login with google
          </Button>
        </div>
      )}
    </LoginContainer>
  );
};

export default Login;

const LoginContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 10px rgb(0 0 0 / 0.3);
  background-color: #c7a298;
  height: 100vh;
  background-image: url("/images/background.png");
  background-size: cover;

  button {
    background-color: rgba(215, 166, 156, 0.82);
  }
`;
