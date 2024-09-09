import React, { useEffect, useRef } from "react";
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
} from "firebase/firestore";
import ChatInput from "./ChatInput";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import PeopleIcon from "@mui/icons-material/People";
import { IconButton, Tooltip } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import InfoIcon from "@mui/icons-material/Info";
import { useCollection } from "react-firebase-hooks/firestore";
import { auth, db } from "../../firebase";
import Message from "./Message";
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

  const [messages] = useCollection(
    selectedRoom &&
      query(
        collection(doc(collection(db, "rooms"), selectedRoom.id), "messages"),
        orderBy("timestamp"),
      ),
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

  // Replace navigate function calls with history.push
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

          <Tooltip title="Group members" arrow>
            <IconButton
              onClick={() => {
                navigate(`/room/${selectedRoom?.id}/members`);
              }}
            >
              <InfoIcon />
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
