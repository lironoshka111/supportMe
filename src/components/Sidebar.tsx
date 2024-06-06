import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import MessageIcon from "@mui/icons-material/Message";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import TagIcon from "@mui/icons-material/Tag";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { collection } from "firebase/firestore";
import { db } from "../firebase";
import { useCollection } from "react-firebase-hooks/firestore";
import { AlertWrapper } from "./utilities/components";
import Alert from "@mui/material/Alert";
import { AlertTitle, Snackbar } from "@mui/material";
import { User } from "firebase/auth";
import { useBoolean } from "ahooks";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { useRedux } from "../redux/reduxStateContext";
import GroupFormModal from "./GroupFormModal";
import { useNavigate } from "react-router-dom";
import SidebarOption, { OptionContainer } from "./SidebarOption";

interface SidebarProps {
  user: User;
}

const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const [snapshot, loading, error] = useCollection(collection(db, "rooms"));
  const [snapshotFavorites, isLoadingFavorites, errorFavorites] = useCollection(
    collection(db, "favorites"),
  );
  const [isRoomsOpen, { toggle: toggleRooms }] = useBoolean(true);
  const [isFavoritesOpen, { toggle: toggleFavorites }] = useBoolean(true);
  const [newRoomModalOpen, setNewRoomModalOpen] = useBoolean(false);
  const [open, setOpen] = useState(false);
  const { setSelectedRoom } = useRedux();
  const navigate = useNavigate();

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  useEffect(() => {
    if (loading || !snapshot?.size) return;
    setOpen(true);
  }, [snapshot]);

  const selectChannel = (roomId: string, roomTitle: string) => {
    setSelectedRoom({
      id: roomId,
      title: roomTitle,
    });
    navigate(`/room/${roomId}`);
  };

  return (
    <>
      <SidebarContainer>
        {(error || errorFavorites) && (
          <AlertWrapper>
            <Alert variant="filled" severity="error">
              <AlertTitle sx={{ fontSize: "14px", fontWeight: 700 }}>
                Error occurred
              </AlertTitle>
              <p>Something went wrong, please check if all is right!</p>
            </Alert>
          </AlertWrapper>
        )}
        {(loading || isLoadingFavorites) && (
          <AlertWrapper>
            <Alert variant="filled" severity="info">
              <AlertTitle sx={{ fontSize: "14px", fontWeight: 700 }}>
                Loading...
              </AlertTitle>
              <p>
                Just wait a second, we need to load something for your comfort
              </p>
            </Alert>
          </AlertWrapper>
        )}
        <SidebarTop>
          <SidebarInfo>
            <p>
              <FiberManualRecordIcon
                sx={{ fontSize: "16px", color: "green" }}
              />
              {user.displayName}
            </p>
          </SidebarInfo>
        </SidebarTop>

        <SidebarOptionList>
          <OptionContainer
            Icon={MessageIcon}
            title={"Add New Group"}
            onClick={setNewRoomModalOpen.setTrue}
          />
        </SidebarOptionList>

        <SidebarOptionList>
          <OptionContainer
            onClick={toggleRooms}
            Icon={isRoomsOpen ? KeyboardArrowDownIcon : KeyboardArrowUpIcon}
            title={"Recent Rooms"}
          />
          {isRoomsOpen &&
            snapshot?.docs.map((roomDoc) => (
              <SidebarOption
                key={roomDoc.id}
                id={roomDoc.id}
                Icon={TagIcon}
                title={roomDoc.data().name as string}
                isChannel={true}
                selectChannel={selectChannel}
              />
            ))}
        </SidebarOptionList>

        <SidebarOptionList>
          <OptionContainer
            RightIcon={StarBorderIcon}
            onClick={toggleFavorites}
            Icon={isFavoritesOpen ? KeyboardArrowDownIcon : KeyboardArrowUpIcon}
            title={"Favorites"}
          />
          {isFavoritesOpen &&
            snapshotFavorites?.docs
              .filter((doc) => doc.data().active)
              .map((roomDoc) => (
                <SidebarOption
                  key={roomDoc.data().roomId as string}
                  id={roomDoc.data().roomId as string}
                  Icon={TagIcon}
                  title={roomDoc.data().title as string}
                  isChannel={true}
                  selectChannel={selectChannel}
                />
              ))}
        </SidebarOptionList>
      </SidebarContainer>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert
          onClose={handleClose}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Room selected successfully!
        </Alert>
      </Snackbar>
      <GroupFormModal
        open={newRoomModalOpen}
        setOpen={setNewRoomModalOpen.set}
      />
    </>
  );
};

export default Sidebar;

const SidebarContainer = styled.div`
  width: 260px;
  display: flex;
  flex-direction: column;
  background: var(--slack-color);
  height: 100%;
  overflow-y: auto; /* Add inner scrolling */
`;

const SidebarTop = styled.div`
  display: flex;
  padding: 10px;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #49274b;
  border-top: 1px solid #49274b;
  & > svg {
    cursor: pointer;
  }
`;
const SidebarInfo = styled.div`
  display: flex;
  flex-direction: column;
  color: white;
  & > h4 {
    font-size: 14px;
  }
  & > p {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 12px;
  }
`;
const SidebarOptionList = styled.div`
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #49274b;
  gap: 2px;
  padding: 5px 0px;
`;
