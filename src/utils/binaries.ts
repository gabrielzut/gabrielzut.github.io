import { Folder, File, GeneralFile } from "../model/file";
import { store } from "../redux";
import { deleteFile } from "../redux/reducers/FileSystemReducer";
import {
  calculateFileSize,
  createFileOrFolder,
  findFileOrFolder,
  isValidPath,
} from "./filesystemUtils";
import {
  addProgram,
  closeProgram,
} from "../redux/reducers/ProcessManagerReducer";
import { system } from "./constants";
import { Program } from "../components/general/Program";
import { fileExplorerEntry } from "../components/programs/FileExplorer";
import { ProgramEntry } from "../components/programs";
import { errorProgramEntry } from "../components/programs/MessageWindow";
import { terminalEntry } from "../components/programs/Terminal";

export function errorHandler(func: Function, disableErrorHandling: boolean) {
  if (disableErrorHandling) return func();

  try {
    return func();
  } catch (e: any) {
    store.dispatch(
      addProgram(
        Program.of({
          ...errorProgramEntry,
          props: { text: e?.message ?? e ?? "Unknown error", type: "error" },
        })
      )
    );
  }
}

export const defaultBinaries = [
  { name: "cat", executable: cat },
  { name: "cp", executable: cp },
  { name: "date", executable: date },
  { name: "echo", executable: echo },
  { name: "hostname", executable: hostname },
  { name: "ls", executable: ls },
  { name: "kill", executable: kill },
  { name: "mkdir", executable: mkdir },
  { name: "mv", executable: mv },
  { name: "ps", executable: ps },
  { name: "pwd", executable: pwd },
  { name: "rm", executable: rm },
  { name: "sh", executable: sh },
  { name: "touch", executable: touch },
  { name: "uname", executable: uname },
  { name: "fileExplorer", executable: () => openProgram(fileExplorerEntry) },
  { name: "terminal", executable: () => openProgram(terminalEntry) },
];

export function executeBinary(
  path: string[],
  fileName: string,
  currPath?: string[],
  disableErrorHandling = false,
  params: any = {},
  commandName?: string
) {
  return errorHandler(() => {
    let file = findFileOrFolder([...path, fileName]);

    if (!file && currPath) {
      file = findFileOrFolder([...currPath, fileName]);
    }

    if (file && file.type === "file" && file.command) {
      return file.command({ path: currPath, params });
    } else {
      if (commandName) {
        throw new Error(`${commandName}: ${fileName}: command not found...`);
      } else {
        throw new Error(
          `Cannot execute /${path.join(
            "/"
          )}/${fileName}, file not found or is not executable.`
        );
      }
    }
  }, disableErrorHandling);
}

export function openProgram(entry: ProgramEntry<any>) {
  store.dispatch(addProgram(Program.of(entry)));
}

export function sh() {
  return;
}

interface BinaryParams<T> {
  params: T;
  path: string[];
}

type TextParams = {
  textParams: string[];
};

function isTextParams(x: any): x is TextParams {
  return (x as TextParams).textParams !== undefined;
}

export function mkdir({
  params,
  path,
}: BinaryParams<
  { path?: string[]; name?: string } | { textParams: string[] }
>) {
  let name;
  let filePath;

  if (isTextParams(params)) {
    if (params.textParams.length && isValidPath(params.textParams[0])) {
      const fileParam = params.textParams[0]
        .split("/")
        .filter((entry) => entry.length > 0);

      name = fileParam.slice(-1)[0];
      filePath = fileParam.slice(0, -1);
    }
  } else {
    name = params.name;
    filePath = params.path;
  }

  if (!name) throw new Error(`touch: No file name was informed.`);

  return createFileOrFolder(filePath ?? path, name, "folder", "mkdir");
}

export function touch({
  params,
  path,
}: BinaryParams<{ path?: string[]; name?: string }>) {
  if (!params.name) throw new Error("touch: No file name was informed.");

  return createFileOrFolder(params.path ?? path, params.name, "file", "touch");
}

export function rm({
  params,
  path,
}: BinaryParams<{ files?: string[][]; r?: boolean; f?: boolean }>) {
  if (!params.files?.length) throw new Error(`rm: missing operand`);

  for (const path of params.files) {
    const file = findFileOrFolder(path);

    if (!file) {
      if (!params.f)
        throw new Error(`rm: No such file or directory: /${path.join("/")}`);
      return;
    }

    if (file?.type === "folder" && !params.r)
      throw new Error(
        `rm: Cannot remove '${
          path[path.length - 1]
        }': Is a directory (use -r to remove directories)`
      );
  }

  for (const path of params.files) store.dispatch(deleteFile(path));
}

export function cat({ params, path }: BinaryParams<{ path?: string[] }>) {
  const file = findFileOrFolder(params.path ?? path);

  if (!file)
    throw new Error(`cat: /${path.join("/")}: No such file or directory`);

  if (file.type === "folder")
    throw new Error(`cat: /${path.join("/")}: is a directory`);

  return (file as File).content;
}

