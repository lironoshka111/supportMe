import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import styled from '@emotion/styled'
import Chat from './components/Chat'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from './firebase'
import Login from './components/Login'

function App() {
  const [user, loading] = useAuthState(auth)

  return (
    <div className="App">
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
                    <h4>😥</h4>
                    <h3>You haven't choose the channel yet</h3>
                    <h5>Other functions don't work now , please select a channel</h5>
                  </HomePage>
                }
              />
              <Route path="/room/:roomId" element={<Chat />} />
            </Routes>
          </AppBody>
        </>
      ) : (
        <Login loading={loading} />
      )}
    </div>
  )
}

export default App

const AppBody = styled.div`
  display: flex;
  height: calc(100vh - 60px);
`
const HomePage = styled.div`
  margin: 10px;
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
`
