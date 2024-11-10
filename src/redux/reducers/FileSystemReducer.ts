import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GeneralFile, Folder } from "../../model/file";

export interface ProcessManagerState {
  files: GeneralFile[];
}

const initialState: ProcessManagerState = {
  files: [
    {
      name: "/",
      size: 0,
      type: "folder",
      files: [
        {
          name: "home",
          size: 0,
          type: "folder",
          files: [
            {
              name: "user",
              size: 0,
              type: "folder",
              files: [],
            },
          ],
        },
      ],
    },
  ],
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
      function findFolder(
        currentFolder: Folder,
        parts: string[]
      ): Folder | null {
        if (parts.length === 0) return currentFolder;

        const [nextFolderName, ...remainingParts] = parts;

        const nextFolder = currentFolder.files.find(
          (file) => file.type === "folder" && file.name === nextFolderName
        ) as Folder | undefined;

        if (!nextFolder) {
          return null;
        }

        return findFolder(nextFolder, remainingParts);
      }

      const targetFolder = findFolder(state.files[0] as Folder, path);

      if (targetFolder) {
        targetFolder.files.push(file);
      }
    },
  },
});

export const { addFile } = fileSystemReducerSlice.actions;

export default fileSystemReducerSlice.reducer;