export function cp({
  params,
  path,
}: BinaryParams<{
  sourcePath?: string[];
  destPath?: string[];
  r?: boolean;
  f?: boolean;
}>) {
  if (!params.sourcePath || !params.destPath)
    throw new Error("cp: missing operand");

  const file = findFileOrFolder(params.sourcePath);
  const destFile = findFileOrFolder(params.destPath);

  if (!file)
    throw new Error(
      `cp: /${params.sourcePath.join("/")}: No such file or directory`
    );

  if (file.type === "folder") {
    if (!params.r) {
      throw new Error(
        `cp: Cannot copy directory '${params.sourcePath.join("/")}' without -r`
      );
    }

    const destFile = findFileOrFolder(params.destPath);

    if (destFile?.type === "file")
      throw new Error("cp: Cannot override file with a directory.");
  } else {
    if (destFile?.type === "file") {
      if (!params.f) {
        throw new Error(
          `cp: File '${params.destPath.join("/")}' already exists`
        );
      }
      rm({ path, params: { files: [params.destPath], r: true, f: true } });
    }
  }

  createFileOrFolder(
    destFile === null ? params.destPath.slice(0, -1) : params.destPath,
    destFile === null ? params.destPath.slice(-1)[0] : file?.name,
    file?.type as "file" | "folder",
    "cp",
    file.type === "file" ? (file as File)?.content : undefined,
    file.type === "folder" ? (file as Folder).files : undefined
  );
}

export function date({ params }: BinaryParams<{ format?: string }>) {
  const now = new Date();

  const placeholders: { [key: string]: string } = {
    "%Y": `${now.getFullYear()}`,
    "%m": String(now.getMonth() + 1).padStart(2, "0"),
    "%d": String(now.getDate()).padStart(2, "0"),
    "%H": String(now.getHours()).padStart(2, "0"),
    "%M": String(now.getMinutes()).padStart(2, "0"),
    "%S": String(now.getSeconds()).padStart(2, "0"),
  };

  if (!params.format) {
    params.format = "%Y-%m-%d %H:%M:%S";
  }

  return params.format.replace(/%[YmdHMS]/g, (match) => placeholders[match]);
}

export function echo({ params }: BinaryParams<{ args?: string[] }>) {
  const options = { newline: true };
  const strings: string[] = [];

  for (const arg of params.args ?? []) {
    if (arg === "-n") {
      options.newline = false;
    } else {
      strings.push(arg);
    }
  }

  const output = strings.join(" ").replace(/\\n/g, "\n").replace(/\\t/g, "\t");

  return options.newline ? output + "\n" : output;
}

export function kill({ params }: BinaryParams<{ proccessId?: string }>) {
  if (!params.proccessId) throw new Error("kill: missing operand");

  store.dispatch(closeProgram(params.proccessId));
}

export function hostname() {
  return system.hostName;
}

export function ls({
  params,
  path,
}: BinaryParams<{ path?: string[]; l?: boolean; a?: boolean }>) {
  const fileOrFolder = findFileOrFolder(params.path ?? path);

  let visibleFiles: GeneralFile[] =
    fileOrFolder?.type === "file" ? [fileOrFolder] : [];

  if (fileOrFolder?.type === "folder") {
    visibleFiles = (fileOrFolder as Folder).files.filter(
      (file) => params.a || !file.name.startsWith(".")
    );
  }

  if (visibleFiles.length) {
    if (params.l) {
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

export function ps({ params }: BinaryParams<{ e?: boolean; l?: boolean }>) {
  const processes = store.getState().processManager.programs;

  const filteredProcesses = processes.filter(
    (proc) => params.e || !proc.isSystemOwned
  );

  if (params.l) {
    return filteredProcesses.map((proc) => {
      return `PID: ${proc.id} CMD: ${proc.name} MEM: ${Math.round(
        Math.random() * 100
      )}MB CPU: ${Math.round(Math.random() * 3)}% STATE: RUNNING`;
    });
  }

  return filteredProcesses.map((proc) => `${proc.id} ${proc.name}`);
}

export function pwd({ path }: BinaryParams<{}>) {
  return `/${path.join("/")}`;
}

export function mv({
  params,
  path,
}: BinaryParams<{
  source?: string[];
  destination?: string[];
  f?: boolean;
}>) {
  if (!params.source || !params.destination)
    throw new Error("mv: Missing parameters");

  try {
    cp({
      path,
      params: {
        sourcePath: params.source,
        destPath: params.destination,
        r: true,
        f: params.f,
      },
    });
    rm({ path, params: { files: [params.source], r: true, f: params.f } });
  } catch (error) {
    throw new Error(
      `mv: Error moving from ${params.source.join(
        "/"
      )} to ${params.destination.join("/")}: ${error}`
    );
  }
}

export function uname({
  params,
}: BinaryParams<{
  s?: boolean;
  n?: boolean;
  r?: boolean;
  m?: boolean;
  a?: boolean;
}>): string {
  if (!params.a && !params.s && !params.n && !params.r && !params.m) {
    return system.systemName;
  }

  const result: string[] = [];
  if (params.s || params.a) result.push(system.systemName);
  if (params.n || params.a) result.push(system.hostName);
  if (params.r || params.a) result.push(system.kernelVersion);
  if (params.m || params.a) result.push(system.architecture);

  return result.join(" ");
}
