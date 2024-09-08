import React, { useEffect, useRef, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import ChatInput from "./ChatInput";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import PeopleIcon from "@mui/icons-material/People";
import { IconButton, Tooltip } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useCollection } from "react-firebase-hooks/firestore";
import { auth, db } from "../../firebase";
import Message, { MessageProps } from "./Message";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../redux/Context";

interface ChatProps {}
const Chat: React.FC<ChatProps> = () => {
  const [user] = useAuthState(auth);
  const divRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { selectedRoom, setFavorite } = useAppContext();
  const navigate = useNavigate();
  const [lastSeenMessage, setLastSeenMessage] = useState<Timestamp | null>(null);

  // Fetch the last seen message for the current user in the selected room
  const fetchLastSeenMessage = async () => {
    if (selectedRoom && user) {
      const lastSeenRef = doc(db, "lastSeen", `${selectedRoom.id}_${user.uid}`);
      const lastSeenSnap = await getDoc(lastSeenRef);
      if (lastSeenSnap.exists()) {
        setLastSeenMessage(lastSeenSnap.data().lastSeen);
      }
    }
  };

  const [messages] = useCollection(
      selectedRoom &&
      query(
          collection(doc(collection(db, "rooms"), selectedRoom.id), "messages"),
          orderBy("timestamp"),
      ),
  );

  // Mark messages as seen by the user
  const markMessagesAsSeen = async () => {
    if (selectedRoom && user) {
      const lastSeenRef = doc(db, "lastSeen", `${selectedRoom.id}_${user.uid}`);
      await setDoc(lastSeenRef, {
        userId: user.uid,
        roomId: selectedRoom.id,
        lastSeen: Timestamp.now(),
      }, { merge: true });
    }
  };

  useEffect(() => {
    // Fetch last seen message when the selected room is loaded
    fetchLastSeenMessage();
  }, [selectedRoom]);

  useEffect(() => {
    if (messages && lastSeenMessage && containerRef.current) {
      // Find the message element closest to the last seen timestamp
      const lastSeenMessageElement = document.querySelector(
          `[data-timestamp="${Math.floor(lastSeenMessage.seconds)}"]`
      );
      if (lastSeenMessageElement) {
        lastSeenMessageElement.scrollIntoView({ behavior: "smooth" });
      } else {
        // If no last seen message is found, scroll to the bottom by default
        divRef.current?.scrollIntoView({ behavior: "smooth" });
      }

      // Mark the latest message as seen when messages are loaded
      markMessagesAsSeen();
    }
  }, [messages, lastSeenMessage]);

  const toggleFavorite = async (active = !selectedRoom?.favorite) => {
    setFavorite(active);
    const groupMembersRef = collection(db, "groupMembers");
    const q = query(
        groupMembersRef,
        where("roomId", "==", selectedRoom?.id),
        where("userId", "==", user?.uid),
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // Add a new document if it doesn't exist
      await addDoc(groupMembersRef, {
        roomId: selectedRoom?.id,
        userId: user?.uid,
        isFavorite: active,
      });
    } else {
      // Get the first document from the query snapshot
      const document = querySnapshot.docs[0];
      const docRef = doc(db, "groupMembers", document.id);
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        await updateDoc(docRef, {
          isFavorite: active,
        });
      }
    }
  };

  return (
      <div className="shadow-md flex flex-col px-10 h-full flex-grow">
        <div className="flex items-center justify-between border-b border-gray-300">
          <div className="flex items-center">
            <h4 className="text-lg font-medium">#{selectedRoom?.title}</h4>
            <IconButton
                color={selectedRoom?.favorite ? "warning" : undefined}
                onClick={() => toggleFavorite()}
            >
              <StarBorderIcon />
            </IconButton>
          </div>
          <div className="flex gap-2 items-center justify-end">
            <Tooltip title="Group members" arrow>
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
                    if (selectedRoom?.linkToData) {
                      window.open(selectedRoom.linkToData);
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
              <Message key={doc.id} {...(doc.data() as MessageProps)} />
          ))}
          <div ref={divRef}></div>
        </div>
        {selectedRoom?.id && <ChatInput />}
      </div>
  );
};

export default Chat;
