import styled from "@emotion/styled";
import { Button, Link, Checkbox, FormControlLabel } from "@mui/material";
import {
  signInWithPopup,
  updateProfile,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import React, { useState } from "react";
import { auth, provider } from "../firebase";
import { colors } from "../theme/colors";
import { dummyAvatars } from "../utils/const";
import { toast } from "react-toastify";

const Login = () => {
  const [isAgreed, setIsAgreed] = useState(false); // State for checkbox

  const login = async () => {
    if (!isAgreed) {
      toast.warning("You must agree to the privacy policy before logging in.");
      return;
    }

    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        const userEmail = result.user.email;

        if (userEmail) {
          // Check if email is not null
          // Check if the user is signing in for the first time
          const signInMethods = await fetchSignInMethodsForEmail(
            auth,
            userEmail as string,
          );

          // If the user is signing in for the first time, update the profile
          if (signInMethods.length === 0) {
            await updateProfile(result.user, {
              displayName: "Anonymous",
              photoURL: dummyAvatars[0],
            });
          }
        } else {
          console.error("User email is null.");
        }
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

        {/* Checkbox for Privacy Policy Agreement */}
        <FormControlLabel
          control={
            <Checkbox
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
            />
          }
          label={
            <div className="flex gap-1 pl-2">
              <div> I have read and agree to the</div>
              <span>
                <Link
                  href="https://heyzine.com/flip-book/85709381d7.html"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  privacy and cookies policy
                </Link>
                .
              </span>
            </div>
          }
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
          Login with Google
        </Button>
      </div>
      <div className="flex w-full items-center text-black p-1 bg-white bg-opacity-25 font-bold">
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
  background-size: 100% 100%;
  background-repeat: no-repeat;
`;
