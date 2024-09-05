import styled from "@emotion/styled";
import { Button, Link } from "@mui/material";
import { signInWithPopup } from "firebase/auth";
import React from "react";
import { auth, provider } from "../firebase";

const Login = () => {
  const login = () => {
    signInWithPopup(auth, provider);
  };

  return (
    <LoginContainer>
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
      <div className="flex w-full  items-center  text-black p-1 bg-white bg-opacity-25 font-bold ">
        <Link href={"about"} color="inherit" fontSize={15}>
          About Us
        </Link>
      </div>
    </LoginContainer>
  );
};

export default Login;

export const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 10px rgb(0 0 0 / 0.3);
  height: 100vh;
  background-image: url("/images/background.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;

  button {
    background-color: rgba(56, 37, 36, 0.82);
  }
`;
