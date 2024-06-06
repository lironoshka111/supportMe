// Define the types for the state and actions
// Define the types for the state and actions
export interface SelectedRoomType {
  id: string;
  title: string;
  linkToData?: string;
  favorite?: boolean;
}

export interface UserType {
  [key: string]: any;
}

export interface StateType {
  user: UserType | null;
  selectedRoom: SelectedRoomType | null;
}

export interface ReduxContextType extends StateType {
  setSelectedRoom: (room: SelectedRoomType) => void;
  setFavorite: (favorite: boolean) => void;
  login: (user: UserType) => void;
  logout: () => void;
}

// Define the initial state
export const initialState: StateType = {
  user: null,
  selectedRoom: null,
};
