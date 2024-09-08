// Context.tsx
import React, { createContext, ReactNode, useContext, useState } from "react";

export interface SelectedRoomType {
  id: string;
  title: string;
  linkToData?: string;
  favorite?: boolean;
  onlineMeetingUrl?: string;
}

interface ContextProps {
  selectedRoom: SelectedRoomType | null;
  setSelectedRoom: (room: SelectedRoomType | null) => void;
  setFavorite: (favorite: boolean) => void;
  groupSearchModalOpen: boolean;
  setGroupSearchModalOpen: (open: boolean) => void;
  newRoomModalOpen: boolean;
  setNewRoomModalOpen: (open: boolean) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
}

const AppContext = createContext<ContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [selectedRoom, setSelectedRoomState] =
    useState<SelectedRoomType | null>(null);
  const [newRoomModalOpen, setNewRoomModalOpen] = useState(false);
  const [groupSearchModalOpen, setGroupSearchModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Drawer state

  const setSelectedRoom = (room: SelectedRoomType | null) => {
    setSelectedRoomState(room);
  };

  const setFavorite = (favorite: boolean) => {
    if (selectedRoom) {
      setSelectedRoomState({ ...selectedRoom, favorite });
    }
  };

  return (
    <AppContext.Provider
      value={{
        selectedRoom,
        setSelectedRoom,
        setFavorite,
        groupSearchModalOpen,
        setGroupSearchModalOpen,
        newRoomModalOpen,
        setNewRoomModalOpen,
        isDrawerOpen,
        setIsDrawerOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): ContextProps => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
