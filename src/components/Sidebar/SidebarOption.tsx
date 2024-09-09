import React, { useState } from "react";
import styled from "@emotion/styled";
import { Link, useNavigate } from "react-router-dom";
import classNames from "classnames";
import { useAppContext } from "../../redux/Context";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from "@mui/material";
import {
  collection,
  deleteDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";

interface SidebarOptionProps {
  Icon: React.FC;
  title: string;
  haveAddOption?: boolean;
  isChannel?: boolean; // To determine if it's a channel
  addChannel?: () => void;
  selectChannel?: (roomId: string, roomTitle: string) => void;
  id?: string;
  linkToData?: string;
}

export const OptionContainer = ({
  title,
  Icon,
  onClick,
  selected,
  RightIcon,
  onDelete,
  isChannel,
}: {
  title: string;
  Icon: React.FC;
  onClick: () => void;
  selected?: boolean;
  RightIcon?: React.FC;
  onDelete?: () => void; // Optional prop for deletion
  isChannel?: boolean; // Check if it's a channel
}) => {
  return (
    <div
      className={classNames(
        "flex  justify-between hover:bg-gray-500 rounded-md items-center w-full",
        selected && "bg-gray-600",
      )}
    >
      <SidebarOptionContainer onClick={onClick} selected={selected}>
        {Icon && <Icon />}
        <p>{title}</p>
        {RightIcon && <RightIcon />}
        {/* Only show the delete icon if it's a channel */}
      </SidebarOptionContainer>
      {isChannel && onDelete && (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation(); // Prevent the click from selecting the channel
            e.preventDefault();
            onDelete(); // Trigger the delete function
          }}
        >
          <DeleteIcon style={{ color: "white" }} />
        </IconButton>
      )}
    </div>
  );
};

const SidebarOption: React.FC<SidebarOptionProps> = ({
  id = "is not channel",
  Icon,
  title,
  isChannel = false,
  selectChannel,
}) => {
  const { setSelectedRoom, selectedRoom } = useAppContext();
  const navigate = useNavigate();
  const [user] = useAuthState(auth); // Get the current user

  // State to handle the modal visibility
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Function to remove the user from the groupMembers table
  const leaveRoom = async () => {
    if (!id || id === "is not channel" || !user?.uid) return;

    try {
      // Query for the group member document to delete
      const groupMembersRef = collection(db, "groupMembers");
      const q = query(
        groupMembersRef,
        where("roomId", "==", id),
        where("userId", "==", user.uid),
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        querySnapshot.forEach(async (docSnapshot) => {
          await deleteDoc(docSnapshot.ref);
        });
        setSelectedRoom(null);
        navigate("/"); // Navigate back to home after leaving the group
      }

      setOpenDeleteDialog(false);
    } catch (error) {
      console.error("Error leaving room: ", error);
      alert("Failed to leave the group. Please try again.");
    }
  };

  return (
    <>
      <Link to={`${id === "is not channel" ? "/" : `/room/${id}`}`}>
        <OptionContainer
          key={title}
          title={title}
          Icon={Icon}
          onClick={() => {
            if (isChannel) {
              selectChannel && selectChannel(id, title);
            } else {
              setSelectedRoom(null);
              navigate("/");
            }
          }}
          selected={selectedRoom?.id === id}
          onDelete={isChannel ? () => setOpenDeleteDialog(true) : undefined} // Open modal on delete click
          isChannel={isChannel} // Check if it's a channel to show delete option
        />
      </Link>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {`Leave Room "${title}"?`}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to leave the room "{title}"? You will no
            longer be part of this group.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={leaveRoom} color="secondary" autoFocus>
            Leave
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SidebarOption;
type SidebarOptionContainerProps = {
  selected?: boolean;
};

const SidebarOptionContainer = styled.div<SidebarOptionContainerProps>`
  cursor: pointer;
  padding: 5px 10px;
  display: flex;
  align-items: center;
  border-radius: 15px;
  user-select: none;
  width: 95%;
  gap: 10px;
  & > svg {
    color: white;
  }
  p {
    font-size: 12px;
    color: white;
    font-weight: 500;
  }
`;
