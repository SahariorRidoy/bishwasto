import { createSlice } from "@reduxjs/toolkit";

const userInfoSlice = createSlice({
  name: "userInfo",
  initialState: {
    userInfo: { is_shopOwner: true, is_employee: false },
  },
  reducers: {
    setUserInfo: (state, action) => {
      state.userInfo = action.payload;
    },
    clearUserInfo: (state) => {
      state.userInfo = null;
    },
  },
});

export default userInfoSlice.reducer;
export const { setUserInfo, clearUserInfo } = userInfoSlice.actions;
export const selectUserInfo = (state) => state.userInfo.userInfo;
