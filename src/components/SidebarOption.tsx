import React from 'react'
import styled from '@emotion/styled'
import { useOwnDispatch, useOwnSelector } from '..'
import { Link } from 'react-router-dom'
import { roomSelected } from '../redux/channelSlice'

interface SidebarOptionProps {
  Icon: React.FC
  title: string
  haveAddOption?: boolean
  isChannel?: boolean
  addChannel?: () => void
  selectChannel?: (roomId: string, roomTitle: string) => void
  id?: string
}
const SidebarOption: React.FC<SidebarOptionProps> = ({
  id = 'is not channel',
  Icon,
  title,
  haveAddOption = false,
  isChannel = false,
  addChannel,
  selectChannel,
}) => {
  const dispatch = useOwnDispatch()
  const selectedRoom = useOwnSelector((state) => state.channelSlice.selectedRoom)
  return (
    <Link to={`${id === 'is not channel' ? '/' : `/room/${id}`}`}>
      <SidebarOptionContainer
        selected={selectedRoom?.id === id}
        onClick={
          haveAddOption
            ? addChannel
            : isChannel && selectChannel && id
            ? () => selectChannel(id, title)
            : () => {
                dispatch(roomSelected({ id: '', title: '' }))
              }
        }>
        {Icon && <Icon />}
        <p>{title}</p>
      </SidebarOptionContainer>
    </Link>
  )
}

export default SidebarOption
type SidebarOptionContainerProps = {
  selected: boolean
}
const SidebarOptionContainer = styled.div<SidebarOptionContainerProps>`
  cursor: pointer;
  padding: 5px 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  & > svg {
    color: white;
  }
  p {
    font-size: 12px;
    color: white;
    font-weight: 500;
  }
  &:hover {
    opacity: 0.9;
    background: #340e36;
  }
  background: ${(props) => (props.selected ? '#340e36' : 'none')};
`
