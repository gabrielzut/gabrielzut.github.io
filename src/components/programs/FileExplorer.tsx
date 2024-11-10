import { FC, useCallback, useState } from "react";
import { ProgramEntry } from ".";
import folderIcon from "../../assets/img/folder.gif";
import { WindowOptions } from "../general/WindowOption";
import arrowIcon from "../../assets/img/go-back.png";
import homeIcon from "../../assets/img/home.png";
import searchIcon from "../../assets/img/search.png";

interface FileExplorerProps {
  startingPath?: string[];
}

const HOME_PATH = ["home", "user"];

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
      <div className="content">
        <div className="left-panel">
          
        </div>
        <div className="file-list"></div>
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
};
