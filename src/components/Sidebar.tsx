import React from 'react'
import styled from '@emotion/styled'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import CreateIcon from '@mui/icons-material/Create'
import SidebarOption from './SidebarOption'
import MessageIcon from '@mui/icons-material/Message'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import InboxIcon from '@mui/icons-material/Inbox'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import DraftsIcon from '@mui/icons-material/Drafts'
import GroupIcon from '@mui/icons-material/Group'
import FileCopyIcon from '@mui/icons-material/FileCopy'
import TagIcon from '@mui/icons-material/Tag'
import AppsIcon from '@mui/icons-material/Apps'
import AddIcon from '@mui/icons-material/Add'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { addDoc, collection } from 'firebase/firestore'
import { db } from '../firebase'
import { useOwnDispatch } from '..'
import { roomSelected } from '../redux/channelSlice'
import { useCollection } from 'react-firebase-hooks/firestore'
import { AlertWrapper } from './utilities/components'
import Alert from '@mui/material/Alert'
import { AlertTitle } from '@mui/material'
import { User } from 'firebase/auth'

interface SidebarProps {
  user: User
}
const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const [snapshot, loading, error] = useCollection(collection(db, 'rooms'))
  const dispatch = useOwnDispatch()
  const addChannel = async () => {
    const name = prompt('Enter room name')
      if(!name) return
    await addDoc(collection(db, 'rooms'), {
      name,
    })
  }
  const selectChannel = (roomId: string, roomTitle: string) => {
    dispatch(
      roomSelected({
        id: roomId,
        title: roomTitle,
      }),
    )
  }
  return (
    <SidebarContainer>
      {error && (
        <AlertWrapper>
          <Alert variant="filled" severity="error">
            <AlertTitle sx={{ fontSize: '14px', fontWeight: 700 }}>Error occured</AlertTitle>
            <p>Something went wrong , please check if all is right!</p>
          </Alert>
        </AlertWrapper>
      )}
      {loading && (
        <AlertWrapper>
          <Alert variant="filled" severity="info">
            <AlertTitle sx={{ fontSize: '14px', fontWeight: 700 }}>Loading...</AlertTitle>
            <p>Just wait a second , we need to load something for your comfort</p>
          </Alert>
        </AlertWrapper>
      )}
      <SidebarTop>
        <SidebarInfo>
          <h4>AttachedSoul HQ</h4>
          <p>
            <FiberManualRecordIcon sx={{ fontSize: '14px', color: 'green' }} />
            {user.displayName}
          </p>
        </SidebarInfo>
        <CreateIcon sx={{ background: 'white', padding: '5px', borderRadius: '17px' }} />
      </SidebarTop>

      <SidebarOptionList>
        <SidebarOption Icon={MessageIcon} title={'Replies'} />
      </SidebarOptionList>

      <SidebarOptionList>
        <SidebarOption Icon={KeyboardArrowDownIcon} title={'Rooms'} />
      </SidebarOptionList>

      <SidebarOptionList>
        <SidebarOption
          Icon={AddIcon}
          title={'Add Room'}
          haveAddOption={true}
          addChannel={addChannel}
        />
        {snapshot?.docs.map((roomDoc) => (
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
    </SidebarContainer>
  )
}

export default Sidebar

const SidebarContainer = styled.div`
  flex: 0.15;
  display: flex;
  flex-direction: column;
  background: var(--slack-color);
  height: 100%;
`
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
`
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
`
const SidebarOptionList = styled.div`
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #49274b;
  padding: 10px 0px;
`
