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
import trashIcon from "../../assets/img/trash-small.png";
import imagesIcon from "../../assets/img/images.png";
import musicIcon from "../../assets/img/music.png";
import videosIcon from "../../assets/img/videos.png";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux";
import { File, Folder, GeneralFile } from "../../model/file";
import {
  findFolder,
  getFileIcon,
  getUniqueFileName,
  isValidFileMove,
} from "../../utils/filesystemUtils";
import { cp, kill, mkdir, mv, rm, touch } from "../../utils/binaries";
import { copy, cut, paste } from "../../redux/reducers/ClipboardReducer";
import { Modal } from "../general/Modal";
import { AboutContent } from "../general/AboutContent";

interface FileExplorerProps {
  startingPath?: string[];
  uid: string;
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
  cut: boolean;
  path: string[];
}

const FileEntry: FC<FileEntryProps> = ({
  file,
  onClick,
  selected,
  cut,
  path,
}) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileEntryRef = useRef<HTMLDivElement>(null);
  const dragCopyRef = useRef<HTMLDivElement | null>(null);

  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.dataTransfer.setData("file", JSON.stringify({ file, path }));
      e.dataTransfer.setData(`filePath-${[...path, file.name].join("/")}`, "");

      if (fileEntryRef.current) {
        const copy = fileEntryRef.current?.cloneNode(true);
        (copy as HTMLDivElement).style.backgroundColor = "transparent";
        (copy as HTMLDivElement).style.border = "none";
        (copy as HTMLDivElement).style.outline = "none";
        (copy as HTMLDivElement).style.alignItems = "center";
        (copy as HTMLDivElement).style.display = "flex";
        (copy as HTMLDivElement).style.flexDirection = "column";
        (copy as HTMLDivElement).style.width = "100px";
        document.body.appendChild(copy);
        dragCopyRef.current = copy as HTMLDivElement;
        e.dataTransfer.setDragImage(copy as HTMLDivElement, 0, 0);
      }
    },
    [file, path],
  );

  const handleDragEnd = () => {
    if (dragCopyRef.current) {
      document.body.removeChild(dragCopyRef.current);
      dragCopyRef.current = null;
    }
  };

  const handleDropFile = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDraggingOver(false);

      if (file.type !== "folder") return;

      const { file: draggedFile, path: draggedFilePath } = JSON.parse(
        e.dataTransfer.getData("file"),
      ) as { file?: GeneralFile; path?: string[] };

      if (
        draggedFile &&
        draggedFile.name &&
        draggedFilePath &&
        isValidFileMove(
          [...draggedFilePath, draggedFile.name],
          [...path, file.name],
        )
      ) {
        mv({
          path,
          params: {
            source: [
              ...draggedFilePath,
              getUniqueFileName((file as Folder).files, draggedFile.name ?? ""),
            ],
            destination: [...path, file.name],
          },
        });
      }

      e.dataTransfer.clearData();
    },
    [file, path],
  );

  const handleDragFileOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (file.type !== "folder") return;

      const draggedFilePath = e.dataTransfer.types.find((type) =>
        type.startsWith("filepath-"),
      );

      if (draggedFilePath) {
        if (
          [...path, file.name].join("/").toLocaleLowerCase() ===
          draggedFilePath.replace("filepath-", "").toLocaleLowerCase()
        )
          return;
      }

      setIsDraggingOver(true);
    },
    [file, path],
  );

  const handleDragFileLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (file.type !== "folder") return;
      if (!e.currentTarget.contains(e.relatedTarget as HTMLDivElement))
        setIsDraggingOver(false);
    },
    [file.type],
  );

  return (
    <div
      className={`file-entry ${selected ? "selected" : ""} ${cut ? "cut" : ""}`}
      onClick={onClick}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDrop={handleDropFile}
      onDragOver={handleDragFileOver}
      style={useMemo(
        () =>
          isDraggingOver
            ? {
                outline: "1px dotted black",
              }
            : undefined,
        [isDraggingOver],
      )}
      onDragLeave={handleDragFileLeave}
      ref={fileEntryRef}
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
  defaultName?: string;
  ignoreBlurEvent?: boolean;
}

