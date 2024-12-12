import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Program } from "../../components/general/Program";
import { GenerateUUID } from "../../utils/generators";
import { TopBar } from "../../components/programs/TopBar";
import React from "react";
import { VolumeTrayIcon } from "../../components/programs/VolumeTrayIcon";
import { warnProgramEntry } from "../../components/programs/MessageWindow";
import { terminalEntry } from "../../components/programs/Terminal";

export interface ProcessManagerState {
  programs: Program<any>[];
  currentZIndex: number;
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
      false,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      true
    ),
    new Program(
      GenerateUUID(),
      "VolumeDaemon",
      React.Fragment,
      false,
      VolumeTrayIcon,
      0,
      0,
      false,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      true
    ),
    Program.of(terminalEntry),
    Program.of({
      ...warnProgramEntry,
      props: { text: "Under construction!", type: "warn" },
    }),
  ],
  currentZIndex: 1,
};

export const processManagerSlice = createSlice({
  name: "processManager",
  initialState,
  reducers: {
    addProgram: (state, action: PayloadAction<Program<any>>) => {
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
    incrementZIndex: (state) => {
      state.currentZIndex++;
    },
  },
});

export const {
  addProgram,
  closeProgram,
  minimizeProgram,
  showProgram,
  incrementZIndex,
} = processManagerSlice.actions;

export default processManagerSlice.reducer;
