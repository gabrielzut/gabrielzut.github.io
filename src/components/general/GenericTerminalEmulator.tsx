import {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { executeBinary } from "../../utils/binaries";
import { findFileOrFolder } from "../../utils/filesystemUtils";
import { GenerateUUID } from "../../utils/generators";
import {
  autoComplete,
  getPathFromCommand,
  handleExportEnv,
  printShellInfo,
  replaceEnvs,
  splitIgnoringQuotes,
} from "../../utils/shellUtils";

const HOME_PATH = ["home", "user"];

interface GenericTerminalEmulatorProps {
  onKill: VoidFunction;
}

export const GenericTerminalEmulator: FC<GenericTerminalEmulatorProps> = ({
  onKill,
}) => {
  const [isSu, setIsSu] = useState(false);
  const [path, setPath] = useState(HOME_PATH);
  const terminalInputRef = useRef<HTMLSpanElement>(null);
  const [terminalHistory, setTerminalHistory] = useState<ReactNode[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([""]);
  const [suCommandHistory, setSuCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const updateCommandHistory = useCallback(
    (text: string) => {
      (isSu ? setSuCommandHistory : setCommandHistory)((prevCommandHistory) => [
        ...prevCommandHistory,
        text,
      ]);
    },
    [isSu],
  );

  const currCommandHistory = useMemo(
    () => (isSu ? suCommandHistory : commandHistory),
    [commandHistory, isSu, suCommandHistory],
  );

  const execute = useCallback(
    (text?: string) => {
      let prevHistory = [...terminalHistory];

      prevHistory.push(printShellInfo(isSu, path));

      if (text) {
        prevHistory.push(text);

        try {
          const params = text.includes(" ")
            ? splitIgnoringQuotes(text).map(replaceEnvs)
            : [];
          const command = replaceEnvs(text.split(" ")[0]).trim();

          if (command === "cd") {
            if (params.length) {
              const newPath = getPathFromCommand(params[1], path);

              const file = findFileOrFolder(
                newPath.filter((pathSlice) => pathSlice.length),
              );

              if (file === null) {
                throw new Error(
                  `cd: The directory ${params[1]} does not exist.`,
                );
              } else if (file.type !== "folder") {
                throw new Error(`cd: '${params[1]}' is not a directory.`);
              }

              setPath(newPath.filter((pathSlice) => pathSlice.length));
            }
          } else if (command === "clear") {
            prevHistory = [];
          } else if (command === "exit") {
            if (isSu) {
              setIsSu(false);
            } else {
              onKill();
            }
          } else if (command === "sudo" && params[1] === "su") {
            setIsSu(true);
          } else if (command === "export") {
            for (const param of params) {
              handleExportEnv(param);
            }
          } else {
            const response = executeBinary(
              ["bin"],
              command,
              path,
              true,
              {
                textParams: params.slice(1),
              },
              "gsh",
            );
            prevHistory.push(<br key={GenerateUUID()} />, response);
          }
        } catch (e: any) {
          prevHistory.push(
            <br key={GenerateUUID()} />,
            <span key={GenerateUUID()} className="terminal-red">
              {e?.message}
            </span>,
          );
        }
      }

      text && updateCommandHistory(text);
      setTerminalHistory([
        ...prevHistory,
        ...(text !== "clear" ? [<br key={GenerateUUID()} />] : []),
      ]);
    },
    [isSu, onKill, path, terminalHistory, updateCommandHistory],
  );

  const getCursorPosition = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return null;

    const range = selection.getRangeAt(0);
    const container = range.startContainer;

    if (terminalInputRef.current?.contains(container)) {
      return range.startOffset;
    }
    return null;
  }, []);

  const restoreCursorPosition = useCallback(
    (cursor: { node: Node; offset: number } | null) => {
      if (!cursor) return;

      const selection = window.getSelection();
      if (selection) {
        const range = document.createRange();
        range.setStart(cursor.node, cursor.offset);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    },
    [],
  );

  const focusTextNode = useCallback(() => {
    terminalInputRef.current?.focus();

    const selection = window.getSelection();
    if (!selection) return;

    const range = document.createRange();

    const childNode =
      terminalInputRef.current?.childNodes[1]?.nodeName === "#text"
        ? terminalInputRef.current?.childNodes[1]
        : terminalInputRef.current?.childNodes[0];

    if (childNode?.nodeName === "#text") {
      range.setStart(childNode as Node, childNode.textContent?.length ?? 0);
      range.collapse(true);

      selection.removeAllRanges();
      selection.addRange(range);
    }
  }, []);

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

    focusTextNode();
  }, [focusTextNode]);

  useEffect(() => {
    const firstSpanElement = terminalInputRef.current?.childNodes[0];

    if (terminalInputRef.current && firstSpanElement?.nodeName === "#text") {
      const firstElementClone =
        terminalInputRef.current.childNodes[0].cloneNode(true);
      terminalInputRef.current.removeChild(
        terminalInputRef.current.childNodes[0],
      );
      terminalInputRef.current.appendChild(firstElementClone);
      moveCursorToEnd();
    }
  }, [
    getCursorPosition,
    moveCursorToEnd,
    restoreCursorPosition,
    terminalHistory,
    historyIndex,
  ]);

  const ensureCursorAfterShellInfo = useCallback(() => {
    if (!terminalInputRef.current) return;

    const selection = window.getSelection();
    if (!selection?.rangeCount) return;

    const range = selection.getRangeAt(0);
    const { startContainer, startOffset } = range;

    const nonEditableSpan = terminalInputRef.current.querySelector(
      ".terminal-shell-info",
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
  }, []);

  const handleValidateKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      ensureCursorAfterShellInfo();

      let text: ChildNode | undefined = undefined;

      const childNodes = (e.target as HTMLSpanElement).childNodes;

      if (childNodes.length > 1) {
        for (let i = 1; i < childNodes.length; i++) {
          if (childNodes.item(i).textContent !== undefined) {
            text = childNodes.item(i);
            break;
          }
        }
      }

      if (e.key === "l" && e.ctrlKey) {
        execute("clear");
        e.preventDefault();
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();

        let index = Math.max(
          historyIndex < currCommandHistory.length
            ? historyIndex + 1
            : currCommandHistory.length - 1,
          0,
        );

        setHistoryIndex(index);

        if (!text) {
          (e.target as HTMLSpanElement).appendChild(
            document.createTextNode(
              currCommandHistory[currCommandHistory.length - index],
            ),
          );
        } else {
          text.textContent =
            currCommandHistory[currCommandHistory.length - index];
        }
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();

        let index = historyIndex !== 0 ? historyIndex - 1 : historyIndex;

        setHistoryIndex(index);

        if (!text) {
          (e.target as HTMLSpanElement).appendChild(
            document.createTextNode(
              currCommandHistory[currCommandHistory.length - index] ?? "",
            ),
          );
        } else {
          text.textContent =
            currCommandHistory[currCommandHistory.length - index] ?? "";
        }
      }

      if (e.key === "Backspace" && !text) e.preventDefault();

      if (e.key === "Tab" && text?.textContent) {
        const cursorPosition = getCursorPosition();

        const autoCompleteOptions = autoComplete(
          text.textContent,
          path,
          cursorPosition ?? 0,
        );

        if (autoCompleteOptions.suggestions.length === 1) {
          text.textContent = `${text.textContent.slice(
            0,
            cursorPosition
              ? cursorPosition - autoCompleteOptions.currentArg.length
              : 0,
          )}${autoCompleteOptions.suggestions[0]}${text.textContent.slice(
            cursorPosition
              ? cursorPosition + autoCompleteOptions.currentArg.length
              : 0,
          )}${autoCompleteOptions.isCommand ? "\u00A0" : ""}`;
        } else if (autoCompleteOptions.suggestions.length > 1) {
          setTerminalHistory((prevHistory) => [
            ...prevHistory,
            printShellInfo(isSu, path),
            text?.textContent ?? "",
            <br key={GenerateUUID()} />,
            autoCompleteOptions.suggestions.sort().join(" "),
            <br key={GenerateUUID()} />,
          ]);
        }

        moveCursorToEnd();
        e.preventDefault();
      }

      if (e.key === "Enter") {
        setHistoryIndex(0);
        execute(text?.textContent ?? undefined);
        if (text) text.remove();
        e.preventDefault();
      }
    },
    [
      currCommandHistory,
      ensureCursorAfterShellInfo,
      execute,
      getCursorPosition,
      historyIndex,
      isSu,
      moveCursorToEnd,
      path,
    ],
  );

  useEffect(() => {
    moveCursorToEnd();
  }, [moveCursorToEnd, terminalHistory]);

  return (
    <div
      className="terminal-container"
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
  );
};
