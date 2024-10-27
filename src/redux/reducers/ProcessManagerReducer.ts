import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Program } from "../../components/general/Program";
import { GenerateUUID } from "../../utils/Generators";
import { TopBar } from "../../components/programs/TopBar";
import React from "react";
import { VolumeTrayIcon } from "../../components/programs/VolumeTrayIcon";
import Warn from "../../components/programs/Warn";

export interface ProcessManagerState {
  programs: Program[];
}

const initialState: ProcessManagerState = {
  programs: [
    new Program(GenerateUUID(), "TopBar", TopBar, false),
    new Program(
      GenerateUUID(),
      "VolumeDaemon",
      React.Fragment,
      false,
      VolumeTrayIcon
    ),
    new Program(
      GenerateUUID(),
      "Warning",
      Warn,
      true,
      undefined,
      window.innerWidth / 2 - 75,
      window.innerHeight / 2 - 75
    ),
  ],
};

export const processManagerSlice = createSlice({
  name: "processManager",
  initialState,
  reducers: {
    addProgram: (state, action: PayloadAction<Program>) => {
      state.programs.push(action.payload);
    },
    closeProgram: (state, action: PayloadAction<string>) => {
      state.programs = state.programs.filter(
        (program) => program.id !== action.payload
      );
    },
  },
});

export const { addProgram, closeProgram } = processManagerSlice.actions;

export default processManagerSlice.reducer;
