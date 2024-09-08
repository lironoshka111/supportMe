import React, { FormEvent, useRef, useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import { addDoc, collection, doc, Timestamp, setDoc } from "firebase/firestore";
import Paper from "@mui/material/Paper";
import TagFacesIcon from "@mui/icons-material/TagFaces";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import SendIcon from "@mui/icons-material/Send";
import { useAuthState } from "react-firebase-hooks/auth";
import EmojiPicker from "emoji-picker-react";
import { useClickAway } from "ahooks";
import { Tooltip, useMediaQuery } from "@mui/material";
import { toast } from "react-toastify";
import { analyzeMessage } from "../../utils/analyzeMessage";
import { useAppContext } from "../../redux/Context";

interface ChatInputProps {}

const ChatInput: React.FC<ChatInputProps> = () => {
  const [user] = useAuthState(auth);
  const { selectedRoom } = useAppContext();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [messageValue, setMessageValue] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const divRef = useRef<HTMLDivElement | null>(null); // For auto-scrolling

  const isMobile = useMediaQuery("(max-width:600px)");
  useClickAway(() => {
    setShowEmojiPicker(false);
  }, containerRef);

  const onEmojiClick = (event: any) => {
    setMessageValue((prevInput) => prevInput + event.emoji);
  };

  // Function to update the user's last seen message in Firestore
  const updateLastSeen = async () => {
    if (selectedRoom && user) {
      const lastSeenRef = doc(db, "lastSeen", `${selectedRoom.id}_${user.uid}`);
      await setDoc(lastSeenRef, {
        userId: user.uid,
        roomId: selectedRoom.id,
        lastSeen: Timestamp.now(),
      }, { merge: true });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isMobile) {
      addMessage();
    }
  };

  const addMessage = async (e?: FormEvent<HTMLFormElement>) => {
    if (messageValue) {
      e?.preventDefault();
      const docRef = doc(collection(db, "rooms"), selectedRoom?.id);
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
      setMessageValue(""); // Clear the input field

      // After sending the message, scroll to the latest message and update last seen
      divRef.current?.scrollIntoView({ behavior: "smooth" });
      updateLastSeen(); // Update the last seen timestamp in Firestore
    }
  };




  useEffect(() => {
    // Automatically scroll to the latest message whenever the messages change
    divRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedRoom, user]);

  return (
      <div className="flex w-full" ref={containerRef}>
        <Paper
            onSubmit={addMessage}
            component="form"
            className="flex items-center w-full"
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
              className="flex-1"
              type="text"
              placeholder={`Message to #${selectedRoom?.title ?? ""}`}
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
        <div ref={divRef} /> {/* Div for auto-scrolling */}
      </div>
  );
};

export default ChatInput;
