import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GeneralFile, Folder } from "../../model/file";
import { findFolder } from "../../utils/filesystemUtils";
import { defaultBinaries } from "../../utils/binaries";
import executableIcon from "../../assets/img/executable.png";

export interface ProcessManagerState {
  root: GeneralFile;
}

const initialState: ProcessManagerState = {
  root: {
    name: "/",
    type: "folder",
    files: [
      {
        name: "bin",
        type: "folder",
        files: [
          ...defaultBinaries.map((binary) => ({
            name: binary.name,
            type: "file",
            content: binary.executable.toString(),
            command: binary.executable,
            icon: executableIcon,
          })),
        ],
      },
      {
        name: "etc",
        type: "folder",
        files: [],
      },
      {
        name: "sbin",
        type: "folder",
        files: [],
      },
      {
        name: "usr",
        type: "folder",
        files: [],
      },
      {
        name: "var",
        type: "folder",
        files: [],
      },
      {
        name: "dev",
        type: "folder",
        files: [],
      },
      {
        name: "home",
        type: "folder",
        files: [
          {
            name: "user",
            type: "folder",
            files: [
              {
                name: ".local",
                type: "folder",
                files: [
                  {
                    name: "share",
                    type: "folder",
                    files: [
                      {
                        name: "Trash",
                        type: "folder",
                        files: [],
                      },
                    ],
                  },
                ],
              },
              {
                name: "Documents",
                type: "folder",
                files: [],
              },
              {
                name: "Downloads",
                type: "folder",
                files: [],
              },
              {
                name: "Images",
                type: "folder",
                files: [],
              },
              {
                name: "Music",
                type: "folder",
                files: [],
              },
              {
                name: "Public",
                type: "folder",
                files: [],
              },
              {
                name: "Videos",
                type: "folder",
                files: [],
              },
            ],
          },
        ],
      },
      {
        name: "lib",
        type: "folder",
        files: [],
      },
      {
        name: "mnt",
        type: "folder",
        files: [],
      },
      {
        name: "opt",
        type: "folder",
        files: [],
      },
      {
        name: "proc",
        type: "folder",
        files: [],
      },
      {
        name: "root",
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
    deleteFile: (state, { payload }: PayloadAction<string[]>) => {
      const targetFolder = findFolder(
        state.root as Folder,
        payload.slice(0, -1)
      );

      if (targetFolder) {
        targetFolder.files = targetFolder.files.filter(
          (file) => file.name !== payload.slice(-1)[0]
        );
      }
    },
  },
});

export const { addFile, deleteFile } = fileSystemReducerSlice.actions;

export default fileSystemReducerSlice.reducer;
