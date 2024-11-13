import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ProgramEntry } from ".";
import folderIcon from "../../assets/img/folder.gif";
import { WindowOptions } from "../general/WindowOption";
import arrowIcon from "../../assets/img/go-back.png";
import homeIcon from "../../assets/img/home.png";
import searchIcon from "../../assets/img/search.png";
import { useSelector } from "react-redux";
import { RootState } from "../../redux";
import { Folder, GeneralFile } from "../../model/file";
import { findFolder, getFileIcon } from "../../utils/filesystemUtils";

interface FileExplorerProps {
  startingPath?: string[];
}

const HOME_PATH = ["home", "user"];

interface ShortcutEntryProps {
  shortcut: { name: string; icon: string };
}

const ShortcutEntry: FC<ShortcutEntryProps> = ({ shortcut }) => {
  return <div className="shortcut-entry">{shortcut.name}</div>;
};

interface FileEntryProps {
  file: GeneralFile;
  onClick: (event: React.MouseEvent) => void;
  selected: boolean;
}

const FileEntry: FC<FileEntryProps> = ({ file, onClick, selected }) => {
  return (
    <div
      className={`file-entry ${selected ? "selected" : ""}`}
      onClick={onClick}
    >
      <div className="icon">
        {
          <img
            alt={`${file.name} icon`}
            src={file.icon || getFileIcon(file.type)}
          />
        }
      </div>
      <div className="file-name">{file.name}</div>
    </div>
  );
};

const userShortcuts = [
  { name: "Documents", icon: "" },
  { name: "Downloads", icon: "" },
  { name: "Images", icon: "" },
  { name: "Music", icon: "" },
  { name: "Public", icon: "" },
  { name: "Videos", icon: "" },
];

