// reduxStateContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  initialState,
  ReduxContextType,
  SelectedRoomType,
  StateType,
  UserType,
} from "./types";

// Create the context
const ReduxContext = createContext<ReduxContextType | undefined>(undefined);

// Create a custom hook to use the Redux context
export const useRedux = (): ReduxContextType => {
  const context = useContext(ReduxContext);
  if (context === undefined) {
    throw new Error("useRedux must be used within a ReduxProvider");
  }
  return context;
};

// Create the provider component
interface ReduxProviderProps {
  children: ReactNode;
}

export const ReduxProvider: React.FC<ReduxProviderProps> = ({ children }) => {
  const [state, setState] = useState<StateType>(initialState);

  const roomSelected = (room: SelectedRoomType) => {
    setState((prevState) => ({ ...prevState, selectedRoom: room }));
  };

  const setFavorite = (favorite: boolean) => {
    setState((prevState) => ({
      ...prevState,
      selectedRoom: prevState.selectedRoom
        ? { ...prevState.selectedRoom, favorite }
        : null,
    }));
  };

  const login = (user: UserType) => {
    setState((prevState) => ({ ...prevState, user }));
  };

  const logout = () => {
    setState((prevState) => ({ ...prevState, user: null }));
  };

  return (
    <ReduxContext.Provider
      value={{
        ...state,
        roomSelected,
        setFavorite,
        login,
        logout,
        selectedRoom: state.selectedRoom,
      }}
    >
      {children}
    </ReduxContext.Provider>
  );
};
