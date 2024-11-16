import { fileExplorerEntry } from "./FileExplorer";
import systemIcon from "../../assets/img/system.png";

export interface ProgramEntry {
  component: React.FC;
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
}

export interface ProgramCategory {
  name: string;
  programs: ProgramEntry[];
  icon: string;
}

export const programCategories: ProgramCategory[] = [
  {
    name: "System",
    programs: [fileExplorerEntry],
    icon: systemIcon,
  },
];