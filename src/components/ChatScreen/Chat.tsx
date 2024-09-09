import React, { useEffect, useRef, useState } from "react";
import { collection, doc, orderBy, query } from "firebase/firestore";
import ChatInput from "./ChatInput";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import PeopleIcon from "@mui/icons-material/People";
import { IconButton, Tooltip } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useCollection } from "react-firebase-hooks/firestore";
import { auth, db } from "../../firebase";
import Message from "./Message";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../redux/Context";
import {
  manageLastSeen,
  toggleFavoriteStatus,
} from "../utilities/firebaseUtils";

interface ChatProps {}
const Chat: React.FC<ChatProps> = () => {
  const [user] = useAuthState(auth);
  const divRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { selectedRoom, setFavorite } = useAppContext();
  const navigate = useNavigate();
  const [lastSeen, setLastSeen] = useState<Date | null>(null);

  const [messages] = useCollection(
    selectedRoom &&
      query(
        collection(doc(collection(db, "rooms"), selectedRoom.id), "messages"),
        orderBy("timestamp"),
      ),
  );

  // Memoize the unread message count based on lastSeen and selectedRoom.id
  useEffect(() => {
    if (selectedRoom?.id && user?.uid) {
      manageLastSeen(selectedRoom.id, user.uid, setLastSeen);
    }
  }, [selectedRoom?.id]);

  useEffect(() => {
    if (containerRef.current) {
      debugger;
      if (lastSeen) {
        messages?.docs.find((doc) => {
          if (doc.get("timestamp").toDate() > lastSeen) {
            divRef.current?.scrollIntoView({ behavior: "smooth" });
            return true;
          }
          return false;
        });
        setLastSeen(null);
      } else if (
        containerRef.current?.scrollHeight - containerRef.current?.scrollTop <
          containerRef.current?.clientHeight + 200 ||
        containerRef.current?.scrollTop === 0
      ) {
        divRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages, lastSeen]);

  const toggleFavorite = async (active = !selectedRoom?.favorite) => {
    setFavorite(active);
    if (selectedRoom?.id && user?.uid) {
      await toggleFavoriteStatus(selectedRoom.id, user.uid, active);
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
          <Message
            key={doc.id}
            reactions={doc.get("reactions")}
            message={doc.get("message")}
            timestamp={doc.get("timestamp")}
            messageId={doc.id}
            userId={doc.get("userId")}
            userImage={doc.get("userImage")}
            userName={doc.get("userName")}
          />
        ))}
        <div ref={divRef}></div>
      </div>
      {selectedRoom?.id && <ChatInput />}
    </div>
  );
};

export default Chat;
