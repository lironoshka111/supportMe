import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import CreateIcon from "@mui/icons-material/Create";
import SidebarOption, { OptionContainer } from "./SidebarOption";
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
  const [open, setOpen] = useState(false);
  const { roomSelected } = useRedux();

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
    roomSelected({
      id: roomId,
      title: roomTitle,
    });
  };
  return (
    <>
      <SidebarContainer>
        {(error || errorFavorites) && (
          <AlertWrapper>
            <Alert variant="filled" severity="error">
              <AlertTitle sx={{ fontSize: "14px", fontWeight: 700 }}>
                Error occured
              </AlertTitle>
              <p>Something went wrong , please check if all is right!</p>
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
                Just wait a second , we need to load something for your comfort
              </p>
            </Alert>
          </AlertWrapper>
        )}
        <SidebarTop>
          <SidebarInfo>
            <h4>AttachedSoul HQ</h4>
            <p>
              <FiberManualRecordIcon
                sx={{ fontSize: "14px", color: "green" }}
              />
              {user.displayName}
            </p>
          </SidebarInfo>
          <CreateIcon
            sx={{ background: "white", padding: "5px", borderRadius: "17px" }}
          />
        </SidebarTop>

        <SidebarOptionList>
          <SidebarOption Icon={MessageIcon} title={"Replies"} />
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
          {isRoomsOpen &&
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
