import styled from "@emotion/styled";
import { Button, CircularProgress, Link } from "@mui/material";
import { signInWithPopup } from "firebase/auth";
import React from "react";
import { auth, provider } from "../firebase";

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
        <CircularProgress size={100} className="text-black" color="inherit" />
      ) : (
        <div className="flex flex-col gap-10 justify-center items-center flex-grow">
          <img
            src="/images/logo.jpg"
            alt="logo"
            className="w-[280px] rounded-xl"
          />
          <Button
            onClick={login}
            variant="contained"
            sx={{
              justifyContent: "center",
              width: "270px",
              height: "45px",
              color: "white",
              ":hover": {
                color: "white",
                background: "grey",
              },
            }}
          >
            Login with google
          </Button>
        </div>
      )}
      <div className="flex w-full  items-center  text-black p-1 font-mono">
        <Link href={"about"} color="inherit" fontSize={25}>
          About
        </Link>
      </div>
    </LoginContainer>
  );
};

export default Login;

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 10px rgb(0 0 0 / 0.3);
  height: 100vh;
  background-image: url("/images/background.png");
  background-size: cover;

  button {
    background-color: rgba(56, 37, 36, 0.82);
  }
`;
