import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Program } from "../../components/general/Program";
import { GenerateUUID } from "../../utils/generators";
import { TopBar } from "../../components/programs/TopBar";
import React from "react";
import { VolumeTrayIcon } from "../../components/programs/VolumeTrayIcon";
import { warnProgramEntry } from "../../components/programs/Warn";
import { fileExplorerEntry } from "../../components/programs/FileExplorer";

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
      warnProgramEntry.name,
      warnProgramEntry.component,
      true,
      undefined,
      warnProgramEntry.defaultX,
      warnProgramEntry.defaultY,
      true,
      warnProgramEntry.icon
    ),
    new Program(
      GenerateUUID(),
      fileExplorerEntry.name,
      fileExplorerEntry.component,
      true,
      undefined,
      fileExplorerEntry.defaultX,
      fileExplorerEntry.defaultY,
      true,
      fileExplorerEntry.icon,
      false,
      fileExplorerEntry.defaultWidth,
      fileExplorerEntry.defaultHeight
    ),
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