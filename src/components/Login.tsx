import styled from "@emotion/styled";
import { Button, Link } from "@mui/material";
import { signInWithPopup, updateProfile } from "firebase/auth";
import React from "react";
import { auth, provider } from "../firebase";
import { colors } from "../theme/colors";
import { dummyAvatars } from "../utils/const";

const Login = () => {
  const login = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        await updateProfile(result.user, {
          displayName: "Anonymous",
          photoURL: dummyAvatars[0],
        });
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };
  return (
    <LoginContainer>
      <div className="flex flex-col gap-10 justify-center items-center flex-grow">
        <img
          src="/images/logo.png"
          alt="logo"
          className="w-[280px] rounded-xl"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={login}
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
  background-color: ${colors.primary.lightCream};
  //background-image: url("/images/supportmeLogin.jpg");
  background-size: 100% 100%;
  background-repeat: no-repeat;

  //button {
  //  background-color: rgba(56, 37, 36, 0.82);
  //}
`;
