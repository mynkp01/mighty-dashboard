import { createSlice } from '@reduxjs/toolkit';

interface RootState {
  setIsLoading: boolean;
}

const initialState: RootState = {
  setIsLoading: false,
};

const LoadingSlice = createSlice({
  name: 'setIsLoading',
  initialState,
  reducers: {
    setIsLoading: (state, action) => {
      state.setIsLoading = action?.payload;
    },
  },
});

export const { setIsLoading } = LoadingSlice.actions;
export default LoadingSlice.reducer;
