import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SelectedRoomType } from "./types";

const channelSlice = createSlice({
  name: "channelSlice",
  initialState: {
    selectedRoom: null as null | SelectedRoomType,
  },
  reducers: {
    roomSelected: (state, action: PayloadAction<SelectedRoomType>) => {
      state.selectedRoom = action.payload;
    },
    setFavorite: (state, action: PayloadAction<boolean>) => {
      if (state.selectedRoom) {
        state.selectedRoom.favorite = action.payload;
      }
    },
  },
});

export default channelSlice.reducer;
export const { roomSelected, setFavorite } = channelSlice.actions;
