import { FC } from "react";
import { ProgramEntry } from ".";
import folderIcon from "../../assets/img/folder.gif";
import { WindowOption } from "../general/WindowOption";

interface FileExplorerProps {
  startingPath?: string;
}

export const FileExplorer: FC<FileExplorerProps> = ({
  startingPath = "/home/user",
}) => {
  return (
    <div className="file-explorer">
      <div className="window-options">
        <WindowOption
          name="File"
          dropdownOptions={[
            { name: "Create folder" },
            { name: "Create file" },
            { name: "Open terminal" },
            { name: "Exit" },
          ]}
        ></WindowOption>
        <WindowOption
          name="Edit"
          dropdownOptions={[
            { name: "Copy" },
            { name: "Paste" },
            { name: "Cut" },
            { name: "Move to the thrash bin" },
          ]}
        ></WindowOption>
        <WindowOption
          name="View"
          dropdownOptions={[
            { name: "Display as list" },
            { name: "Display as grid" },
          ]}
        ></WindowOption>
        <WindowOption
          name="Help"
          dropdownOptions={[{ name: "About" }]}
        ></WindowOption>
      </div>
      <div className="navigation-bar"></div>
      <div className="content">
        <div className="left-panel"></div>
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
