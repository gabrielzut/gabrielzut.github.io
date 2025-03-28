import { FC, useMemo } from "react";
import { WindowOptions } from "../general/WindowOption";
import { kill } from "../../utils/binaries";
import { ProgramEntry } from ".";
import terminalIcon from "../../assets/img/terminal.gif";
import { GenericTerminalEmulator } from "../general/GenericTerminalEmulator";

interface TerminalProps {
  uid: string;
  startingPath?: string[];
  size: {
    width: number;
    height: number;
  };
}

export const Terminal: FC<TerminalProps> = ({ uid, size }) => {
  return (
    <div className="terminal" style={{ height: size.height - 24 }}>
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
                  onClick: () => kill({ path: [], params: { processId: uid } }),
                },
              ],
            },
          ],
          [uid],
        )}
      />
      <GenericTerminalEmulator onKill={() => {}} />
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
