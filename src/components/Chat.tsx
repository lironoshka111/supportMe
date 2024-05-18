import React, { useRef, useEffect, useState } from 'react'
import { useOwnSelector } from '..'
import ChatInput from './ChatInput'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import { IconButton } from '@mui/material'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import { useCollection } from 'react-firebase-hooks/firestore'
import { collection, doc, getDoc, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'
import Message, { MessageProps } from './Message'

interface ChatProps {}
const Chat: React.FC<ChatProps> = () => {
  const divRef = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const selectedRoom = useOwnSelector((state) => state.channelSlice.selectedRoom)
  const [link, setLink] = useState<string>('')
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


  const getRoomLink = async () => {
    if(!selectedRoom) return
     const snap = await getDoc(doc(db, 'rooms', selectedRoom?.id))
    setLink(snap.data()?.link)
  }

  useEffect(() => {
    getRoomLink()
  }, [selectedRoom])

  return (
      <div className="flex flex-[0.85] my-2.5">
        <div className="m-auto shadow-md flex flex-col flex-[0.4] relative">
          <div className="flex items-center justify-between p-2.5 border-b border-gray-300">
            <div className="flex items-center">
              <h4 className="text-lg font-medium">#{selectedRoom?.title}</h4>
            </div>
            <div onClick={()=>{
                if(link){
                    window.open(link)
                }
            }} className="flex items-center justify-end">
              <IconButton>
                <HelpOutlineIcon />
              </IconButton>
              <h4 className="text-lg font-medium">Details</h4>
            </div>
          </div>
          <div className="flex flex-col p-2.5 flex-1 overflow-y-scroll scrollbar-hide" ref={containerRef}>
            {messages?.docs.map((doc) => (
                <Message key={doc.id} {...(doc.data() as MessageProps)} />
            ))}
            <div ref={divRef}></div>
          </div>
          {selectedRoom?.id && <ChatInput roomId={selectedRoom.id} title={selectedRoom.title} />}
        </div>
      </div>
  )
}

export default Chat
