import { Folder } from "../model/file";
import folderIcon from "../assets/img/folder.gif";

export function getFileIcon(type: string) {
  if (type === "folder") return folderIcon;
}

export function findFolder(
  currentFolder: Folder,
  pathParts: string[]
): Folder | null {
  if (pathParts.length === 0) return currentFolder;

  const [nextFolderName, ...remainingPathParts] = pathParts;

  const nextFolder = currentFolder.files.find(
    (file) => file.type === "folder" && file.name === nextFolderName
  ) as Folder | undefined;

  if (!nextFolder) {
    return null;
  }

  return findFolder(nextFolder, remainingPathParts);
}
