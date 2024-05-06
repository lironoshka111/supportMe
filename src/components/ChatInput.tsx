import React, { useState, FormEvent } from 'react'
import styled from '@emotion/styled'
import { auth, db } from '../firebase'
import { addDoc, collection, doc, Timestamp } from 'firebase/firestore'
import Paper from '@mui/material/Paper'
import TagFacesIcon from '@mui/icons-material/TagFaces'
import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import Divider from '@mui/material/Divider'
import SendIcon from '@mui/icons-material/Send'
import { useAuthState } from 'react-firebase-hooks/auth'

interface ChatInputProps {
  roomId: string
  title: string
}
const ChatInput: React.FC<ChatInputProps> = ({ roomId, title }) => {
  const [user] = useAuthState(auth)
  const [messageValue, setMessageValue] = useState('')
  const addMessage = (e: FormEvent<HTMLFormElement>) => {
    if (messageValue) {
      e.preventDefault()
      const docRef = doc(collection(db, 'rooms'), roomId as string)
      addDoc(collection(docRef, 'messages'), {
        message: messageValue,
        userName: user?.displayName,
        userImage: user?.photoURL,
        timestamp: Timestamp.now(),
      })
      setMessageValue('')
    }
  }
  return (
    <ChatInputContainer>
      <Paper
        onSubmit={addMessage}
        component="form"
        sx={{ p: '10px 10px', display: 'flex', alignItems: 'center', width: '100%' }}>
        <IconButton sx={{ p: '10px' }} aria-label="menu">
          <TagFacesIcon />
        </IconButton>
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          type="text"
          placeholder={`Message to #${title}`}
          value={messageValue}
          onChange={(e) => setMessageValue(e.target.value)}
          color="secondary"
          inputProps={{ 'aria-label': 'search google maps' }}
          autoFocus={true}
        />
        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
        <IconButton color="primary" sx={{ p: '10px' }} aria-label="directions" type="submit">
          <SendIcon />
        </IconButton>
      </Paper>
    </ChatInputContainer>
  )
}

export default ChatInput

const ChatInputContainer = styled.div`
  display: flex;
  width: calc(100% - 40px);
  padding: 20px;
`
