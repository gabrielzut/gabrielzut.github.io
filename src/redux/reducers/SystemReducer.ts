import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SystemState {
  bootScreenVisible: boolean;
  volume: number;
}

const initialState: SystemState = {
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
  },
});

export const { showBootScreen, hideBootScreen } = systemSlice.actions;

export default systemSlice.reducer;
