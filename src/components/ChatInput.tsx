import React, {useState, FormEvent, useRef, useEffect} from "react";
import { auth, db } from "../firebase";
import {
  addDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  orderBy,
  getDoc, Timestamp,
} from "firebase/firestore";import Paper from "@mui/material/Paper";
import TagFacesIcon from "@mui/icons-material/TagFaces";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import SendIcon from "@mui/icons-material/Send";
import { useAuthState } from "react-firebase-hooks/auth";
import EmojiPicker from "emoji-picker-react";
import { useClickAway } from "ahooks";
import { Tooltip } from "@mui/material";
import {useCollection} from "react-firebase-hooks/firestore";
import { useRedux } from "../redux/reduxStateContext";
import { toast } from "react-toastify";
import { analyzeMessage } from "./BotReporter";
interface ChatInputProps {
  
}

const ChatInput: React.FC<ChatInputProps> = () => {
  const [user] = useAuthState(auth);
  const { selectedRoom, setFavorite } = useRedux(); // Assuming currentUser is in the redux state
  const containerRef = useRef<HTMLDivElement | null>(null);
  const divRef = useRef<HTMLDivElement | null>(null);
  const [messageValue, setMessageValue] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
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

  useClickAway(() => {
    setShowEmojiPicker(false);
  }, containerRef);

  const toggleFavorite = async (active = !selectedRoom?.favorite) => {
    if (!selectedRoom) return;

    setFavorite(active);

    const groupMembersRef = collection(db, "groupMembers");
    const q = query(
      groupMembersRef,
      where("roomId", "==", selectedRoom?.id),
      where("userId", "==", user?.uid),
    );

    const querySnapshot = await getDocs(q);

    const onEmojiClick = (event: any) => {
      setMessageValue((prevInput) => prevInput + event.emoji);
    };
    if (querySnapshot.empty) {
      // Add a new document if it doesn't exist
      await addDoc(groupMembersRef, {
        roomId: selectedRoom?.id,
        userId: user?.uid,
        isFavorite: active,
        nickname: user?.displayName,
        avatar: user?.photoURL,
      });
    } else {
      // Get the first document from the query snapshot
      const document = querySnapshot.docs[0];
      const docRef = doc(db, "groupMembers", document.id);
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        // Update the existing document
        await updateDoc(docRef, {
          isFavorite: active,
        });
      }
    }
  };

  const onEmojiClick = (event: any) => {
    setMessageValue((prevInput) => prevInput + event.emoji);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      addMessage();
    }
  };


  const addMessage = async (e?: FormEvent<HTMLFormElement>) => {
    if (messageValue) {
      e?.preventDefault();
      const docRef = doc(collection(db, "rooms"), roomId);
      const isInappropriate = await analyzeMessage(messageValue);
      if (isInappropriate.has_profanity) {
        toast.warning("Warning: Inappropriate message. We are censoring it.");
      }
      await addDoc(collection(docRef, "messages"), {
        message: `${isInappropriate.censored}`,
        userName: user?.displayName,
        userImage: user?.photoURL,
        timestamp: Timestamp.now(),
        userId: user?.uid,
      });
    }
    setMessageValue("");
  };

  return (
    <div className="flex w-[calc(100%-40px)] p-5" ref={containerRef}>
      <Paper
        onSubmit={addMessage}
        component="form"
        className="p-2.5 flex items-center w-full"
      >
        {showEmojiPicker && (
          <div style={{ position: "absolute", bottom: "60px", left: "10px" }}>
            <EmojiPicker onEmojiClick={onEmojiClick} />
          </div>
        )}
        <IconButton
          className="p-2.5"
          aria-label="menu"
          onClick={() => setShowEmojiPicker((val) => !val)}
        >
          <TagFacesIcon />
        </IconButton>
        <InputBase
          className="ml-2.5 flex-1"
          type="text"
          placeholder={`Message to #${selectedRoom?.title??""}`}
          value={messageValue}
          onChange={(e) => setMessageValue(e.target.value)}
          inputProps={{ "aria-label": "message input" }}
          autoFocus
          multiline
          onKeyDown={handleKeyDown} // Handle Enter key press
        />
        <Divider className="h-7 mx-0.5" orientation="vertical" />
        <Tooltip title={"Send"} arrow>
          <IconButton
            color="primary"
            className="p-2.5"
            aria-label="send"
            type="submit"
          >
            <SendIcon />
          </IconButton>
        </Tooltip>
      </Paper>
    </div>
  );
};

export default ChatInput;
