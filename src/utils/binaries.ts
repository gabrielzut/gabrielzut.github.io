import { Folder, File, GeneralFile } from "../model/file";
import { store } from "../redux";
import { deleteFile } from "../redux/reducers/FileSystemReducer";
import {
  calculateFileSize,
  createFileOrFolder,
  findFileOrFolder,
} from "./filesystemUtils";
import { closeProgram } from "../redux/reducers/ProcessManagerReducer";
import { system } from "./constants";

export const defaultBinaries = [
  cat,
  cp,
  date,
  echo,
  hostname,
  ls,
  kill,
  mkdir,
  mv,
  ps,
  pwd,
  rm,
  sh,
  touch,
  uname,
];

export function sh() {
  return;
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
  const file = findFileOrFolder(sourcePath);
  const destFile = findFileOrFolder(destPath);

  if (!file)
    throw new Error(`cp: /${sourcePath.join("/")}: No such file or directory`);

  if (file.type === "folder") {
    if (!r) {
      throw new Error(
        `cp: Cannot copy directory '${sourcePath.join("/")}' without -r`
      );
    }

    const destFile = findFileOrFolder(destPath);

    if (destFile?.type === "file")
      throw new Error("cp: Cannot override file with a directory.");
  } else {
    if (destFile?.type === "file") {
      if (!f) {
        throw new Error(`cp: File '${destPath.join("/")}' already exists`);
      }
      rm([destPath], { r: true, f: true });
    }
  }

  createFileOrFolder(
    destFile === null ? destPath.slice(0, -1) : destPath,
    destFile === null ? destPath.slice(-1)[0] : file?.name,
    file?.type as "file" | "folder",
    "cp",
    file.type === "file" ? (file as File)?.content : undefined,
    file.type === "folder" ? (file as Folder).files : undefined
  );
}

export function date(format: string) {
  const now = new Date();

  const placeholders: { [key: string]: string } = {
    "%Y": `${now.getFullYear()}`,
    "%m": String(now.getMonth() + 1).padStart(2, "0"),
    "%d": String(now.getDate()).padStart(2, "0"),
    "%H": String(now.getHours()).padStart(2, "0"),
    "%M": String(now.getMinutes()).padStart(2, "0"),
    "%S": String(now.getSeconds()).padStart(2, "0"),
  };

  if (!format) {
    format = "%Y-%m-%d %H:%M:%S";
  }

  return format.replace(/%[YmdHMS]/g, (match) => placeholders[match]);
}

export function echo(...args: string[]) {
  const options = { newline: true };
  const strings: string[] = [];

  for (const arg of args) {
    if (arg === "-n") {
      options.newline = false;
    } else {
      strings.push(arg);
    }
  }

  const output = strings.join(" ").replace(/\\n/g, "\n").replace(/\\t/g, "\t");

  return options.newline ? output + "\n" : output;
}

export function kill(proccessId: string) {
  store.dispatch(closeProgram(proccessId));
}

export function hostname() {
  return system.hostName;
}

export function ls(path: string[], { l = false, a = false } = {}) {
  const fileOrFolder = findFileOrFolder(path);

  let visibleFiles: GeneralFile[] =
    fileOrFolder?.type === "file" ? [fileOrFolder] : [];

  if (fileOrFolder?.type === "folder") {
    visibleFiles = (fileOrFolder as Folder).files.filter(
      (file) => a || !file.name.startsWith(".")
    );
  }

  if (visibleFiles.length) {
    if (l) {
      return visibleFiles
        .map((file) => {
          const type = file.type === "folder" ? "d" : "-";
          const size = `${calculateFileSize(file)}B`;
          return `${type} ${file.name} ${size}`;
        })
        .join("\n");
    } else {
      return visibleFiles.map((file) => file.name).join("\n");
    }
  }

  return " ";
}

export function ps({ e = false, l = false } = {}) {
  const processes = store.getState().processManager.programs;

  const filteredProcesses = processes.filter(
    (proc) => e || !proc.isSystemOwned
  );

  if (l) {
    return filteredProcesses.map((proc) => {
      return `PID: ${proc.id} CMD: ${proc.name} MEM: ${Math.round(
        Math.random() * 100
      )}MB CPU: ${Math.round(Math.random() * 3)}% STATE: RUNNING`;
    });
  }

  return filteredProcesses.map((proc) => `${proc.id} ${proc.name}`);
}

export function pwd(path: string[]) {
  return `/${path.join("/")}`;
}

export function mv(
  source: string[],
  destination: string[],
  { f = false } = {}
) {
  try {
    cp(source, destination, { r: true, f });
    rm([source], { r: true, f });
  } catch (error) {
    throw new Error(
      `mv: Error moving from ${source.join("/")} to ${destination.join(
        "/"
      )}: ${error}`
    );
  }
}

export function uname({
  s = false,
  n = false,
  r = false,
  m = false,
  a = false,
} = {}): string {
  if (!a && !s && !n && !r && !m) {
    return system.systemName;
  }

  const result: string[] = [];
  if (s || a) result.push(system.systemName);
  if (n || a) result.push(system.hostName);
  if (r || a) result.push(system.kernelVersion);
  if (m || a) result.push(system.architecture);

  return result.join(" ");
}
