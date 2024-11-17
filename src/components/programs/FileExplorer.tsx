import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ProgramEntry } from ".";
import folderIcon from "../../assets/img/folder.gif";
import blankFileIcon from "../../assets/img/blankFile.png";
import { WindowOptions } from "../general/WindowOption";
import arrowIcon from "../../assets/img/go-back.png";
import homeIcon from "../../assets/img/home.png";
import searchIcon from "../../assets/img/search.png";
import documentsIcon from "../../assets/img/documents.png";
import downloadsIcon from "../../assets/img/downloads.png";
import imagesIcon from "../../assets/img/images.png";
import musicIcon from "../../assets/img/music.png";
import videosIcon from "../../assets/img/videos.png";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux";
import { Folder, GeneralFile } from "../../model/file";
import {
  findFolder,
  getFileIcon,
  getUniqueFileName,
} from "../../utils/filesystemUtils";
import { addFile } from "../../redux/reducers/FileSystemReducer";

interface FileExplorerProps {
  startingPath?: string[];
}

const HOME_PATH = ["home", "user"];

interface ShortcutEntryProps {
  shortcut: { name: string; icon: string };
  onClick: React.MouseEventHandler;
}

const ShortcutEntry: FC<ShortcutEntryProps> = ({ shortcut, onClick }) => {
  return (
    <button onClick={onClick} className="shortcut-entry">
      <img
        className="icon"
        alt={`${shortcut.name} shortcut icon`}
        src={shortcut.icon}
      />
      <div className="name">{shortcut.name}</div>
    </button>
  );
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

interface FileEntryFormProps {
  onSubmit: (value: string, isCancel: boolean) => void;
  type: "folder" | "file";
}

const FileEntryForm: FC<FileEntryFormProps> = ({ onSubmit, type }) => {
  const [name, setName] = useState(
    type === "folder" ? "New folder" : "New file"
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  return (
    <div className="file-entry new">
      <div className="icon">
        {
          <img
            alt={`Creating ${type} icon`}
            src={type === "folder" ? folderIcon : blankFileIcon}
          />
        }
      </div>
      <input
        name="fileName"
        ref={inputRef}
        value={name}
        onChange={useCallback(
          (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value),
          []
        )}
        onBlur={useCallback(() => onSubmit(name, false), [name, onSubmit])}
        onKeyDown={useCallback(
          (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") onSubmit(name, false);
            if (e.key === "Escape") onSubmit("", false);
          },
          [name, onSubmit]
        )}
        className="file-name"
      />
    </div>
  );
};

const userShortcuts = [
  { name: "Documents", icon: documentsIcon },
  { name: "Downloads", icon: downloadsIcon },
  { name: "Images", icon: imagesIcon },
  { name: "Music", icon: musicIcon },
  { name: "Videos", icon: videosIcon },
];

export const FileExplorer: FC<FileExplorerProps> = ({
  startingPath = HOME_PATH,
}) => {
  const [path, setPath] = useState(startingPath);
  const [pathInputValue, setPathInputValue] = useState(
    `/${startingPath.join("/")}`
  );
  const [backStack, setBackStack] = useState<string[][]>([startingPath]);
  const [forwardStack, setForwardStack] = useState<string[][]>([]);
  const root = useSelector((state: RootState) => state.fileSystem.root);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(
    null
  );
  const [creatingFileType, setCreatingFileType] = useState<"folder" | "file">();
  const currentDirectory = useMemo(
    () => findFolder(root as Folder, path),
    [path, root]
  );
  const fileListRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();

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

  const handleInputSubmit = useCallback(() => {
    let finalInputPath = pathInputValue.split("/");

    if (finalInputPath.length === 0) return;

    finalInputPath = finalInputPath.filter((pathSlice) => pathSlice.length);

    if (
      findFolder(
        root as Folder,
        finalInputPath.filter((pathSlice) => pathSlice.length)
      ) === null
    )
      return;

    updatePath(finalInputPath.filter((pathSlice) => pathSlice.length));
  }, [pathInputValue, root, updatePath]);

  const handleSubmitNewFile = useCallback(
    (value: string, isCancel: boolean) => {
      if (!isCancel && value.length && creatingFileType) {
        if (currentDirectory?.files.some((file) => file))
          dispatch(
            addFile({
              file: {
                name: getUniqueFileName(currentDirectory.files, value),
                content: "",
                icon:
                  creatingFileType === "folder" ? folderIcon : blankFileIcon,
                type: creatingFileType,
                ...(creatingFileType === "folder" ? { files: [] } : {}),
              },
              path,
            })
          );
      }

      setCreatingFileType(undefined);
    },
    [creatingFileType, currentDirectory, dispatch, path]
  );

  return (
    <div className="file-explorer">
      <WindowOptions
        options={useMemo(
          () => [
            {
              name: "File",
              dropdownOptions: [
                {
                  name: "Create folder",
                  onClick: () => setCreatingFileType("folder"),
                },
                {
                  name: "Create file",
                  onClick: () => setCreatingFileType("file"),
                },
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
          ],
          []
        )}
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
          name="path"
          value={pathInputValue}
          onChange={useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) =>
              setPathInputValue(e.target.value),
            []
          )}
          onKeyDown={useCallback(
            (e: React.KeyboardEvent) => {
              if (e.key === "Enter") handleInputSubmit();
            },
            [handleInputSubmit]
          )}
        />
        <button>
          <img
            className="icon"
            src={searchIcon}
            alt="Search icon"
            onClick={handleInputSubmit}
          />
        </button>
      </div>
      <div className="content" ref={contentRef}>
        <div className="left-panel">
          <div className="title">Shortcuts</div>
          {userShortcuts.map((shortcut) => (
            <ShortcutEntry
              shortcut={shortcut}
              key={shortcut.name}
              onClick={() => updatePath([...HOME_PATH, shortcut.name])}
            />
          ))}
          <div className="divider" />
          <div className="title">Devices</div>
          <ShortcutEntry
            shortcut={{ name: "Filesystem", icon: documentsIcon }}
            key={"Filesystem"}
            onClick={useCallback(() => updatePath([]), [updatePath])}
          />
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
          {creatingFileType && (
            <FileEntryForm
              onSubmit={handleSubmitNewFile}
              type={creatingFileType}
            />
          )}
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
