import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const userSlice = createSlice({
  name: 'userSlice',
  initialState: { user: null as null | {} },
  reducers: {
    login: (state, action: PayloadAction<{}>) => {
      state.user = action.payload
    },
    logout: (state) => {
      state.user = null
    },
  },
})

export default userSlice.reducer
export const { login, logout } = userSlice.actions
