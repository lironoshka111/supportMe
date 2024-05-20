import React, { useRef, useEffect, useState } from "react";
import { useOwnSelector } from "..";
import ChatInput from "./ChatInput";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { IconButton } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useCollection } from "react-firebase-hooks/firestore";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../firebase";
import Message, { MessageProps } from "./Message";
import { useBoolean } from "ahooks";

interface ChatProps {}
const Chat: React.FC<ChatProps> = () => {
  const divRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectedRoom = useOwnSelector(
    (state) => state.channelSlice.selectedRoom,
  );
  const [favorite, { toggle: toggleFavorite }] = useBoolean(false);
  const [link, setLink] = useState<string>("");
  let docRef;
  if (selectedRoom) {
    docRef = doc(collection(db, "rooms"), selectedRoom.id);
  }
  const [messages] = useCollection(
    docRef && query(collection(docRef, "messages"), orderBy("timestamp")),
  );
  useEffect(() => {
    if (containerRef.current)
      if (
        containerRef.current?.scrollHeight - containerRef.current?.scrollTop <
          containerRef.current?.clientHeight + 200 ||
        containerRef.current?.scrollTop === 0
      ) {
        divRef.current?.scrollIntoView({ behavior: "smooth" });
        console.log(
          containerRef.current?.scrollHeight - containerRef.current?.scrollTop,
          containerRef.current?.clientHeight,
        );
      }
  }, [messages]);

  const getRoomLink = async () => {
    if (!selectedRoom) return;
    const snap = await getDoc(doc(db, "rooms", selectedRoom?.id));
    setLink(snap.data()?.link);
  };

  useEffect(() => {
    getRoomLink();
  }, [selectedRoom]);

  const changeFavorite = async (active = true) => {
    if (active)
      await addDoc(collection(db, "favorite"), {
        roomId: selectedRoom?.id,
        title: selectedRoom?.title,
      });
    else {
      // docRef = doc(collection(db, "favorite");
    }
  };

  return (
    <div className="m-auto shadow-md flex flex-col  px-10 h-full flex-grow">
      <div className="flex items-center justify-between  border-b border-gray-300">
        <div className="flex items-center">
          <h4 className="text-lg font-medium">#{selectedRoom?.title}</h4>
          <IconButton
            color={favorite ? "warning" : undefined}
            onClick={toggleFavorite}
          >
            <StarBorderIcon />
          </IconButton>
        </div>
        <div className="flex items-center justify-end">
          <IconButton
            onClick={() => {
              if (link) {
                window.open(link);
              }
            }}
          >
            <HelpOutlineIcon />
          </IconButton>
          <h4 className="text-lg font-medium">Details</h4>
        </div>
      </div>
      <div
        className="flex flex-col p-2.5 flex-1 overflow-y-auto scrollbar-hide"
        ref={containerRef}
      >
        {messages?.docs.map((doc) => (
          <Message key={doc.id} {...(doc.data() as MessageProps)} />
        ))}
        <div ref={divRef}></div>
      </div>
      {selectedRoom?.id && (
        <ChatInput roomId={selectedRoom.id} title={selectedRoom.title} />
      )}
    </div>
  );
};

export default Chat;
