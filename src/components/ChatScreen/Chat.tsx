import React, { useEffect, useRef, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
  setDoc,
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
  const [lastViewed, setLastViewed] = useState<Date | null>(null);

  const messagesQuery = selectedRoom
      ? query(
          collection(doc(collection(db, "rooms"), selectedRoom.id), "messages"),
          orderBy("timestamp")
      )
      : null;

  const [messages] = useCollection(messagesQuery);

  useEffect(() => {
    if (user && selectedRoom) {
      const userRoomRef = doc(db, "groupMembers", `${user.uid}_${selectedRoom.id}`);
      const fetchLastViewed = async () => {
        const docSnap = await getDoc(userRoomRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && data.lastViewed) {
            setLastViewed(data.lastViewed.toDate());
          }
        }

        // Update the last viewed time to the current time when entering the room
        await setDoc(
            userRoomRef,
            { lastViewed: new Date(), roomId: selectedRoom.id, userId: user.uid },
            { merge: true }
        );
      };
      fetchLastViewed();
    }
  }, [user, selectedRoom]);

  useEffect(() => {
    if (messages && containerRef.current) {
      // If no unread messages, scroll to bottom
      let firstUnreadMessage = null;

      if (lastViewed) {
        firstUnreadMessage = messages.docs.find(
            (doc) => doc.data().timestamp.toDate() > lastViewed
        );
      }

      if (firstUnreadMessage) {
        const unreadMessageElement = document.getElementById(firstUnreadMessage.id);
        if (unreadMessageElement) {
          unreadMessageElement.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        // Scroll to the latest message if no unread messages
        divRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages, lastViewed]);

  const toggleFavorite = async (active = !selectedRoom?.favorite) => {
    setFavorite(active);
    const groupMembersRef = collection(db, "groupMembers");
    const q = query(
        groupMembersRef,
        where("roomId", "==", selectedRoom?.id),
        where("userId", "==", user?.uid)
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
      <div className="flex flex-col px-5 h-full flex-grow">
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
              <Message key={doc.id} {...(doc.data() as MessageProps)} id={doc.id} />
          ))}
          <div ref={divRef}></div>
        </div>
        {selectedRoom?.id && <ChatInput />}
      </div>
  );
};

export default Chat;
