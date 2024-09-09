import styled from "@emotion/styled";
import { Button, Checkbox, FormControlLabel, Link } from "@mui/material";
import { signInWithPopup, updateProfile } from "firebase/auth";
import React, { useState } from "react";
import { auth, provider } from "../firebase";
import { colors } from "../theme/colors";
import { dummyAvatars } from "../utils/const";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const [isAgreed, setIsAgreed] = useState(false); // State for checkbox

  const login = async () => {
    if (!isAgreed) {
      toast.warning("You must agree to the privacy policy before logging in.");
      return;
    }

    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        const isNewUser =
          (result.user as any)?.auth.currentUser?.metadata?.creationTime ===
          (result.user as any).currentUser?.metadata?.lastSignInTime;

        if (isNewUser) {
          await updateProfile(result.user, {
            displayName: "Anonymous",
            photoURL: dummyAvatars[0],
          });
        }
      }
    } catch (error) {
      navigate("/", { replace: true });
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

        {/* Centered Checkbox for Privacy Policy Agreement */}
        <StyledFormControl>
          <FormControlLabel
            control={
              <StyledCheckbox
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
              />
            }
            label={
              <StyledLabel>
                <span>I have read and agree to the</span>
                <Link
                  href="https://heyzine.com/flip-book/85709381d7.html"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  privacy and cookies policy
                </Link>
                .
              </StyledLabel>
            }
          />
        </StyledFormControl>

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

// Styled components for Checkbox and Label
const StyledCheckbox = styled(Checkbox)`
  color: ${colors.primary.teal};
  &.Mui-checked {
    color: ${colors.primary.teal};
  }
`;

const StyledLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  a {
    color: ${colors.primary.teal};
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const StyledFormControl = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: -10px;
`;

// Container styling remains the same
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
