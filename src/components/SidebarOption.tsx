import React, { useEffect } from "react";
import styled from "@emotion/styled";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useRedux } from "../redux/reduxStateContext";
import classNames from "classnames";

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
        selected && "bg-gray-400",
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
  let location = useLocation();
  const { pathname } = location;

  // Extracting parameters from pathname
  const params = pathname.split("/");

  // Extracting parameter values from params array
  const roomId = params[params.length - 1]; // Assuming roomId is the last segment of the path

  const { selectedRoom, setSelectedRoom } = useRedux();
  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedRoom?.id) {
      navigate("/");
    }
  }, [selectedRoom?.id, navigate]);

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
            setSelectedRoom({
              id: "",
              title: "",
            });
            navigate("/");
          }
        }}
        selected={roomId === id}
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
