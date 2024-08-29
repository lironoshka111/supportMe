import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import MessageIcon from "@mui/icons-material/Message";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import TagIcon from "@mui/icons-material/Tag";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { collection, query, where, doc, getDoc } from "firebase/firestore";
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
import { GroupMember, Room } from "../models";

interface SidebarProps {
  user: User;
}

const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const userRoomsQuery = query(
    collection(db, "groupMembers"),
    where("userId", "==", user.uid),
  );

  const [userRoomsSnapshot, loadingUserRooms, errorUserRooms] =
    useCollection(userRoomsQuery);

  const [isRoomsOpen, { toggle: toggleRooms }] = useBoolean(true);
  const [isFavoritesOpen, { toggle: toggleFavorites }] = useBoolean(true);
  const [newRoomModalOpen, setNewRoomModalOpen] = useBoolean(false);
  const [open, setOpen] = useState(false);
  const [roomsData, setRoomsData] = useState<Map<string, Room>>(new Map());
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
    if (loadingUserRooms || !userRoomsSnapshot?.size) return;

    // Fetch room details based on userRoomsSnapshot
    const fetchRoomDetails = async () => {
      const roomsMap = new Map<string, Room>();

      for (const memberDoc of userRoomsSnapshot.docs) {
        const memberData = memberDoc.data() as GroupMember;
        const roomRef = doc(db, "rooms", memberData.roomId);
        const roomDoc = await getDoc(roomRef);

        if (roomDoc) {
          roomsMap.set(memberData.roomId, roomDoc.data() as Room);
        }
      }

      setRoomsData(roomsMap);
    };

    fetchRoomDetails();
    setOpen(true);
  }, [userRoomsSnapshot, loadingUserRooms]);

  const selectChannel = (roomId: string) => {
    setSelectedRoom({
      id: roomId,
      title: roomsData.get(roomId)?.roomTitle || "Unnamed Room",
      linkToData: roomsData.get(roomId)?.additionalDataLink,
    });
    navigate(`/room/${roomId}`);
  };

  return (
    <>
      <SidebarContainer>
        {errorUserRooms && (
          <AlertWrapper>
            <Alert variant="filled" severity="error">
              <AlertTitle sx={{ fontSize: "14px", fontWeight: 700 }}>
                Error occurred
              </AlertTitle>
              <p>Something went wrong, please check if all is right!</p>
            </Alert>
          </AlertWrapper>
        )}
        {loadingUserRooms && (
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
            title={"Your Rooms"}
          />
          {isRoomsOpen &&
            userRoomsSnapshot?.docs.map((memberDoc) => {
              const memberData = memberDoc.data() as GroupMember;
              const roomData = roomsData.get(memberData.roomId);
              return (
                <SidebarOption
                  key={memberData?.roomId}
                  id={memberData?.roomId}
                  Icon={TagIcon}
                  title={roomData?.roomTitle || "Unnamed Room"}
                  isChannel={true}
                  selectChannel={() => selectChannel(memberData.roomId)}
                />
              );
            })}
        </SidebarOptionList>

        <SidebarOptionList>
          <OptionContainer
            RightIcon={StarBorderIcon}
            onClick={toggleFavorites}
            Icon={isFavoritesOpen ? KeyboardArrowDownIcon : KeyboardArrowUpIcon}
            title={"Favorites"}
          />
          {isFavoritesOpen &&
            userRoomsSnapshot?.docs
              .filter((doc) => (doc.data() as GroupMember).isFavorite)
              .map((favDoc) => {
                const favData = favDoc.data() as GroupMember;
                const roomData = roomsData.get(favData.roomId);

                return (
                  <SidebarOption
                    key={favData?.roomId}
                    id={favData?.roomId}
                    Icon={TagIcon}
                    title={roomData?.roomTitle || "Unnamed Favorite"}
                    isChannel={true}
                    selectChannel={() => selectChannel(favData.roomId)}
                  />
                );
              })}
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
  background: var(--bar-color);
  height: 100%;
  overflow-y: auto;
  resize: horizontal;
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
  padding: 5px 0;
`;
