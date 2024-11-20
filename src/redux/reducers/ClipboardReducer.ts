import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ClipboardState {
  copiedValue: string;
  setForDeletion: boolean;
}

const initialState: ClipboardState = {
  copiedValue: "",
  setForDeletion: false,
};

export const clipboardSlice = createSlice({
  name: "system",
  initialState,
  reducers: {
    copy: (state, { payload }: PayloadAction<string>) => {
      state.copiedValue = payload;
      state.setForDeletion = false;
    },
    cut: (state, { payload }: PayloadAction<string>) => {
      state.copiedValue = payload;
      state.setForDeletion = true;
    },
    paste: (state) => {
      state.setForDeletion = false;
    },
  },
});

export const { copy, paste, cut } = clipboardSlice.actions;

export default clipboardSlice.reducer;
