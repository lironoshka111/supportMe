import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import MessageIcon from "@mui/icons-material/Message";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import TagIcon from "@mui/icons-material/Tag";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { collection, doc, getDoc, query, where } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { useCollection } from "react-firebase-hooks/firestore";
import { AlertWrapper } from "../utilities/components";
import Alert from "@mui/material/Alert";
import { AlertTitle, Snackbar } from "@mui/material";
import { signOut, User } from "firebase/auth";
import { useBoolean } from "ahooks";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import CreateGroupFormModal from "../Modals/CreateGroupFormModal";
import { useLocation, useNavigate } from "react-router-dom";
import SidebarOption, { OptionContainer } from "./SidebarOption";
import { GroupMember, Room } from "../../types/models";
import { useAppContext } from "../../redux/Context";
import { AddCircle } from "@mui/icons-material";
import { GroupSearchModal } from "../Modals";
import LogoutIcon from "@mui/icons-material/Logout";
import { isString } from "../../utils/utils";

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
  const [open, setOpen] = useState(false);
  const [roomsData, setRoomsData] = useState<Map<string, Room>>(new Map());
  const {
    setSelectedRoom,
    selectedRoom,
    setNewRoomModalOpen,
    setGroupSearchModalOpen,
    newRoomModalOpen,
    groupSearchModalOpen,
    setIsDrawerOpen,
  } = useAppContext();
  const navigate = useNavigate();
  let location = useLocation();
  const { pathname } = location;

  // Extracting parameters from pathname
  const params = pathname.split("/");

  // Extracting parameter values from params array
  const roomId = params[params.length - 1]; // Assuming roomId is the last segment of the path

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
        if (!isString(memberData.roomId)) continue;
        const roomRef = doc(db, "rooms", memberData.roomId);
        const roomDoc = await getDoc(roomRef);

        if (roomDoc) {
          roomsMap.set(memberData.roomId, roomDoc.data() as Room);
        }
      }

      setRoomsData(roomsMap);
    };

    fetchRoomDetails();
  }, [userRoomsSnapshot, loadingUserRooms, roomId]);

  const getRoomData = (roomId: string) => {
    return {
      id: roomId,
      title: roomsData.get(roomId)?.roomTitle || "Unnamed Room",
      linkToData: roomsData.get(roomId)?.additionalDataLink,
      favorite: userRoomsSnapshot?.docs
        .find((doc) => (doc.data() as GroupMember).roomId === roomId)
        ?.data().isFavorite,
      onlineMeetingUrl: roomsData.get(roomId)?.meetingUrl,
    };
  };

  const selectChannel = (roomId: string) => {
    setSelectedRoom(getRoomData(roomId));
    setIsDrawerOpen(false);
    navigate(`/room/${roomId}`);
  };

  useEffect(() => {
    if (!roomsData.size) return;
    if (roomId && roomsData.has(roomId)) {
      selectedRoom?.id !== roomId && selectChannel(roomId);
    } else {
      navigate("/");
      setSelectedRoom(null);
    }
  }, [roomsData]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <>
      <SidebarContainer className="bg-sidebar-color grow shrink-0">
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
            Icon={AddCircle}
            title={"Join To Group"}
            onClick={() => setGroupSearchModalOpen(true)}
          />
        </SidebarOptionList>

        <SidebarOptionList>
          <OptionContainer
            Icon={MessageIcon}
            title={"Add New Group"}
            onClick={() => setNewRoomModalOpen(true)}
          />
        </SidebarOptionList>

        <SidebarOptionList>
          <OptionContainer
            onClick={toggleRooms}
            Icon={isRoomsOpen ? KeyboardArrowDownIcon : KeyboardArrowUpIcon}
            title={"Your Rooms"}
          />
          {isRoomsOpen &&
            userRoomsSnapshot?.docs
              .filter((data) => {
                const memberData = data.data() as GroupMember;
                return isString(memberData.roomId);
              })
              .map((memberDoc) => {
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
        <SidebarOptionList>
          <OptionContainer
            Icon={LogoutIcon}
            title={"Logout"}
            onClick={handleLogout}
          />
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
      {newRoomModalOpen && (
        <CreateGroupFormModal
          open={newRoomModalOpen}
          setOpen={setNewRoomModalOpen}
        />
      )}
      {groupSearchModalOpen && (
        <GroupSearchModal
          open={groupSearchModalOpen}
          setOpen={setGroupSearchModalOpen}
        />
      )}
    </>
  );
};

export default Sidebar;

const SidebarContainer = styled.div`
  width: 260px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 100%;
  overflow-y: auto;
  resize: horizontal;
  border-radius: 0 16px 16px 0;
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
