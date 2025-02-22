import { Folder, File, GeneralFile } from "../model/file";
import { store } from "../redux";
import { deleteFile } from "../redux/reducers/FileSystemReducer";
import {
  calculateFileSize,
  createFileOrFolder,
  findFileOrFolder,
  toAbsolutePath,
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
        }),
      ),
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
  { name: "gsh", executable: sh },
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
  commandName?: string,
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
            "/",
          )}/${fileName}, file not found or is not executable.`,
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
    try {
      if (params.textParams.length) {
        const fileParam = toAbsolutePath(path, params.textParams[0]);

        name = fileParam.slice(-1)[0];
        filePath = fileParam.slice(0, -1);
      }
    } catch (e) {
      console.log(e);
      throw new Error("mkdir: Invalid file name/path.");
    }
  } else {
    name = params.name;
    filePath = params.path;
  }

  if (!name) throw new Error(`mkdir: No folder name was informed.`);

  createFileOrFolder(filePath ?? path, name, "folder", "mkdir");
}

export function touch({
  params,
  path,
}: BinaryParams<
  { path?: string[]; name?: string } | { textParams: string[] }
>) {
  let filePath: string[] | undefined;
  let fileName;

  if (isTextParams(params)) {
    try {
      if (params.textParams.length) {
        const fileParam = toAbsolutePath(path, params.textParams[0]);

        fileName = fileParam.slice(-1)[0];
        filePath = fileParam.slice(0, -1);
      }
    } catch {
      throw new Error("touch: Invalid file name/path.");
    }
  } else {
    fileName = params.name;
    filePath = params.path;
  }

  if (!fileName) throw new Error("touch: No file name was informed.");

  return createFileOrFolder(filePath ?? path, fileName, "file", "touch");
}

export function rm({
  params,
  path,
}: BinaryParams<
  { files?: string[][]; r?: boolean; f?: boolean } | { textParams: string[] }
>) {
  let files: string[][] | undefined;
  let f: boolean | undefined;
  let r: boolean | undefined;

  if (isTextParams(params)) {
    for (const param of params.textParams) {
      if (param.startsWith("-") && param.length > 1) {
        if (param.includes("r")) r = true;
        if (param.includes("f")) f = true;
        const invalidOptions = param.slice(1).match(/[^rf]/gi);
        if (invalidOptions?.length) {
          throw new Error(`rm: invalid option -- "${invalidOptions[0]}"`);
        }
      } else {
        try {
          if (!files) files = [];
          files.push(toAbsolutePath(path, param));
        } catch {
          throw new Error(`rm: invalid file: "${param}"`);
        }
      }
    }
  } else {
    files = params.files;
    f = params.f;
    r = params.r;
  }

  if (!files?.length) throw new Error(`rm: missing operand`);

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
          path[path.length - 1] ?? "/"
        }': Is a directory (use -r to remove directories)`,
      );
  }

  for (const path of files) store.dispatch(deleteFile(path));
}

export function cat({
  params,
  path,
}: BinaryParams<{ path?: string[] } | { textParams: string[] }>) {
  let filePath: string[] | undefined;

  if (isTextParams(params)) {
    filePath = toAbsolutePath(path, params.textParams[0]);
  } else {
    filePath = params.path;
  }

  const file = findFileOrFolder(filePath ?? path);

  if (!file)
    throw new Error(`cat: /${path.join("/")}: No such file or directory`);

  if (file.type === "folder")
    throw new Error(`cat: /${path.join("/")}: is a directory`);

  return (file as File).content;
}

