import { FC, ReactNode, useCallback, useEffect, useState } from "react";
import smallLogo from "../../assets/img/small-logo.png";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux";
import {
  addProgram,
  closeProgram,
  minimizeProgram,
  showProgram,
} from "../../redux/reducers/ProcessManagerReducer";
import { Program } from "../general/Program";
import { GenerateUUID } from "../../utils/Generators";
import { mainMenuProgramEntry } from "./MainMenu";

interface TrayIconProps {
  children: ReactNode;
}

export const TrayIcon: FC<TrayIconProps> = ({ children }) => {
  return <div className="tray-icon">{children}</div>;
};

interface AppMenuButtonProps {
  iconUrl?: string;
  name: string;
  id: string;
  minimized: boolean;
}

export const AppMenuButton: FC<AppMenuButtonProps> = ({
  iconUrl,
  name,
  id,
  minimized,
}) => {
  const dispatch = useDispatch();

  return (
    <button
      className={`app-menu-button ${minimized ? "minimized" : false}`}
      onClick={useCallback(() => {
        if (minimized) {
          dispatch(showProgram(id));
        } else {
          dispatch(minimizeProgram(id));
        }
      }, [dispatch, id, minimized])}
    >
      <img
        src={iconUrl}
        className="app-menu-button-icon"
        draggable={false}
        alt={`${name} menu option`}
      />
      {name}
    </button>
  );
};

interface TopBarProps {}

function newMenu() {
  return new Program(
    GenerateUUID(),
    mainMenuProgramEntry.name,
    mainMenuProgramEntry.component,
    mainMenuProgramEntry.shouldShowFrame,
    mainMenuProgramEntry.trayIcon,
    mainMenuProgramEntry.defaultX,
    mainMenuProgramEntry.defaultY,
    false,
    mainMenuProgramEntry.icon,
    false,
    mainMenuProgramEntry.defaultWidth,
    mainMenuProgramEntry.defaultHeight
  );
}

export const TopBar: FC<TopBarProps> = () => {
  const [dateAndTime, setDateAndTime] = useState(
    new Date().toLocaleTimeString()
  );
  const openedPrograms = useSelector(
    (state: RootState) => state.processManager.programs
  );
  const dispatch = useDispatch();

  useEffect(() => {
    setInterval(() => {
      setDateAndTime(new Date().toLocaleTimeString());
    }, 1000);
  }, []);

  return (
    <div className="top-bar">
      <div className="left">
        <button
          className="start-button"
          onClick={useCallback(() => {
            const id = openedPrograms.find(
              (program) => program.name === "mainMenu"
            )?.id;
            if (id) {
              dispatch(closeProgram(id));
            } else {
              dispatch(addProgram(newMenu()));
            }
          }, [dispatch, openedPrograms])}
        >
          <img
            src={smallLogo}
            className="logo"
            draggable={false}
            alt="ZutiOS logotype"
          />
        </button>
        <div className="divider" />
        <div className="app-menu">
          {openedPrograms
            .filter((program) => program.shouldShowInThePanel)
            .map((program) => (
              <AppMenuButton
                key={program.id + "-app-menu"}
                id={program.id}
                name={program.name}
                iconUrl={program.icon}
                minimized={program.minimized}
              />
            ))}
        </div>
      </div>
      <div className="system-tray">
        {openedPrograms.map((program) => (
          <TrayIcon key={program.id + "-tray-icon"}>
            {program.renderIcon()}
          </TrayIcon>
        ))}
        <div className="clock">{dateAndTime}</div>
      </div>
    </div>
  );
};
