import {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { WindowOptions } from "../general/WindowOption";
import { executeBinary, kill } from "../../utils/binaries";
import { ProgramEntry } from ".";
import terminalIcon from "../../assets/img/terminal.gif";
import { printShellInfo } from "../../utils/shellUtils";
import { GenerateUUID } from "../../utils/generators";
import { findFolder } from "../../utils/filesystemUtils";
import { useSelector } from "react-redux";
import { RootState } from "../../redux";
import { Folder } from "../../model/file";

interface TerminalProps {
  uid: string;
  startingPath?: string[];
  size: {
    width: number;
    height: number;
  };
}

const HOME_PATH = ["home", "user"];

export const Terminal: FC<TerminalProps> = ({
  uid,
  startingPath = HOME_PATH,
  size,
}) => {
  const [isSu, setIsSu] = useState(false);
  const [path, setPath] = useState(HOME_PATH);
  const root = useSelector((state: RootState) => state.fileSystem.root);
  const terminalInputRef = useRef<HTMLSpanElement>(null);
  const [terminalHistory, setTerminalHistory] = useState<ReactNode[]>([]);

  const execute = useCallback(
    (text?: string) => {
      const prevHistory = [...terminalHistory];

      prevHistory.push(printShellInfo(isSu, path));

      if (text) {
        prevHistory.push(text);

        try {
          const params = text.includes(" ") ? text.split(" ") : [];
          const command = text.split(" ")[0];

          if (command === "cd") {
            if (params.length) {
              let finalInputPath = params[0].split("/");

              if (finalInputPath.length === 0) return;

              finalInputPath = finalInputPath.filter(
                (pathSlice) => pathSlice.length
              );

              if (
                findFolder(
                  root as Folder,
                  finalInputPath.filter((pathSlice) => pathSlice.length)
                ) === null
              )
                return;

              setPath(finalInputPath.filter((pathSlice) => pathSlice.length));
            }

            prevHistory.push(<br key={GenerateUUID()} />);
          } else {
            const response = executeBinary(["bin"], command, path, true, {
              ...params,
            });
            prevHistory.push(<br key={GenerateUUID()} />, response);
          }
        } catch (e: any) {
          prevHistory.push(
            <br key={GenerateUUID()} />,
            <span key={GenerateUUID()} className="terminal-red">
              {e?.message}
            </span>
          );
        }
      }

      setTerminalHistory([...prevHistory, <br key={GenerateUUID()} />]);
    },
    [isSu, path, root, terminalHistory]
  );

  const moveCursorToEnd = useCallback(() => {
    const el = terminalInputRef.current;
    if (!el) return;

    el.focus();

    const range = document.createRange();
    const sel = window.getSelection();

    range.selectNodeContents(el);
    range.collapse(false);
    sel?.removeAllRanges();
    sel?.addRange(range);
  }, []);

  useEffect(() => {
    moveCursorToEnd();
  }, [moveCursorToEnd, terminalHistory]);

  const ensureCursorAfterShellInfo = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      if (!terminalInputRef.current) return;

      const selection = window.getSelection();
      if (!selection?.rangeCount) return;

      const range = selection.getRangeAt(0);
      const { startContainer, startOffset } = range;

      const nonEditableSpan = terminalInputRef.current.querySelector(
        ".terminal-shell-info"
      );

      if (
        startContainer === terminalInputRef.current &&
        startOffset === 0 &&
        nonEditableSpan
      ) {
        const newRange = document.createRange();
        newRange.setStartAfter(nonEditableSpan);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    },
    []
  );

  const handleValidateKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      ensureCursorAfterShellInfo(e);

      const text =
        (e.target as HTMLSpanElement).childNodes.length > 1
          ? (e.target as HTMLSpanElement).childNodes[1]
          : undefined;

      if (e.key === "Backspace" && !text) e.preventDefault();

      if (e.key === "Enter") {
        execute(text?.textContent ?? undefined);
        if (text) text.remove();
        e.preventDefault();
      }
    },
    [ensureCursorAfterShellInfo, execute]
  );

  return (
    <div>
      <WindowOptions
        options={useMemo(
          () => [
            {
              name: "File",
              dropdownOptions: [
                {
                  name: "New tab",
                },
                {
                  name: "New window",
                },
                { name: "Configuration" },
                {
                  name: "Exit",
                  onClick: () =>
                    kill({ path: [], params: { proccessId: uid } }),
                },
              ],
            },
          ],
          [uid]
        )}
      />
      <div
        className="terminal-container"
        style={{ height: size.height - 50 }}
        onClick={(e) => {
          if (!(e.target as HTMLElement).isContentEditable) {
            terminalInputRef.current?.focus();
            moveCursorToEnd();
          }
        }}
      >
        <div className="terminal-history" contentEditable={false}>
          {terminalHistory}
        </div>
        <span
          suppressContentEditableWarning
          className="terminal-input"
          role="textbox"
          contentEditable
          spellCheck="false"
          onKeyDown={handleValidateKeyDown}
          onMouseUp={ensureCursorAfterShellInfo}
          ref={terminalInputRef}
        >
          {printShellInfo(isSu, path)}
        </span>
      </div>
    </div>
  );
};

export const terminalEntry: ProgramEntry<TerminalProps> = {
  component: Terminal,
  name: "Terminal",
  shouldShowFrame: true,
  defaultX: window.innerWidth / 2 - 400,
  defaultY: window.innerHeight / 2 - 400,
  defaultHeight: 500,
  defaultWidth: 800,
  icon: terminalIcon,
  minWidth: 340,
  minHeight: 400,
};
