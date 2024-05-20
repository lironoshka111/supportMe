import React, { useState, FormEvent } from "react";
import { auth, db } from "../firebase";
import { addDoc, collection, doc, Timestamp } from "firebase/firestore";
import Paper from "@mui/material/Paper";
import TagFacesIcon from "@mui/icons-material/TagFaces";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import SendIcon from "@mui/icons-material/Send";
import { useAuthState } from "react-firebase-hooks/auth";

interface ChatInputProps {
  roomId: string;
  title: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ roomId, title }) => {
  const [user] = useAuthState(auth);
  const [messageValue, setMessageValue] = useState<string>("");

  const addMessage = async (e: FormEvent<HTMLFormElement>) => {
    if (messageValue) {
      e.preventDefault();
      const docRef = doc(collection(db, "rooms"), roomId);
      await addDoc(collection(docRef, "messages"), {
        message: messageValue,
        userName: user?.displayName,
        userImage: user?.photoURL,
        timestamp: Timestamp.now(),
      });
      setMessageValue("");
    }
  };

  return (
    <div className="flex w-[calc(100%-40px)] p-5">
      <Paper
        onSubmit={addMessage}
        component="form"
        className="p-2.5 flex items-center w-full"
      >
        <IconButton className="p-2.5" aria-label="menu">
          <TagFacesIcon />
        </IconButton>
        <InputBase
          className="ml-2.5 flex-1"
          type="text"
          placeholder={`Message to #${title}`}
          value={messageValue}
          onChange={(e) => setMessageValue(e.target.value)}
          inputProps={{ "aria-label": "message input" }}
          autoFocus
        />
        <Divider className="h-7 mx-0.5" orientation="vertical" />
        <IconButton
          color="primary"
          className="p-2.5"
          aria-label="send"
          type="submit"
        >
          <SendIcon />
        </IconButton>
      </Paper>
    </div>
  );
};

export default ChatInput;
