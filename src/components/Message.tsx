import styled from '@emotion/styled'
import { Avatar } from '@mui/material'
import { Timestamp } from 'firebase/firestore'
import React from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../firebase'

export interface MessageProps {
  message: string
  userName: string
  userImage: string
  timestamp: Timestamp
}
const Message: React.FC<MessageProps> = ({ message, userImage, userName, timestamp }) => {
  const [user] = useAuthState(auth)
  return (
    <>
      {user?.displayName === userName ? (
        <MyMessageContainer>
          <MyMessageInfo>
            <MyMessageInfoTop>
              <p>{new Date(timestamp.seconds * 1000).toUTCString()}</p>
              <h4>{userName}</h4>
            </MyMessageInfoTop>
            <p>{message}</p>
          </MyMessageInfo>
          <Avatar variant="rounded" src={userImage} sx={{ width: 50, height: 50 }} />
        </MyMessageContainer>
      ) : (
        <MessageContainer>
          <Avatar variant="rounded" src={userImage} sx={{ width: 50, height: 50 }} />
          <MessageInfo>
            <MessageInfoTop>
              <h4>{userName}</h4>
              <p>{new Date(timestamp.seconds * 1000).toUTCString()}</p>
            </MessageInfoTop>
            <p>{message}</p>
          </MessageInfo>
        </MessageContainer>
      )}
    </>
  )
}

export default Message

const MessageContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  margin: 5px 0px;
`
const MyMessageContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`
const MessageInfo = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 10px;
`
const MyMessageInfo = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 10px;
  text-align: end;
`
const MessageInfoTop = styled.div`
  display: flex;
  align-items: center;
  p {
    margin-left: 5px;
    font-size: 12px;
    color: gray;
  }
  h4 {
    font-weight: 500;
  }
`
const MyMessageInfoTop = styled.div`
  display: flex;
  align-items: center;
  p {
    margin-right: 5px;
    font-size: 12px;
    color: gray;
  }
  h4 {
    font-weight: 500;
  }
`