export const FileExplorer: FC<FileExplorerProps> = ({
  startingPath = HOME_PATH,
}) => {
  const [path, setPath] = useState(startingPath);
  const [pathInputValue, setPathInputValue] = useState(
    `/${startingPath.join("/")}`
  );
  const [isSearching, setIsSearching] = useState(false);
  const [backStack, setBackStack] = useState<string[][]>([startingPath]);
  const [forwardStack, setForwardStack] = useState<string[][]>([]);
  const root = useSelector((state: RootState) => state.fileSystem.root);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(
    null
  );
  const currentDirectory = useMemo(
    () => findFolder(root as Folder, path),
    [path, root]
  );
  const fileListRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedFiles([]);
  }, [path]);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    const isClickOutsideFileList =
      fileListRef.current &&
      !fileListRef.current.contains(event.target as Node);
    const isClickInsideContent =
      contentRef.current && contentRef.current.contains(event.target as Node);

    if (isClickOutsideFileList && isClickInsideContent) {
      setSelectedFiles([]);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  const onChangePathInputValue = useCallback(
    (value: string[]) => setPathInputValue(`/${value.join("/")}`),
    []
  );

  const updatePath = useCallback(
    (newPath: string[]) => {
      setPath(newPath);
      onChangePathInputValue(newPath);
      setBackStack((prevBackStack) => [...prevBackStack, path]);
      setForwardStack([]);
    },
    [onChangePathInputValue, path]
  );

  const handleSelectFiles = useCallback(
    (index: number, fileName: string, event: React.MouseEvent) => {
      if (event.detail === 2) {
        updatePath([...path, fileName]);
      }

      if (event.shiftKey && lastSelectedIndex !== null) {
        const start = Math.min(lastSelectedIndex, index);
        const end = Math.max(lastSelectedIndex, index);
        const range = currentDirectory?.files
          .slice(start, end + 1)
          .map((file) => file.name);
        setSelectedFiles((prevSelected) =>
          Array.from(new Set([...prevSelected, ...(range ?? [])]))
        );
      } else if (event.ctrlKey || event.metaKey) {
        setSelectedFiles((prevSelected) =>
          prevSelected.includes(fileName)
            ? prevSelected.filter((id) => id !== fileName)
            : [...prevSelected, fileName]
        );
        setLastSelectedIndex(index);
      } else {
        setSelectedFiles([fileName]);
        setLastSelectedIndex(index);
      }
    },
    [currentDirectory?.files, lastSelectedIndex, path, updatePath]
  );

  const handleGoBack = useCallback(() => {
    if (backStack.length === 0) return;

    const previousPath = backStack[backStack.length - 1];

    setBackStack((prevBackStack) => prevBackStack.slice(0, -1));
    setForwardStack((prevForwardStack) => [path, ...prevForwardStack]);
    setPath(previousPath);
    onChangePathInputValue(previousPath);
  }, [backStack, onChangePathInputValue, path]);

  const handleGoForward = useCallback(() => {
    if (forwardStack.length === 0) return;

    const nextPath = forwardStack[0];
    setForwardStack((prevForwardStack) => prevForwardStack.slice(1));
    setBackStack((prevBackStack) => [...prevBackStack, path]);
    setPath(nextPath);
    onChangePathInputValue(nextPath);
  }, [forwardStack, onChangePathInputValue, path]);

  const handleToggleSearching = useCallback(() => {
    setIsSearching(!isSearching);
  }, [isSearching]);

  return (
    <div className="file-explorer">
      <WindowOptions
        options={[
          {
            name: "File",
            dropdownOptions: [
              { name: "Create folder" },
              { name: "Create file" },
              { name: "Open terminal" },
              { name: "Exit" },
            ],
          },
          {
            name: "Edit",
            dropdownOptions: [
              { name: "Copy" },
              { name: "Paste" },
              { name: "Cut" },
              { name: "Move to the thrash bin" },
            ],
          },
          {
            name: "View",
            dropdownOptions: [
              { name: "Display as list" },
              { name: "Display as grid" },
            ],
          },
          { name: "Help", dropdownOptions: [{ name: "About" }] },
        ]}
      />
      <div className="navigation-bar">
        <button onClick={handleGoBack}>
          <img className="icon" src={arrowIcon} alt="Go back icon" />
        </button>
        <button onClick={handleGoForward}>
          <img
            className="icon go-forward"
            src={arrowIcon}
            alt="Go forward icon"
          />
        </button>
        <button
          onClick={useCallback(
            () => updatePath(path.slice(0, -1)),
            [path, updatePath]
          )}
        >
          <img className="icon go-up" src={arrowIcon} alt="Go up icon" />
        </button>
        <button
          onClick={useCallback(() => updatePath(HOME_PATH), [updatePath])}
        >
          <img className="icon" src={homeIcon} alt="Home icon" />
        </button>
        <div className="divider" />
        <input
          value={pathInputValue}
          onChange={useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) =>
              setPathInputValue(e.target.value),
            []
          )}
        />
        <button>
          <img
            className="icon"
            src={searchIcon}
            alt="Search icon"
            onClick={handleToggleSearching}
          />
        </button>
      </div>
      <div className="content" ref={contentRef}>
        <div className="left-panel">
          <div className="title">Shortcuts</div>
          {userShortcuts.map((shortcut) => (
            <ShortcutEntry shortcut={shortcut} key={shortcut.name} />
          ))}
        </div>
        <div className="file-list" ref={fileListRef}>
          {currentDirectory?.files.map((file, index) => (
            <FileEntry
              onClick={(e) => handleSelectFiles(index, file.name, e)}
              key={file.name}
              file={file}
              selected={selectedFiles.includes(file.name)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export const fileExplorerEntry: ProgramEntry = {
  component: FileExplorer,
  name: "File Explorer",
  shouldShowFrame: true,
  defaultX: window.innerWidth / 2 - 400,
  defaultY: window.innerHeight / 2 - 400,
  defaultHeight: 800,
  defaultWidth: 800,
  icon: folderIcon,
  minWidth: 340,
  minHeight: 400,
};