export function cp({
  params,
  path,
}: BinaryParams<
  | {
      sourcePath?: string[];
      destPath?: string[];
      r?: boolean;
      f?: boolean;
    }
  | { textParams: string[] }
>) {
  let r: boolean | undefined;
  let f: boolean | undefined;
  let sourcePath: string[] | undefined;
  let destPath: string[] | undefined;

  if (isTextParams(params)) {
    const files: string[][] = [];
    for (const param of params.textParams) {
      if (param.startsWith("-") && param.length > 1) {
        if (param.includes("r")) r = true;
        if (param.includes("f")) f = true;
        const invalidOptions = param.slice(1).match(/[^rf]/gi);
        if (invalidOptions?.length) {
          throw new Error(`cp: invalid option -- "${invalidOptions[0]}"`);
        }
      } else {
        try {
          files.push(toAbsolutePath(path, param));
        } catch {
          throw new Error(`cp: invalid file: "${param}"`);
        }
      }
    }

    if (files.length) sourcePath = files[0];
    if (files.length > 1) destPath = files[1];
  } else {
    sourcePath = params.sourcePath;
    destPath = params.destPath;
    r = params.r;
    f = params.f;
  }

  if (!sourcePath || !destPath) throw new Error("cp: missing operand");

  const file = findFileOrFolder(sourcePath);
  const destFile = findFileOrFolder(destPath);

  if (!file)
    throw new Error(`cp: /${sourcePath.join("/")}: No such file or directory`);

  if (file.type === "folder") {
    if (!r) {
      throw new Error(
        `cp: Cannot copy directory '${sourcePath.join("/")}' without -r`,
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
      rm({ path, params: { files: [destPath], r: true, f: true } });
    }
  }

  createFileOrFolder(
    destFile === null ? destPath.slice(0, -1) : destPath,
    destFile === null ? destPath.slice(-1)[0] : file?.name,
    file?.type as "file" | "folder",
    "cp",
    file.type === "file" ? (file as File)?.content : undefined,
    file.type === "folder" ? (file as Folder).files : undefined,
  );
}

export function date({
  params,
}: BinaryParams<{ format?: string } | { textParams: string[] }>) {
  const now = new Date();

  const placeholders: { [key: string]: string } = {
    "%Y": `${now.getFullYear()}`,
    "%m": String(now.getMonth() + 1).padStart(2, "0"),
    "%d": String(now.getDate()).padStart(2, "0"),
    "%H": String(now.getHours()).padStart(2, "0"),
    "%M": String(now.getMinutes()).padStart(2, "0"),
    "%S": String(now.getSeconds()).padStart(2, "0"),
  };

  let format: string | undefined;

  if (isTextParams(params)) {
    format = params.textParams.join(" ");
  } else {
    format = params.format;
  }

  if (!format) {
    format = "%Y-%m-%d %H:%M:%S";
  }

  return format.replace(/%[YmdHMS]/g, (match) => placeholders[match]);
}

export function echo({
  params,
}: BinaryParams<{ args?: string[] } | { textParams: string[] }>) {
  const options = { newline: true };
  const strings: string[] = [];

  let args: string[] | undefined;

  if (isTextParams(params)) {
    args = params.textParams;
  } else {
    args = params.args;
  }

  for (const arg of args ?? []) {
    if (arg === "-n") {
      options.newline = false;
    } else {
      strings.push(arg);
    }
  }

  const output = strings.join(" ").replace(/\\n/g, "\n").replace(/\\t/g, "\t");

  return options.newline ? output + "\n" : output;
}

export function kill({
  params,
}: BinaryParams<{ processId?: string } | { textParams: string[] }>) {
  let pid: string | undefined;

  if (isTextParams(params)) {
    pid = params.textParams[0];
  } else {
    pid = params.processId;
  }

  if (!pid) throw new Error("kill: missing operand");

  store.dispatch(closeProgram(pid));
}

export function hostname() {
  return system.hostName;
}

export function ls({
  params,
  path,
}: BinaryParams<
  { path?: string[]; l?: boolean; a?: boolean } | { textParams: string[] }
>) {
  let a: boolean | undefined;
  let l: boolean | undefined;
  let paramPath: string[] | undefined;

  if (isTextParams(params)) {
    for (const param of params.textParams) {
      if (param.startsWith("-") && param.length > 1) {
        if (param.includes("a")) a = true;
        if (param.includes("l")) l = true;
        const invalidOptions = param.slice(1).match(/[^al]/gi);
        if (invalidOptions?.length) {
          throw new Error(`ls: invalid option -- "${invalidOptions[0]}"`);
        }
      } else {
        paramPath = toAbsolutePath(path, param);
      }
    }
  } else {
    paramPath = params.path;
    a = params.a;
    l = params.l;
  }

  const fileOrFolder = findFileOrFolder(paramPath ?? path);

  let visibleFiles: GeneralFile[] =
    fileOrFolder?.type === "file" ? [fileOrFolder] : [];

  if (fileOrFolder?.type === "folder") {
    visibleFiles = (fileOrFolder as Folder).files.filter(
      (file) => a || !file.name.startsWith("."),
    );
  }

  if (visibleFiles.length) {
    if (l) {
      return visibleFiles
        .map((file) => {
          const type = file.type === "folder" ? "d" : "-";
          const size = `${calculateFileSize(file)}B`;
          return `${type} ${file.owner} ${size} ${file.name}`;
        })
        .join("\n");
    } else {
      return visibleFiles.map((file) => file.name).join("  ");
    }
  }

  return " ";
}

export function ps({
  params,
}: BinaryParams<{ e?: boolean; l?: boolean } | { textParams: string[] }>) {
  const processes = store.getState().processManager.programs;

  let e: boolean | undefined;
  let l: boolean | undefined;

  if (isTextParams(params)) {
    for (const param of params.textParams) {
      if (param.startsWith("-") && param.length > 1) {
        if (param.includes("e")) e = true;
        if (param.includes("l")) l = true;
        const invalidOptions = param.slice(1).match(/[^el]/gi);
        if (invalidOptions?.length) {
          throw new Error(`ps: invalid option -- "${invalidOptions[0]}"`);
        }
      } else {
        throw new Error(`ps: invalid option -- "${param}"`);
      }
    }
  } else {
    e = params.e;
    l = params.l;
  }

  const filteredProcesses = processes.filter(
    (proc) => e || !proc.isSystemOwned,
  );

  if (l) {
    return filteredProcesses
      .map((proc) => {
        return `PID: ${proc.id} CMD: ${proc.name} MEM: ${Math.round(
          Math.random() * 100,
        )}MB CPU: ${Math.round(Math.random() * 3)}% STATE: RUNNING`;
      })
      .join("\n");
  }

  return filteredProcesses.map((proc) => `${proc.id} ${proc.name}`).join("\n");
}

export function pwd({ path }: BinaryParams<{}>) {
  return `/${path.join("/")}`;
}

export function mv({
  params,
  path,
}: BinaryParams<
  | {
      source?: string[];
      destination?: string[];
      f?: boolean;
    }
  | { textParams: string[] }
>) {
  let source: string[] | undefined;
  let destination: string[] | undefined;
  let f: boolean | undefined;

  if (isTextParams(params)) {
    const files: string[][] = [];
    for (const param of params.textParams) {
      if (param.startsWith("-") && param.length > 1) {
        if (param.includes("f")) f = true;
        const invalidOptions = param.slice(1).match(/[^f]/gi);
        if (invalidOptions?.length) {
          throw new Error(`mv: invalid option -- "${invalidOptions[0]}"`);
        }
      } else {
        try {
          files.push(toAbsolutePath(path, param));
        } catch {
          throw new Error(`mv: invalid file: "${param}"`);
        }
      }
    }

    if (files.length) source = files[0];
    if (files.length > 1) destination = files[1];
  } else {
    source = params.source;
    destination = params.destination;
    f = params.f;
  }

  if (!source || !destination) throw new Error("mv: Missing parameters");

  try {
    cp({
      path,
      params: {
        sourcePath: source,
        destPath: destination,
        r: true,
        f,
      },
    });
    rm({ path, params: { files: [source], r: true, f } });
  } catch (error) {
    throw new Error(
      `mv: Error moving from ${source.join(
        "/",
      )} to ${destination.join("/")}: ${error}`,
    );
  }
}

export function uname({
  params,
}: BinaryParams<
  | {
      s?: boolean;
      n?: boolean;
      r?: boolean;
      m?: boolean;
      a?: boolean;
    }
  | { textParams: string[] }
>): string {
  let s: boolean | undefined;
  let n: boolean | undefined;
  let r: boolean | undefined;
  let m: boolean | undefined;
  let a: boolean | undefined;

  if (isTextParams(params)) {
    for (const param of params.textParams) {
      if (param.startsWith("-") && param.length > 1) {
        if (param.includes("s")) s = true;
        if (param.includes("n")) n = true;
        if (param.includes("r")) r = true;
        if (param.includes("m")) m = true;
        if (param.includes("a")) a = true;
        const invalidOptions = param.slice(1).match(/[^snrma]/gi);
        if (invalidOptions?.length) {
          throw new Error(`uname: invalid option -- "${invalidOptions[0]}"`);
        }
      } else {
        throw new Error(`uname: invalid option: "${param}"`);
      }
    }
  } else {
    s = params.s;
    n = params.n;
    r = params.r;
    m = params.m;
    a = params.a;
  }
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
