import styled from "@emotion/styled";
import { Avatar } from "@mui/material";
import { Timestamp } from "firebase/firestore";
import React, { useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import { useHover } from "ahooks";
import { ReactionBarSelector } from "@charkour/react-reactions";
import { jsx } from "@emotion/react";
import JSX = jsx.JSX;

export interface MessageProps {
  message: string;
  userName: string;
  userImage: string;
  timestamp: Timestamp;
}

const emojis = [
  { node: <div>👍</div>, label: "like", key: "satisfaction" },
  { node: <div>❤️</div>, label: "love", key: "love" },
  { node: <div>😆</div>, label: "haha", key: "happy" },
  { node: <div>😮</div>, label: "wow", key: "surprise" },
  { node: <div>😢</div>, label: "sad", key: "sad" },
  { node: <div>😡</div>, label: "angry", key: "angry" },
];
const Message: React.FC<MessageProps> = ({
  message,
  userImage,
  userName,
  timestamp,
}) => {
  const [user] = useAuthState(auth);
  const ref = useRef(null);
  const isHovering = useHover(ref);
  const [emoji, setEmoji] = useState<JSX.Element>();
  return (
    <div className="flex flex-col F rounded-md p-3" ref={ref}>
      <div className="bg-pink-50 rounded-md p-3">
        {user?.displayName === userName ? (
          <MyMessageContainer>
            <MyMessageInfo>
              <MyMessageInfoTop>
                <p>{new Date(timestamp.seconds * 1000).toUTCString()}</p>
                <h4>{userName}</h4>
              </MyMessageInfoTop>
              <p>{message}</p>
            </MyMessageInfo>
            <Avatar
              variant="rounded"
              src={userImage}
              sx={{ width: 50, height: 50 }}
            />
          </MyMessageContainer>
        ) : (
          <MessageContainer>
            <Avatar
              variant="rounded"
              src={userImage}
              sx={{ width: 50, height: 50 }}
            />
            <MessageInfo>
              <MessageInfoTop>
                <h4>{userName}</h4>
                <p>{new Date(timestamp.seconds * 1000).toUTCString()}</p>
              </MessageInfoTop>
              <p>{message}</p>
            </MessageInfo>
          </MessageContainer>
        )}
      </div>
      {isHovering ? (
        <ReactionBarSelector
          reactions={emojis}
          iconSize={10}
          onSelect={(label) => {
            const foundEmoji = emojis.find(
              (emoji) => emoji.key === label,
            )?.node;
            if (!foundEmoji) {
              return;
            }
            if (foundEmoji?.toString() === emoji?.toString()) {
              setEmoji(undefined);
              return;
            }

            setEmoji(foundEmoji);
          }}
        />
      ) : (
        <div className="h-[20px]" />
      )}
      {emoji ?? <div className="h-[10px]" />}
    </div>
  );
};

export default Message;

const MessageContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  margin: 5px 0px;
`;
const MyMessageContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;
const MessageInfo = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 10px;
`;
const MyMessageInfo = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 10px;
  text-align: end;
`;
const MessageInfoTop = styled.div`
  display: flex;
  align-items: center;
  p {
    margin-left: 5px;
    font-size: 12px;
    color: gray;
  }
  h4 {
    font-weight: 500;
  }
`;
const MyMessageInfoTop = styled.div`
  display: flex;
  align-items: center;
  p {
    margin-right: 5px;
    font-size: 12px;
    color: gray;
  }
  h4 {
    font-weight: 500;
  }
`;
