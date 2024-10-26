import { createSlice } from "@reduxjs/toolkit";

export interface SystemState {
  bootScreenVisible: boolean;
}

const initialState: SystemState = {
  bootScreenVisible: false,
};

export const systemSlice = createSlice({
  name: "system",
  initialState,
  reducers: {
    showBootScreen: (state) => {
      state.bootScreenVisible = true;
    },
    hideBootScreen: (state) => {
      state.bootScreenVisible = false;
    },
  },
});

export const { showBootScreen, hideBootScreen } = systemSlice.actions;

export default systemSlice.reducer;
