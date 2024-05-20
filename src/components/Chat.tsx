import React, { useRef, useEffect, useState } from "react";
import {
  addDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  orderBy,
  getDoc,
} from "firebase/firestore";
import ChatInput from "./ChatInput";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { IconButton, Tooltip } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "../firebase";
import Message, { MessageProps } from "./Message";
import { useRedux } from "../redux/reduxStateContext";

interface ChatProps {}
const Chat: React.FC<ChatProps> = () => {
  const divRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { selectedRoom, setFavorite } = useRedux();
  const [link, setLink] = useState<string>("");
  let docRef;

  useEffect(() => {
    if (selectedRoom) {
      docRef = doc(collection(db, "rooms"), selectedRoom.id);
    }
  }, [selectedRoom]);
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

  const toggleFavorite = async (active = !selectedRoom?.favorite) => {
    setFavorite(active);
    const favoritesRef = collection(db, "favorites");
    const q = query(favoritesRef, where("roomId", "==", selectedRoom?.id));

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // Add a new document if it doesn't exist
      await addDoc(favoritesRef, {
        roomId: selectedRoom?.id,
        active: active,
        title: selectedRoom?.title,
      });
    } else {
      // Get the first document from the query snapshot
      const document = querySnapshot.docs[0];
      const docRef = doc(db, "favorites", document.id);
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        // Update the existing document
        await updateDoc(docRef, {
          active: active,
        });
      }
    }
  };

  return (
    <div className=" shadow-md flex flex-col  px-10 h-full flex-grow">
      <div className="flex items-center justify-between  border-b border-gray-300">
        <div className="flex items-center">
          <h4 className="text-lg font-medium">#{selectedRoom?.title}</h4>
          <IconButton
            color={selectedRoom?.favorite ? "warning" : undefined}
            onClick={() => toggleFavorite()}
          >
            <StarBorderIcon />
          </IconButton>
        </div>
        <div className="flex items-center justify-end">
          <Tooltip
            title="click to get more details and medical information"
            arrow
          >
            <IconButton
              onClick={() => {
                if (link) {
                  window.open(link);
                }
              }}
            >
              <HelpOutlineIcon />
            </IconButton>
          </Tooltip>
          <h4 className="text-lg font-medium">Details</h4>
        </div>
      </div>
      <div
        className="flex flex-col p-2.5 flex-1 gap-2 overflow-y-auto scrollbar-hide"
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
