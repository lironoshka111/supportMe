import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import styled from "@emotion/styled";
import Chat from "./components/ChatScreen/Chat";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import Login from "./components/Login";
import AboutPage from "./components/AboutPage";
import EditRoomPage from "./components/ChatScreen/EditRoomPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useMediaQuery } from "@mui/material";
import { colors } from "./theme/colors";
import HomePage from "./components/HomePage";
import { Loader } from "./components/utilities/Loader";

function App() {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <Loader />;
  }

  return (
    <AppContainer>
      <ToastContainer />
      {user ? (
        <>
          <Header user={user} />
          <AppBody>
            <>
              {!isMobile && <Sidebar user={user} />}
              <MainContent>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route
                    path="/room/:roomId/members"
                    element={<EditRoomPage />}
                  />
                  <Route path="/room/:roomId" element={<Chat />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </MainContent>
            </>
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
  padding: 20px;
  overflow-y: auto;
  width: 100%;
  display: flex;
  flex-direction: column;
`;
