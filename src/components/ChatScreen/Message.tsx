import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "@emotion/styled";
import { Avatar } from "@mui/material";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { ReactionBarSelector } from "@charkour/react-reactions";
import { useHover } from "ahooks";
import { auth, db } from "../../firebase";
import { Message as MessageType } from "../../types/models";
import { useAppContext } from "../../redux/Context";

// Interface for Message Props
export type MessageProps = MessageType & {
  messageId: string;
};

// Move the emoji options outside the component to prevent recreation on every render
const defaultEmojis = [
  { node: <div>👍</div>, label: "like", key: "like", selected: false },
  { node: <div>❤️</div>, label: "love", key: "love", selected: false },
  { node: <div>😆</div>, label: "haha", key: "haha", selected: false },
  { node: <div>😮</div>, label: "wow", key: "wow", selected: false },
  { node: <div>😢</div>, label: "sad", key: "sad", selected: false },
  { node: <div>😡</div>, label: "angry", key: "angry", selected: false },
];

// Group reactions by type and count how many times each reaction occurs
const groupReactionsByType = (reactions: { reactionType: string }[]) => {
  return reactions?.reduce((acc: Record<string, number>, reaction) => {
    acc[reaction.reactionType] = (acc[reaction.reactionType] || 0) + 1;
    return acc;
  }, {});
};

const Message: React.FC<MessageProps> = ({
  message,
  timestamp,
  messageId,
  reactions = [],
  userImage,
  userName,
}) => {
  const [user] = useAuthState(auth);
  const ref = useRef<HTMLDivElement>(null);
  const isHovering = useHover(ref); // Detect hover state
  const [emojis, setEmojis] = useState(defaultEmojis);
  const { selectedRoom } = useAppContext();
  const roomId = selectedRoom?.id || "";

  // Group reactions by type
  const groupedReactions = useMemo(
    () => groupReactionsByType(reactions),
    [reactions],
  );

  // Memoize user's reactions
  const userReactions = useMemo(
    () =>
      reactions
        .filter((reaction) => reaction.reactingUserId === user?.uid)
        .map((reaction) => reaction.reactionType),
    [reactions, user?.uid],
  );

  // Update selected reactions for the current user
  useEffect(() => {
    const updatedEmojis = defaultEmojis.map((emoji) => ({
      ...emoji,
      selected: userReactions.includes(emoji.key),
    }));
    setEmojis(updatedEmojis);
  }, [userReactions]);

  // Handle reaction select or remove
  const handleReactionSelect = async (reactionKey: string) => {
    if (!user) return;
    const messageRef = doc(db, "rooms", roomId, "messages", messageId);

    // Toggle reaction: add if not present, remove if already selected
    const selectedReaction = userReactions.includes(reactionKey);
    if (selectedReaction) {
      // Remove the reaction
      await updateDoc(messageRef, {
        reactions: arrayRemove({
          reactingUserId: user.uid,
          reactionType: reactionKey,
        }),
      });
    } else {
      // Add the reaction
      await updateDoc(messageRef, {
        reactions: arrayUnion({
          reactingUserId: user.uid,
          reactionType: reactionKey,
        }),
      });
    }
  };

  return (
    <div ref={ref} className="flex flex-col rounded-md p-3">
      <div className="bg-pink-50 rounded-md p-3">
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
            <MessageText>{message}</MessageText>
          </MessageInfo>
        </MessageContainer>
      </div>

      <ReactionsContainer>
        {Object.entries(groupedReactions).map(([reactionType, count]) => (
          <ReactionGroup key={reactionType}>
            {emojis.find((emoji) => emoji.key === reactionType)?.node}
            <ReactionCount>{count}</ReactionCount>
          </ReactionGroup>
        ))}
      </ReactionsContainer>

      {/* Conditionally render the ReactionBarSelector only when hovering */}
      {isHovering && (
        <ReactionBarSelector
          reactions={emojis.map((emoji) => ({
            ...emoji,
            selected: emoji.selected,
          }))}
          iconSize={20}
          onSelect={handleReactionSelect}
        />
      )}
    </div>
  );
};

// Styled components
const MessageContainer = styled.div`
  display: flex;
  align-items: center;
`;
const MessageInfo = styled.div`
  margin-left: 10px;
`;
const MessageInfoTop = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  h4 {
    font-weight: 500;
  }
  p {
    font-size: 12px;
    color: gray;
  }
`;
const MessageText = styled.p`
  word-wrap: break-word;
  white-space: pre-wrap;
  text-align: left;
`;

const ReactionsContainer = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 10px;
`;

const ReactionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const ReactionCount = styled.span`
  font-size: 14px;
  color: #555;
`;

export default Message;
