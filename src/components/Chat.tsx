import styled from '@emotion/styled'
import React, { useRef, useEffect } from 'react'
import { useOwnSelector } from '..'
import ChatInput from './ChatInput'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import { IconButton } from '@mui/material'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import { useCollection } from 'react-firebase-hooks/firestore'
import { collection, doc, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'
import Message, { MessageProps } from './Message'

interface ChatProps {}
const Chat: React.FC<ChatProps> = () => {
  const divRef = useRef<HTMLDivElement|null>(null)
  const containerRef = useRef<HTMLDivElement|null>(null)
  const selectedRoom = useOwnSelector((state) => state.channelSlice.selectedRoom)
  let docRef
  if (selectedRoom) {
    docRef = doc(collection(db, 'rooms'), selectedRoom.id)
  }
  const [messages] = useCollection(
    docRef && query(collection(docRef, 'messages'), orderBy('timestamp')),
  )
  useEffect(() => {
    if (containerRef.current)
      if (
        containerRef.current?.scrollHeight - containerRef.current?.scrollTop <
          containerRef.current?.clientHeight + 200 ||
        containerRef.current?.scrollTop === 0
      ) {
        divRef.current?.scrollIntoView({ behavior: 'smooth' })
        console.log(
          containerRef.current?.scrollHeight - containerRef.current?.scrollTop,
          containerRef.current?.clientHeight,
        )
      }
  }, [messages])

  return (
    <ChatContainer>
      <ChatInnerContainer>
        <ChatHeader>
          <ChatHeaderLeft>
            <h4>#{selectedRoom?.title}</h4>
            <IconButton>
              <StarBorderIcon />
            </IconButton>
          </ChatHeaderLeft>
          <ChatHeaderRight>
            <IconButton>
              <HelpOutlineIcon />
            </IconButton>
            <h4>Details</h4>
          </ChatHeaderRight>
        </ChatHeader>
        <MessagesList ref={containerRef}>
          {messages?.docs.map((doc) => (
            <Message key={doc.id} {...(doc.data() as MessageProps)} />
          ))}
          <div ref={divRef}></div>
        </MessagesList>
        {selectedRoom?.id && <ChatInput roomId={selectedRoom.id} title={selectedRoom.title} />}
      </ChatInnerContainer>
    </ChatContainer>
  )
}

export default Chat
const ChatContainer = styled.div`
  display: flex;
  flex: 0.85;
  margin: 10px 0px;
`
const ChatInnerContainer = styled.div`
  margin: 0 auto;
  box-shadow: 0 3px 10px rgb(0 0 0 / 0.3);
  flex: 0.4;
  display: flex;
  flex-direction: column;
  position: relative;
`
const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  border-bottom: 1px solid gray;
  h4 {
    font-size: 16px;
    font-weight: 500;
  }
`
const ChatHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  button {
    color: black;
    margin-left: 20px;
  }
`
const ChatHeaderRight = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  button {
    color: black;
    margin-right: 10px;
  }
`
const MessagesList = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px 20px 0px 20px;
  flex: 1;
  overflow-y: scroll;
  scroll-behavior: smooth;
  &::-webkit-scrollbar {
    display: none;
  }
`
