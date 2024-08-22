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
  deleteDoc, // Import deleteDoc for deleting messages
} from "firebase/firestore";
import ChatInput from "./ChatInput";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import PeopleIcon from "@mui/icons-material/People";
import { IconButton, Tooltip } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "../firebase";
import Message, { MessageProps } from "./Message";
import { useRedux } from "../redux/reduxStateContext";
import { useNavigate } from "react-router-dom";

interface ChatProps {}

const Chat: React.FC<ChatProps> = () => {
  const divRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { selectedRoom, setFavorite } = useRedux();
  const [link, setLink] = useState<string>("");
  const navigate = useNavigate();

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
      await addDoc(favoritesRef, {
        roomId: selectedRoom?.id,
        active: active,
        title: selectedRoom?.title,
      });
    } else {
      const document = querySnapshot.docs[0];
      const docRef = doc(db, "favorites", document.id);
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        await updateDoc(docRef, {
          active: active,
        });
      }
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      if (selectedRoom) {
        const messageRef = doc(
            collection(db, "rooms", selectedRoom.id, "messages"),
            id
        );
        await deleteDoc(messageRef); // Delete the message from Firestore
      }
    } catch (error) {
      console.error("Error deleting message: ", error);
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
          <div className="flex  gap-2 items-center justify-end">
            <Tooltip title="group members" arrow>
              <IconButton
                  onClick={() => {
                    navigate(`/room/${selectedRoom?.id}/members`);
                  }}
              >
                <PeopleIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Details" arrow>
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
          </div>
        </div>
        <div
            aria-label="message container"
            tabIndex={0}
            className="flex flex-col p-2.5 flex-1 gap-2 overflow-y-auto scrollbar-hide"
            ref={containerRef}
        >
          {messages?.docs.map((doc) => (
              <Message
                  key={doc.id}
                  id={doc.id} // Pass the message ID
                  {...(doc.data() as Omit<MessageProps, 'id'>)}
                  onDelete={handleDeleteMessage} // Pass the delete handler
              />
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
