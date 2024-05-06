import styled from '@emotion/styled'
import { Button } from '@mui/material'
import { signInWithPopup } from 'firebase/auth'
import React from 'react'
import { auth, provider } from '../firebase'
import Loader from './utilities/Loader'
import logo from '../images/logo.jpg'

interface LoginProps {
  loading: boolean
}
const Login: React.FC<LoginProps> = ({ loading }) => {
  const login = () => {
    signInWithPopup(auth, provider)
  }
  return (
    <LoginContainer>
      {loading ? (
        <LoginLoadContainer>
          <img src={logo} alt="logo" />
          <Loader />
        </LoginLoadContainer>
      ) : (
        <LoginInnerContainer>
          <img src={logo} alt="logo" />
          <Button
            onClick={login}
            variant="contained"
            sx={{
              borderRadius:'40%',
              backgroundColor: 'pink',
              ':hover': {
                background: 'grey',
              },
            }}>
            Login with google
          </Button>
        </LoginInnerContainer>
      )}
    </LoginContainer>
  )
}

export default Login

const LoginContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e3d0d3;
  box-shadow: 0 3px 10px rgb(0 0 0 / 0.3);
  height: 100vh;
`
const LoginInnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 30%;
  //border-radius: 50%;
  height: 50%;
  background-color: lightpink;
  img {
    border-radius: 50%;
    object-fit: contain;
    width: 40%;
    margin-bottom: 30px;
  }
`
const LoginLoadContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 30%;
  height: 50%;
  background-color: inherit;
  img {
    object-fit: contain;
    width: 40%;
    margin-bottom: 30px;
  }
`
