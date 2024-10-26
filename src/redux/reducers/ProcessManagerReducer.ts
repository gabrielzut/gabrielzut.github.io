import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Program } from "../../components/general/Program";
import { GenerateUUID } from "../../utils/Generators";
import { TopBar } from "../../components/programs/TopBar";

export interface ProcessManagerState {
  programs: Program[];
}

const initialState: ProcessManagerState = {
  programs: [new Program(GenerateUUID(), "TopBar", TopBar, false)],
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
