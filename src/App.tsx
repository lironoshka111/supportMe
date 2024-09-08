import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import styled from "@emotion/styled";
import Chat from "./components/ChatScreen/Chat";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import Login, { LoginContainer } from "./components/Login";
import AboutPage from "./components/AboutPage";
import MembersPage from "./components/ChatScreen/MembersPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CircularProgress, useMediaQuery } from "@mui/material";
import { colors } from "./theme/colors";

function App() {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <LoginContainer>
        <CircularProgress size={100} className="text-black" color="inherit" />
      </LoginContainer>
    );
  }

  return (
    <AppContainer>
      <ToastContainer />
      {user ? (
        <>
          <Header user={user} />
          <AppBody>
            {/* Sidebar will always be shown when user is logged in */}
            {!isMobile && <Sidebar user={user} />}
            <MainContent>
              <Routes>
                <Route path="/" element={<AboutPage />} />
                <Route path="/room/:roomId/members" element={<MembersPage />} />
                <Route path="/room/:roomId" element={<Chat />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </MainContent>
          </AppBody>
        </>
      ) : (
        <>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </>
      )}
    </AppContainer>
  );
}

export default App;

const AppContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const AppBody = styled.div`
  display: flex;
  height: calc(100vh - 64px); /* Adjusted height to leave room for the header */
  background-color: ${colors.primary.lightCream};
`;

const MainContent = styled.div`
  flex-grow: 1;
  //background-color: #ffffff;
  padding: 20px;
  overflow-y: auto;
`;

const HomePage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100%;
  h3 {
    font-size: 24px;
    font-weight: 500;
  }
`;
