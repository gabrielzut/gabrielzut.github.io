import { fileExplorerEntry } from "./FileExplorer";
import systemIcon from "../../assets/img/system.png";

export interface ProgramEntry<T> {
  component: React.FC<T>;
  name: string;
  shouldShowFrame: boolean;
  defaultWidth?: number;
  defaultHeight?: number;
  icon?: string;
  trayIcon?: React.FC;
  defaultX?: number;
  defaultY?: number;
  minWidth?: number;
  minHeight?: number;
  props?: T;
}

export interface ProgramCategory {
  name: string;
  programs: { entry: ProgramEntry<any>; path: string[] }[];
  icon: string;
}

export const programCategories: ProgramCategory[] = [
  {
    name: "System",
    programs: [{ entry: fileExplorerEntry, path: ["bin", "fileExplorer"] }],
    icon: systemIcon,
  },
];
