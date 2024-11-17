import { Folder, File, GeneralFile } from "../model/file";
import { store } from "../redux";
import { addFile, deleteFile } from "../redux/reducers/FileSystemReducer";
import {
  findFileOrFolder,
  findFolder,
  getUniqueFileName,
} from "./filesystemUtils";
import folderIcon from "../../assets/img/folder.gif";
import blankFileIcon from "../../assets/img/blankFile.png";

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

// export function cp(
//   path: string[],
//   destinationPath: string[],
//   { r = false, f = false, u = false } = {},
//   currentDir
// ) {
//   function clone(file: GeneralFile): GeneralFile {
//     if (file.type === "file") {
//       return { ...file };
//     } else {
//       return {
//         ...(file as Folder),
//         files: (file as Folder).files.map(clone),
//       };
//     }
//   }

//   try {
//     const source = findFileOrFolder(path);
//     if (!source)
//       throw new Error(`cp: No such file or directory: /${path.join("/")}`);
//     const parentFolder = findFolder(
//       store.getState().fileSystem.root as Folder,
//       path.slice(0, -1)
//     );
//     const destName = destArray[destArray.length - 1];

//     const destination = findFileOrFolder(destinationPath);
//     if (!destination)
//       throw new Error(
//         `cp: No such file or directory: /${destinationPath.join("/")}`
//       );
//     const existingDest = (destination as Folder).files.find(
//       (file) => file.name === destName
//     );

//     if (source.type === "folder") {
//       if (!r) {
//         throw new Error(
//           `cp: Cannot copy '${source.name}': Is a directory (use -r to copy directories)`
//         );
//       }

//       if (existingDest && existingDest.type !== "folder") {
//         if (!f) {
//           throw new Error(
//             `Cannot overwrite non-directory '${destName}' with directory`
//           );
//         }

//         (destination as Folder).files = (destination as Folder).files.filter(
//           (file) => file.name !== destName
//         );
//       }

//       if (!existingDest) {
//         mkdir(destinationPath, destName);
//       }

//       (source as Folder).files.forEach((file) => {
//         cp(
//           [...path, file.name],
//           [destinationPath, file.name],
//           {r, f, u},
//           currentDir
//         );
//       });
//       return;
//     }

//     // Lógica para arquivos
//     if (source.type === "file") {
//       if (existingDest && existingDest.type === "file") {
//         if (!force && !update) {
//           throw new Error(
//             `File '${destName}' already exists (use -f to overwrite)`
//           );
//         }

//         if (update && existingDest.mtime >= source.mtime) {
//           return; // Não copia se o arquivo do destino for mais recente ou igual
//         }
//       }

//       // Adiciona ou substitui o arquivo
//       const clonedFile = clone(source);
//       destination.files = destination.files.filter(
//         (file) => file.name !== destName
//       ); // Remove se já existir
//       clonedFile.name = destName; // Garante que o nome do destino está correto
//       destination.files.push(clonedFile);
//     }
//   } catch (err) {
//     throw new Error(
//       `Error copying '${sourcePath}' to '${destPath}': ${err.message}`
//     );
//   }
// }
