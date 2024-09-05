import React from "react";
import styled from "@emotion/styled";
import { Link, useNavigate } from "react-router-dom";
import classNames from "classnames";
import { useAppContext } from "../../redux/Context";

interface SidebarOptionProps {
  Icon: React.FC;
  title: string;
  haveAddOption?: boolean;
  isChannel?: boolean;
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
}: {
  title: string;
  Icon: React.FC;
  onClick: () => void;
  selected?: boolean;
  RightIcon?: React.FC;
}) => {
  return (
    <div
      className={classNames(
        "hover:bg-gray-500 rounded-md",
        selected && "bg-gray-600",
      )}
    >
      <SidebarOptionContainer onClick={onClick} selected={selected}>
        {Icon && <Icon />}
        <p>{title}</p>
        {RightIcon && <RightIcon />}
      </SidebarOptionContainer>
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

  return (
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
      />
    </Link>
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
