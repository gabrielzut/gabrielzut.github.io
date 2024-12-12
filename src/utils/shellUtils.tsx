import { GenerateUUID } from "./generators";

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
