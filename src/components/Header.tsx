import styled from '@emotion/styled'
import { Avatar } from '@mui/material'
import React from 'react'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import SearchIcon from '@mui/icons-material/Search'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import { signOut, User } from 'firebase/auth'
import { auth } from '../firebase'

interface HeaderProps {
  user : User
}
const Header: React.FC<HeaderProps> = ({user}) => {
  return (
    <HeaderContainer>
      <HeaderLeft>
        <HeaderAvatar onClick={() => signOut(auth)} src={user.photoURL as string}/>
        <AccessTimeIcon />
      </HeaderLeft>

      <HeaderSearch>
        <SearchIcon />
        <input type="text" placeholder="Search your channel" />
      </HeaderSearch>

      <HeaderRight>
        <HelpOutlineIcon />
      </HeaderRight>
    </HeaderContainer>
  )
}

export default Header

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px 0px;
  background: var(--slack-color);
`
const HeaderLeft = styled.div`
  flex: 0.3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  & > svg {
    cursor: pointer;
    color: white;
    margin-right: 30px;
  }
`

const HeaderSearch = styled.div`
  flex: 0.4;
  display: flex;
  align-items: center;
  border: 1px solid gray;
  border-radius: 5px;
  background: #421f44;
  & > svg {
    color: gray;
    margin-left: 60px;
  }
  & > input {
    outline: none;
    background: none;
    border: none;
    text-align: center;
    width: 100%;
    color: white;
    margin-right: 60px;
  }
`
const HeaderRight = styled.div`
  flex: 0.3;
  display: flex;
  justify-content: flex-end;
  & > svg {
    cursor: pointer;
    color: white;
    margin-right: 20px;
  }
`
const HeaderAvatar = styled(Avatar)`
  margin-left: 20px;
  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
`
