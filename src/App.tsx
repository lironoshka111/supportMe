import React, { useEffect } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import styled from "@emotion/styled";
import Chat from "./components/Chat";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import Login from "./components/Login";
import AboutPage from "./components/AboutPage";
import MembersPage from "./components/MembersPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [user, loading] = useAuthState(auth);

  return (
    <AppContainer>
      <ToastContainer />
      {user ? (
        <>
          <Header user={user} />
          <AppBody>
            <Sidebar user={user} />
            <Routes>
              <Route
                path="/"
                element={
                  <HomePage>
                    <h3>Please choose or create your room</h3>
                  </HomePage>
                }
              />
              <Route path="/room/:roomId/members" element={<MembersPage />} />
              <Route path="/room/:roomId" element={<Chat />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AppBody>
        </>
      ) : (
        <>
          <Routes>
            <Route path="/" element={<Login loading={loading} />} />
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
  height: calc(100vh - 110px);
  background-color: #e3d0d3;
`;

const HomePage = styled.div`
  flex: 0.8;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  h4 {
    font-size: 64px;
    font-weight: 500;
  }
  h3 {
    font-size: 24px;
    font-weight: 500;
  }
  h5 {
    font-size: 18px;
    font-weight: 500;
  }
`;
