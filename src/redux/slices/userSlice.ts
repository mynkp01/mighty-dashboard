// src/redux/slices/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = null;

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (_state, action: PayloadAction) => {
      return action.payload;
    },
    logout: () => initialState,
  },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;
