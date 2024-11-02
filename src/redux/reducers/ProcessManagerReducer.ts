import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Program } from "../../components/general/Program";
import { GenerateUUID } from "../../utils/generators";
import { TopBar } from "../../components/programs/TopBar";
import React from "react";
import { VolumeTrayIcon } from "../../components/programs/VolumeTrayIcon";
import Warn, { warnIcon } from "../../components/programs/Warn";

export interface ProcessManagerState {
  programs: Program[];
}

const initialState: ProcessManagerState = {
  programs: [
    new Program(
      GenerateUUID(),
      "TopBar",
      TopBar,
      false,
      undefined,
      0,
      0,
      false
    ),
    new Program(
      GenerateUUID(),
      "VolumeDaemon",
      React.Fragment,
      false,
      VolumeTrayIcon,
      0,
      0,
      false
    ),
    new Program(
      GenerateUUID(),
      "Warning",
      Warn,
      true,
      undefined,
      window.innerWidth / 2 - 75,
      window.innerHeight / 2 - 75,
      true,
      warnIcon
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
    minimizeProgram: (state, action: PayloadAction<string>) => {
      state.programs = state.programs.map((program) => {
        if (program.id === action.payload) program.minimized = true;
        return program;
      });
    },
    showProgram: (state, action: PayloadAction<string>) => {
      state.programs = state.programs.map((program) => {
        if (program.id === action.payload) program.minimized = false;
        return program;
      });
    },
  },
});

export const { addProgram, closeProgram, minimizeProgram, showProgram } =
  processManagerSlice.actions;

export default processManagerSlice.reducer;
