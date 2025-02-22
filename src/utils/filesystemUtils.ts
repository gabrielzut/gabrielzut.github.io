import { File, Folder, GeneralFile } from "../model/file";
import folderIcon from "../assets/img/folder.gif";
import blankFileIcon from "../assets/img/blankFile.png";
import { store } from "../redux";
import { addFile } from "../redux/reducers/FileSystemReducer";

export function getFileIcon(type: string) {
  if (type === "folder") return folderIcon;
}

export function findFileOrFolder(path: string[]): GeneralFile | null {
  if (path.length === 0) return store.getState().fileSystem.root;

  const fileName = path[path.length - 1];
  const containingFolderPath = path.slice(0, -1);
  const containingFolder = findFolder(
    store.getState().fileSystem.root as Folder,
    containingFolderPath,
  );

  return containingFolder?.files.find((file) => file.name === fileName) || null;
}

export function findFolder(
  currentFolder: Folder,
  pathParts: string[],
): Folder | null {
  if (pathParts.length === 0) return currentFolder;

  const [nextFolderName, ...remainingPathParts] = pathParts;

  const nextFolder = currentFolder.files.find(
    (file) => file.type === "folder" && file.name === nextFolderName,
  ) as Folder | undefined;

  if (!nextFolder) {
    return null;
  }

  return findFolder(nextFolder, remainingPathParts);
}

export function getUniqueFileName(
  existingFiles: GeneralFile[],
  newFileName: string,
) {
  const fileBaseName = newFileName.replace(/\(\d+\)$/, "").trim();
  let uniqueName = fileBaseName;
  let counter = 1;

  while (existingFiles.map((file) => file.name).includes(uniqueName)) {
    uniqueName = `${fileBaseName} (${counter})`;
    counter++;
  }

  return uniqueName;
}

export function calculateFileSize(file: GeneralFile) {
  if (file.type === "folder") {
    return (file as Folder).files
      .filter((subFile) => subFile.type === "file")
      .map((subFile) => (subFile as File).content.length)
      .reduce((prev, curr) => prev + curr, 0);
  } else {
    return (file as File).content.length;
  }
}

export function createFileOrFolder(
  path: string[],
  name: string,
  type: "file" | "folder",
  command: string,
  content = "",
  files: GeneralFile[] = [],
) {
  const folder = findFolder(store.getState().fileSystem.root as Folder, path);

  if (!folder)
    throw new Error(
      `${command}: No such file or directory: /${path.join("/")}`,
    );

  const finalFileName = getUniqueFileName(folder.files, name);

  store.dispatch(
    addFile({
      file: {
        name: finalFileName,
        content,
        icon: type === "folder" ? folderIcon : blankFileIcon,
        type: type,
        ...(type === "folder" ? { files } : {}),
        owner: "user",
      },
      path,
    }),
  );

  return finalFileName;
}

export function isValidFileMove(sourcePath: string[], targetPath: string[]) {
  if (targetPath.length >= sourcePath.length) {
    for (let i = 0; i < sourcePath.length; i++) {
      if (sourcePath[i] !== targetPath[i]) {
        return true;
      }
    }
    return false;
  }
  return true;
}

export function toAbsolutePath(currentPath: string[], filePath: string) {
  const isValidPath = /^(\.\/|\.\.\/|\/)?([a-zA-Z0-9._-\s]+\/?)*$/.test(
    filePath,
  );

  if (!isValidPath) {
    throw new Error(`Invalid path`);
  }

  if (filePath.startsWith("/")) {
    return filePath.split("/").filter(Boolean);
  }

  const fileSegments = filePath.split("/");
  const currentPathClone = [...currentPath];

  for (const segment of fileSegments) {
    if (segment === "..") {
      currentPathClone.pop();
    } else if (segment !== ".") {
      currentPathClone.push(segment);
    }
  }

  return currentPathClone.filter(Boolean);
}
