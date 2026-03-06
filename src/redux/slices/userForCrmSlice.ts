import { createSlice } from '@reduxjs/toolkit';

interface RootState {
  userForCrm: undefined;
}

const initialState: RootState = {
  userForCrm: undefined,
};

const CrmUserSlice = createSlice({
  name: 'userForCrm',
  initialState,
  reducers: {
    setUserForCrm: (state, action) => {
      state.userForCrm = action?.payload;
    },
  },
});

export const { setUserForCrm } = CrmUserSlice.actions;
export default CrmUserSlice.reducer;
