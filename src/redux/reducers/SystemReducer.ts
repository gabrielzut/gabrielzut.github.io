import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SystemState {
  bootScreenVisible: boolean;
  volume: number;
  isShuttingDown: boolean;
}

const initialState: SystemState = {
  isShuttingDown: false,
  bootScreenVisible: false,
  volume: 100,
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
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = action.payload;
    },
    shutDownSystem: (state) => {
      state.isShuttingDown = true;
    },
    bootSystem: (state) => {
      state.isShuttingDown = false;
    },
  },
});

export const {
  showBootScreen,
  hideBootScreen,
  setVolume,
  shutDownSystem,
  bootSystem,
} = systemSlice.actions;

export default systemSlice.reducer;
