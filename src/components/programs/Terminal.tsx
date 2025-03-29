import { FC, useCallback, useMemo, useState } from "react";
import { WindowOptions } from "../general/WindowOption";
import { executeBinary, kill } from "../../utils/binaries";
import { ProgramEntry } from ".";
import terminalIcon from "../../assets/img/terminal.gif";
import { GenericTerminalEmulator } from "../general/GenericTerminalEmulator";
import { Tab, Tabs } from "./Tabs";
import { useEffect } from "react";
import { AboutContent } from "../general/AboutContent";
import { Modal } from "../general/Modal";

interface TerminalProps {
  uid: string;
  startingPath?: string[];
  size: {
    width: number;
    height: number;
  };
}

export const Terminal: FC<TerminalProps> = ({ uid, size }) => {
  const [tabs, setTabs] = useState<Tab[]>([
    {
      title: "1",
      content: <GenericTerminalEmulator onKill={() => closeTab("tab-1")} />,
      key: "tab-1",
    },
  ]);
  const [tabCount, setTabCount] = useState(1);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  const handleShowAboutModal = useCallback(
    () => setAboutModalVisible(true),
    [],
  );
  const handleCloseAboutModal = useCallback(
    () => setAboutModalVisible(false),
    [],
  );

  const handleExitProgram = useCallback(
    () => kill({ path: [], params: { processId: uid } }),
    [uid],
  );

  useEffect(() => {
    if (tabs.length === 0) handleExitProgram();
  }, [handleExitProgram, tabs.length]);

  const closeTab = useCallback((keyToClose: string) => {
    setTabs((prevTabs) => prevTabs.filter((tab) => tab.key !== keyToClose));
  }, []);

  const onAddTab = useCallback(() => {
    const key = `tab-${tabCount + 1}`;

    setTabs((prevTabs) => [
      ...prevTabs,
      {
        title: `${tabCount + 1}`,
        content: <GenericTerminalEmulator onKill={() => closeTab(key)} />,
        key,
      },
    ]);
    setTabCount(tabCount + 1);
  }, [closeTab, tabCount]);

  const handleOpenNewInstance = useCallback(() => {
    executeBinary(["bin"], "terminal");
  }, []);

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
                  onClick: onAddTab,
                },
                {
                  name: "New window",
                  onClick: handleOpenNewInstance,
                },
                {
                  name: "Exit",
                  onClick: handleExitProgram,
                },
              ],
            },
            {
              name: "Help",
              dropdownOptions: [
                {
                  name: "About",
                  onClick: handleShowAboutModal,
                },
              ],
            },
          ],
          [
            handleExitProgram,
            handleOpenNewInstance,
            handleShowAboutModal,
            onAddTab,
          ],
        )}
      />
      <Tabs tabs={tabs} />
      <Modal
        title="About Terminal"
        content={
          <AboutContent
            title="ZutiOS Terminal"
            version="0.0.1"
            description="This is a simple terminal emulator for the web."
          />
        }
        visible={aboutModalVisible}
        onClose={handleCloseAboutModal}
        parentSize={{ width: size.width, height: size.height - 2 }}
      />
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
