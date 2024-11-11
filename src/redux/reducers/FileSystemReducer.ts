import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GeneralFile, Folder } from "../../model/file";
import { findFolder } from "../../utils/filesystemUtils";

export interface ProcessManagerState {
  root: GeneralFile;
}

const initialState: ProcessManagerState = {
  root: {
    name: "/",
    size: 0,
    type: "folder",
    files: [
      {
        name: "bin",
        size: 0,
        type: "folder",
        files: [],
      },
      {
        name: "etc",
        size: 0,
        type: "folder",
        files: [],
      },
      {
        name: "sbin",
        size: 0,
        type: "folder",
        files: [],
      },
      {
        name: "usr",
        size: 0,
        type: "folder",
        files: [],
      },
      {
        name: "var",
        size: 0,
        type: "folder",
        files: [],
      },
      {
        name: "dev",
        size: 0,
        type: "folder",
        files: [],
      },
      {
        name: "home",
        size: 0,
        type: "folder",
        files: [
          {
            name: "user",
            size: 0,
            type: "folder",
            files: [
              {
                name: "Documents",
                size: 0,
                type: "folder",
                files: [],
              },
              {
                name: "Downloads",
                size: 0,
                type: "folder",
                files: [],
              },
              {
                name: "Images",
                size: 0,
                type: "folder",
                files: [],
              },
              {
                name: "Music",
                size: 0,
                type: "folder",
                files: [],
              },
              {
                name: "Public",
                size: 0,
                type: "folder",
                files: [],
              },
              {
                name: "Videos",
                size: 0,
                type: "folder",
                files: [],
              },
            ],
          },
        ],
      },
      {
        name: "lib",
        size: 0,
        type: "folder",
        files: [],
      },
      {
        name: "mnt",
        size: 0,
        type: "folder",
        files: [],
      },
      {
        name: "opt",
        size: 0,
        type: "folder",
        files: [],
      },
      {
        name: "proc",
        size: 0,
        type: "folder",
        files: [],
      },
      {
        name: "root",
        size: 0,
        type: "folder",
        files: [],
      },
    ],
  },
};

export const fileSystemReducerSlice = createSlice({
  name: "fileSystem",
  initialState,
  reducers: {
    addFile: (
      state,
      {
        payload: { file, path },
      }: PayloadAction<{ file: GeneralFile; path: string[] }>
    ) => {
      const targetFolder = findFolder(state.root as Folder, path);

      if (targetFolder) {
        targetFolder.files.push(file);
      }
    },
  },
});

export const { addFile } = fileSystemReducerSlice.actions;

export default fileSystemReducerSlice.reducer;
