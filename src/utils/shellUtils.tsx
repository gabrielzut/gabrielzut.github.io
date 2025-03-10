import { Folder } from "../model/file";
import { store } from "../redux";
import { findFolder } from "./filesystemUtils";
import { GenerateUUID } from "./generators";
import { getEnv, getItem, setEnv } from "./localStorage";

export function printShellInfo(isSu: boolean, path: string[]) {
  const pathString = "/" + path.join("/");

  if (!isSu && pathString.startsWith("/home/user"))
    pathString.replace("/home/user", "~");

  return (
    <span
      contentEditable={"false"}
      suppressContentEditableWarning
      className="terminal-shell-info"
      key={GenerateUUID()}
    >
      <span className="terminal-green">{isSu ? "root" : "user"}@zutiOS</span>:
      <span className="terminal-green">{pathString}</span>
      {isSu ? "#" : "$"}
    </span>
  );
}

export function getPathFromCommand(command: string, path: string[]) {
  const parts = command.split("/").filter((part) => part !== "");

  const newPath = command.startsWith("/") ? [] : [...path];

  for (const part of parts) {
    if (part === "..") {
      if (newPath.length > 0) {
        newPath.pop();
      }
    } else if (part === ".") {
      continue;
    } else {
      newPath.push(part);
    }
  }

  return newPath;
}

function getCurrentArg(command: string, cursorPos: number) {
  let start = cursorPos;
  while (start > 0 && command[start - 1] !== " ") {
    start--;
  }

  let end = cursorPos;
  while (end < command.length && command[end] !== " ") {
    end++;
  }

  const word = command.slice(start, end);

  return word;
}

export function autoComplete(
  command: string,
  path: string[],
  cursorPos: number,
) {
  const parts = command.split(" ");
  const currentCommand = parts[0];
  const currentArg = getCurrentArg(command, cursorPos);

  const pathEnv = getEnv("PATH");
  const pathsFromEnv = pathEnv.split(":");

  const suggestions =
    cursorPos <= currentCommand.length &&
    !currentCommand[0].startsWith(".") &&
    !currentCommand[0].startsWith("/")
      ? [
          ...pathsFromEnv.flatMap((pathFromEnv) =>
            autoCompletePath(
              currentArg,
              pathFromEnv.split("/").filter(Boolean),
              currentCommand === "cd",
            ),
          ),
          ...["cd", "clear", "export", "sudo"].filter((cmd) =>
            cmd.startsWith(currentCommand),
          ),
        ]
      : autoCompletePath(currentArg, path, currentCommand === "cd");

  return {
    suggestions,
    currentArg:
      cursorPos <= currentCommand.length ? currentCommand : currentArg,
    isCommand: cursorPos <= currentCommand.length,
  };
}

export function replaceEnvs(string: string) {
  const envs = getItem("envs");

  return string.replace(/\$([a-zA-Z_][a-zA-Z0-9_]*)/g, (_, varName) => {
    return (envs ?? { [varName]: "" })[varName] || "";
  });
}

export function autoCompletePath(
  command: string,
  path: string[],
  showOnlyFolders: boolean,
) {
  const fullPath = command.startsWith("/") ? [] : [...path];
  const partialParts = command.split("/").filter((part) => part !== "");

  if (command.endsWith("/")) partialParts.push("");

  while (partialParts.length > 1) {
    const part = partialParts.shift()!;

    if (part === "..") {
      fullPath.pop();
    } else if (part !== ".") {
      fullPath.push(part);
    }
  }

  const prefix = partialParts[0] || "";

  const entries =
    findFolder(store.getState().fileSystem.root as Folder, fullPath)?.files ??
    [];

  const historyPrefix = command.split("/").slice(0, -1).join("/");

  let fileNames = entries
    .filter(
      (file) =>
        file.name.startsWith(prefix) &&
        (!showOnlyFolders || file.type === "folder"),
    )
    .map(
      (file) =>
        `${file.name.includes(" ") ? '"' : ""}${
          command.startsWith("/") && !historyPrefix ? "/" : ""
        }${historyPrefix}${historyPrefix ? "/" : ""}${file.name}${
          file.type === "folder" ? "/" : ""
        }${file.name.includes(" ") ? '"' : ""}`,
    );

  if (command.endsWith(".")) fileNames.push(`${command}/`);

  return fileNames;
}

export function splitIgnoringQuotes(input: string): string[] {
  const regex = /(["'`])([^]*?)\1|\S+/g;
  return (
    input.match(regex)?.map((match) => match.replace(/^["'`]|["'`]$/g, "")) ||
    []
  );
}

export function handleExportEnv(envWithValue: string): void {
  const [key, value] = envWithValue.split("=");
  setEnv(key, value);
}
