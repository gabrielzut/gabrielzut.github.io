import { Folder, File } from "../model/file";
import { store } from "../redux";
import { addFile, deleteFile } from "../redux/reducers/FileSystemReducer";
import {
  findFileOrFolder,
  findFolder,
  getUniqueFileName,
} from "./filesystemUtils";
import folderIcon from "../assets/img/folder.gif";
import blankFileIcon from "../assets/img/blankFile.png";

function createFileOrFolder(
  path: string[],
  name: string,
  type: "file" | "folder",
  command: string
) {
  const folder = findFolder(store.getState().fileSystem.root as Folder, path);

  if (!folder)
    throw new Error(
      `${command}: No such file or directory: /${path.join("/")}`
    );

  const finalFileName = getUniqueFileName(folder.files, name);

  store.dispatch(
    addFile({
      file: {
        name: finalFileName,
        content: "",
        icon: type === "folder" ? folderIcon : blankFileIcon,
        type: type,
        ...(type === "folder" ? { files: [] } : {}),
      },
      path,
    })
  );

  return finalFileName;
}

export function mkdir(path: string[], name: string) {
  return createFileOrFolder(path, name, "folder", "mkdir");
}

export function touch(path: string[], name: string) {
  return createFileOrFolder(path, name, "file", "touch");
}

export function rm(files: string[][], { r = false, f = false } = {}) {
  if (!files.length) throw new Error(`rm: missing operand`);

  for (const path of files) {
    const file = findFileOrFolder(path);

    if (!file) {
      if (!f)
        throw new Error(`rm: No such file or directory: /${path.join("/")}`);
      return;
    }

    if (file?.type === "folder" && !r)
      throw new Error(
        `rm: Cannot remove '${
          path[path.length - 1]
        }': Is a directory (use -r to remove directories)`
      );
  }

  // Validate first, then delete to prevent conflict errors
  for (const path of files) store.dispatch(deleteFile(path));
}

export function cat(path: string[]) {
  const file = findFileOrFolder(path);

  if (!file)
    throw new Error(`cat: /${path.join("/")}: No such file or directory`);

  if (file.type === "folder")
    throw new Error(`cat: /${path.join("/")}: is a directory`);

  return (file as File).content;
}

export function cp(
  sourcePath: string[],
  destPath: string[],
  { r = false, f = false } = {}
) {
  function copyFileOrDir(source: string[], dest: string[]) {
    const file = findFileOrFolder(source);

    if (!file)
      throw new Error(`cat: /${source.join("/")}: No such file or directory`);

    if (file.type === "folder") {
      if (!r) {
        throw new Error(
          `cp: Cannot copy directory '${source.join("/")}' without -r`
        );
      }

      try {
        mkdir(dest.slice(0, -1), dest.slice(-1)[0]);
      } catch {}

      for (const item of (file as Folder).files) {
        copyFileOrDir([...source, item.name], [...dest, item.name]);
      }
    } else {
      const destFile = findFileOrFolder(dest);

      if (destFile) {
        if (!f) {
          throw new Error(`cp: File '${dest.join("/")}' already exists`);
        }
        rm([dest], { r: true, f: true });
      }

      createFileOrFolder(
        dest,
        file?.name,
        file?.type as "file" | "folder",
        "cp"
      );
    }
  }

  try {
    copyFileOrDir(sourcePath, destPath);
  } catch (err: any) {
    throw new Error(
      `Error copying '${sourcePath.join("/")}' to '${destPath.join("/")}': ${
        err.message
      }`
    );
  }
}
