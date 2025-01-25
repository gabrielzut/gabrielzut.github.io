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
    owner: "root",
    files: [
      {
        name: "bin",
        type: "folder",
        owner: "root",
        files: [
          ...defaultBinaries.map((binary) => ({
            name: binary.name,
            type: "file",
            content: binary.executable.toString(),
            command: binary.executable,
            icon: executableIcon,
            owner: "root",
          })),
        ],
      },
      {
        name: "etc",
        type: "folder",
        owner: "root",
        files: [],
      },
      {
        name: "sbin",
        type: "folder",
        owner: "root",
        files: [],
      },
      {
        name: "usr",
        type: "folder",
        owner: "root",
        files: [],
      },
      {
        name: "var",
        type: "folder",
        owner: "root",
        files: [],
      },
      {
        name: "dev",
        type: "folder",
        files: [],
        owner: "root",
      },
      {
        name: "home",
        type: "folder",
        owner: "root",
        files: [
          {
            name: "user",
            type: "folder",
            owner: "user",
            files: [
              {
                name: ".local",
                type: "folder",
                owner: "user",
                files: [
                  {
                    name: "share",
                    type: "folder",
                    owner: "user",
                    files: [
                      {
                        name: "Trash",
                        type: "folder",
                        owner: "user",
                        files: [],
                      },
                    ],
                  },
                ],
              },
              {
                name: "Documents",
                type: "folder",
                owner: "user",
                files: [],
              },
              {
                name: "Downloads",
                type: "folder",
                owner: "user",
                files: [],
              },
              {
                name: "Images",
                type: "folder",
                owner: "user",
                files: [],
              },
              {
                name: "Music",
                type: "folder",
                owner: "user",
                files: [],
              },
              {
                name: "Public",
                type: "folder",
                owner: "user",
                files: [],
              },
              {
                name: "Videos",
                type: "folder",
                owner: "user",
                files: [],
              },
            ],
          },
        ],
      },
      {
        name: "lib",
        type: "folder",
        owner: "root",
        files: [],
      },
      {
        name: "mnt",
        type: "folder",
        owner: "root",
        files: [],
      },
      {
        name: "opt",
        type: "folder",
        owner: "root",
        files: [],
      },
      {
        name: "proc",
        type: "folder",
        owner: "root",
        files: [],
      },
      {
        name: "root",
        type: "folder",
        owner: "root",
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
      }: PayloadAction<{ file: GeneralFile; path: string[] }>,
    ) => {
      const targetFolder = findFolder(state.root as Folder, path);

      if (targetFolder) {
        targetFolder.files.push(file);
      }
    },
    deleteFile: (state, { payload }: PayloadAction<string[]>) => {
      const targetFolder = findFolder(
        state.root as Folder,
        payload.slice(0, -1),
      );

      if (targetFolder) {
        targetFolder.files = targetFolder.files.filter(
          (file) => file.name !== payload.slice(-1)[0],
        );
      }
    },
  },
});

export const { addFile, deleteFile } = fileSystemReducerSlice.actions;

export default fileSystemReducerSlice.reducer;