const FileEntryForm: FC<FileEntryFormProps> = ({
  onSubmit,
  type,
  defaultName,
  ignoreBlurEvent = false,
}) => {
  const [name, setName] = useState(
    type === "folder" ? "New folder" : "New file",
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (defaultName) {
      setName(defaultName);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.setSelectionRange(0, inputRef.current.value.length);
      }, 100);
    }
  }, [defaultName]);

  useEffect(() => {
    if (!ignoreBlurEvent)
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.setSelectionRange(0, inputRef.current.value.length);
      }, 50);
  }, [ignoreBlurEvent]);

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
          [],
        )}
        onBlur={useCallback(
          () => !ignoreBlurEvent && onSubmit(name, false),
          [ignoreBlurEvent, name, onSubmit],
        )}
        onKeyDown={useCallback(
          (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") onSubmit(name, false);
            if (e.key === "Escape") onSubmit("", false);
          },
          [name, onSubmit],
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
  {
    name: "Trash bin",
    icon: trashIcon,
    path: ["home", "user", ".local", "share", "Trash"],
  },
];

export const FileExplorer: FC<FileExplorerProps> = ({
  startingPath = HOME_PATH,
  uid,
}) => {
  const [path, setPath] = useState(startingPath);
  const [pathInputValue, setPathInputValue] = useState(
    `/${startingPath.join("/")}`,
  );
  const [cutFiles, setCutFiles] = useState<string[]>([]);
  const [showHiddenFiles, setShowHiddenFiles] = useState(false);
  const [isGridView, setIsGridView] = useState(true);
  const [backStack, setBackStack] = useState<string[][]>([startingPath]);
  const [forwardStack, setForwardStack] = useState<string[][]>([]);
  const root = useSelector((state: RootState) => state.fileSystem.root);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [renamingFileName, setRenamingFileName] = useState<string>();
  const [renamingFileError, setRenamingFileError] = useState<string>();
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(
    null,
  );
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  const { copiedValue, setForDeletion } = useSelector(
    (state: RootState) => state.clipboard,
  );
  const [creatingFileType, setCreatingFileType] = useState<"folder" | "file">();
  const [mainDivSize, setMainDivSize] = useState<{
    width: number;
    height: number;
  }>();
  const currentDirectory = useMemo(
    () => findFolder(root as Folder, path),
    [path, root],
  );
  const currFiles = useMemo(
    () =>
      currentDirectory?.files.filter(
        (file) => showHiddenFiles || !file.name.startsWith("."),
      ) ?? [],
    [currentDirectory?.files, showHiddenFiles],
  );
  const renamingFile = useMemo(
    () => currFiles.find((file) => file.name === renamingFileName),
    [currFiles, renamingFileName],
  );
  const fileListRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const mainDivRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    setSelectedFiles([]);
  }, [path]);

  useEffect(() => {
    if (!mainDivRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setMainDivSize({ width, height });
      }
    });

    resizeObserver.observe(mainDivRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const handleClickOutsideFileList = useCallback((event: MouseEvent) => {
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
    document.addEventListener("mousedown", handleClickOutsideFileList);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideFileList);
    };
  }, [handleClickOutsideFileList]);

  const onChangePathInputValue = useCallback(
    (value: string[]) => setPathInputValue(`/${value.join("/")}`),
    [],
  );

  const updatePath = useCallback(
    (newPath: string[]) => {
      setPath(newPath);
      onChangePathInputValue(newPath);
      setBackStack((prevBackStack) => [...prevBackStack, path]);
      setForwardStack([]);
    },
    [onChangePathInputValue, path],
  );

  const handleSelectFiles = useCallback(
    (index: number, fileName: string, event: React.MouseEvent) => {
      if (event.detail === 2) {
        const targetFile = currFiles.find((file) => file.name === fileName);

        if (targetFile?.type === "folder") {
          updatePath([...path, fileName]);
        } else {
          const command = (targetFile as File).command;

          try {
            if (command) command();
          } catch {}
        }
      }

      if (event.shiftKey && lastSelectedIndex !== null) {
        const start = Math.min(lastSelectedIndex, index);
        const end = Math.max(lastSelectedIndex, index);
        const range = currFiles.slice(start, end + 1).map((file) => file.name);
        setSelectedFiles((prevSelected) =>
          Array.from(new Set([...prevSelected, ...(range ?? [])])),
        );
      } else if (event.ctrlKey || event.metaKey) {
        setSelectedFiles((prevSelected) =>
          prevSelected.includes(fileName)
            ? prevSelected.filter((id) => id !== fileName)
            : [...prevSelected, fileName],
        );
        setLastSelectedIndex(index);
      } else {
        setSelectedFiles([fileName]);
        setLastSelectedIndex(index);
      }
    },
    [currFiles, lastSelectedIndex, path, updatePath],
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
        finalInputPath.filter((pathSlice) => pathSlice.length),
      ) === null
    )
      return;

    updatePath(finalInputPath.filter((pathSlice) => pathSlice.length));
  }, [pathInputValue, root, updatePath]);

  const handleSubmitNewFile = useCallback(
    (value: string, isCancel: boolean) => {
      if (!isCancel && value.length && creatingFileType && currentDirectory) {
        if (creatingFileType === "file")
          touch({
            path,
            params: {
              path,
              name: getUniqueFileName(currentDirectory.files, value),
            },
          });
        else
          mkdir({
            path,
            params: {
              path,
              name: getUniqueFileName(currentDirectory.files, value),
            },
          });
      }

      setCreatingFileType(undefined);
    },
    [creatingFileType, currentDirectory, path],
  );

  const handleShowAboutModal = useCallback(
    () => setAboutModalVisible(true),
    [],
  );
  const handleCloseAboutModal = useCallback(
    () => setAboutModalVisible(false),
    [],
  );

  const handleCloseRenameModal = useCallback(
    () => setRenamingFileName(undefined),
    [],
  );

  const handleRenameFile = useCallback(
    (newName: string) => {
      try {
        if (!renamingFileName) throw new Error("Please, input a valid name!");
        if (currFiles.find((file) => file.name === newName))
          throw new Error("There is already a file with that name!");
        mv({
          path,
          params: {
            source: [...path, renamingFileName],
            destination: [...path, newName],
          },
        });
        handleCloseRenameModal();
      } catch (e) {
        setRenamingFileError(`${e}`);
      }
    },
    [currFiles, handleCloseRenameModal, path, renamingFileName],
  );

  const handleCloseErrorModal = useCallback(
    () => setRenamingFileError(undefined),
    [],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const { file, path: oldPath } = JSON.parse(
        e.dataTransfer.getData("file"),
      ) as { file?: GeneralFile; path?: string[] };

      if (
        file &&
        oldPath &&
        path.join("/") !== oldPath.join("/") &&
        isValidFileMove([...oldPath, file.name], path)
      ) {
        mv({
          path,
          params: {
            source: [...oldPath, getUniqueFileName(currFiles, file.name)],
            destination: path,
          },
        });
      }

      e.dataTransfer.clearData();
    },
    [currFiles, path],
  );

  return (
    <div className="file-explorer" ref={mainDivRef}>
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
                {
                  name: "Exit",
                  onClick: () => kill({ path: [], params: { processId: uid } }),
                },
              ],
            },
            {
              name: "Edit",
              dropdownOptions: [
                {
                  name: "Rename",
                  isBlocked: selectedFiles?.length !== 1,
                  onClick: () => {
                    setRenamingFileName(selectedFiles[0]);
                  },
                },
                {
                  name: "Copy",
                  onClick: () => {
                    setCutFiles([]);

                    dispatch(
                      copy(
                        selectedFiles
                          .map((file) => path.join("/") + "/" + file)
                          .join(","),
                      ),
                    );
                  },
                },
                {
                  name: "Paste",
                  onClick: () => {
                    if (copiedValue) {
                      const files = copiedValue
                        .split(",")
                        .map((fileText) => fileText.split("/").filter(Boolean));

                      const differentPathFiles = files.filter(
                        (file) =>
                          file.slice(0, -1).join("/") !== path.join("/"),
                      );

                      for (const file of setForDeletion
                        ? differentPathFiles
                        : files) {
                        cp({
                          path,
                          params: {
                            sourcePath: file,
                            destPath: path,
                            r: true,
                            f: true,
                          },
                        });
                      }

                      if (setForDeletion && differentPathFiles.length)
                        rm({
                          path,
                          params: {
                            files: differentPathFiles,
                            r: true,
                            f: true,
                          },
                        });
                      dispatch(paste());
                      setCutFiles([]);
                    }
                  },
                },
                {
                  name: "Cut",
                  onClick: () => {
                    const files = selectedFiles.map(
                      (file) => path.join("/") + "/" + file,
                    );

                    setCutFiles(files);
                    dispatch(cut(files.join(",")));
                  },
                },
                {
                  name: "Move to the thrash bin",
                  onClick: () => {
                    for (const file of selectedFiles) {
                      if (
                        [
                          "home",
                          "home/.local",
                          "home/.local/share",
                          "home/.local/share/Trash",
                        ].includes([...path, file].join("/"))
                      )
                        return;

                      mv({
                        path,
                        params: {
                          source: [...path, file],
                          destination: [
                            "home",
                            "user",
                            ".local",
                            "share",
                            "Trash",
                          ],
                          f: true,
                        },
                      });
                    }
                  },
                },
              ],
            },
            {
              name: "View",
              dropdownOptions: [
                {
                  name: "Display as list",
                  onClick: () => setIsGridView(false),
                },
                { name: "Display as grid", onClick: () => setIsGridView(true) },
                {
                  name: showHiddenFiles
                    ? "Hide hidden files"
                    : "Show hidden files",
                  onClick: () => setShowHiddenFiles((prevValue) => !prevValue),
                },
              ],
            },
            {
              name: "Help",
              dropdownOptions: [
                { name: "About", onClick: handleShowAboutModal },
              ],
            },
          ],
          [
            copiedValue,
            dispatch,
            handleShowAboutModal,
            path,
            selectedFiles,
            setForDeletion,
            showHiddenFiles,
            uid,
          ],
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
            [path, updatePath],
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
            [],
          )}
          onKeyDown={useCallback(
            (e: React.KeyboardEvent) => {
              if (e.key === "Enter") handleInputSubmit();
            },
            [handleInputSubmit],
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
      <div
        className="content"
        ref={contentRef}
        onDragOver={useCallback(
          (e: React.DragEvent<HTMLDivElement>) => e.preventDefault(),
          [],
        )}
        onDrop={handleDrop}
      >
        <div className="left-panel">
          <div className="title">Shortcuts</div>
          {userShortcuts.map((shortcut) => (
            <ShortcutEntry
              shortcut={shortcut}
              key={shortcut.name}
              onClick={() =>
                updatePath(
                  shortcut.path ? shortcut.path : [...HOME_PATH, shortcut.name],
                )
              }
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
        <div
          className={`file-list ${isGridView ? "grid" : "list"}`}
          ref={fileListRef}
        >
          {currFiles.map((file, index) => (
            <FileEntry
              onClick={(e) => handleSelectFiles(index, file.name, e)}
              key={file.name}
              file={file}
              selected={selectedFiles.includes(file.name)}
              cut={cutFiles.includes([...path, file.name].join("/"))}
              path={path}
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
      <Modal
        title="About File Explorer"
        content={
          <AboutContent
            title="ZutiOS File explorer"
            version="1.0.0"
            description="This is a simple file explorer emulator for the web."
          />
        }
        visible={aboutModalVisible}
        onClose={handleCloseAboutModal}
        parentSize={mainDivSize}
      />
      <Modal
        title="Renaming file"
        content={
          <div className="rename-file-modal">
            <FileEntryForm
              onSubmit={handleRenameFile}
              type={(renamingFile?.type as "file" | "folder") ?? "file"}
              defaultName={renamingFileName}
              ignoreBlurEvent={true}
            />
            <div className="modal-options">
              <button>Cancel</button>
              <button>Confirm</button>
            </div>
          </div>
        }
        visible={!!renamingFile}
        onClose={handleCloseRenameModal}
        parentSize={mainDivSize}
      />
      <Modal
        title="Error renaming file"
        content={<div className="modal-error">{renamingFileError}</div>}
        visible={!!renamingFileError}
        onClose={handleCloseErrorModal}
        parentSize={mainDivSize}
      />
    </div>
  );
};

export const fileExplorerEntry: ProgramEntry<FileExplorerProps> = {
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
