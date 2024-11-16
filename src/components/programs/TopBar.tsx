import { FC, ReactNode, useCallback, useEffect, useRef, useState } from "react";
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
import { GenerateUUID } from "../../utils/generators";
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

export const TopBarClock: FC<{}> = () => {
  const [dateAndTime, setDateAndTime] = useState(
    new Date().toLocaleTimeString()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setDateAndTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <div className="clock">{dateAndTime}</div>;
};

export const TopBar: FC<TopBarProps> = () => {
  const openedPrograms = useSelector(
    (state: RootState) => state.processManager.programs
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const [showArrows, setShowArrows] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const firstRender = useRef(true);
  const dispatch = useDispatch();

  const checkOverflow = useCallback(() => {
    const container = containerRef.current;

    if (container) {
      const { scrollWidth, clientWidth, scrollLeft } = container;

      setShowArrows(scrollWidth > clientWidth);
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth);
    }
  }, []);

  const scroll = useCallback((direction: "left" | "right") => {
    const container = containerRef.current;
    if (container) {
      const scrollAmount =
        direction === "left"
          ? -container.clientWidth / 2
          : container.clientWidth / 2;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    checkOverflow();
    const container = containerRef.current;

    const resizeObserver = new ResizeObserver(() => checkOverflow());

    if (container) {
      resizeObserver.observe(container);
      container.addEventListener("scroll", checkOverflow);
    }

    return () => {
      window.removeEventListener("resize", checkOverflow);
      resizeObserver.disconnect();

      if (container) {
        container.removeEventListener("scroll", checkOverflow);
      }
    };
  }, [checkOverflow]);

  useEffect(() => {}, []);

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
        <div className="app-menu-wrapper">
          {showArrows && canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="navigation-button left"
            >
              &lt;
            </button>
          )}
          <div className="app-menu" ref={containerRef}>
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
          {showArrows && canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="navigation-button right"
            >
              &gt;
            </button>
          )}
        </div>
      </div>
      <div className="system-tray">
        {openedPrograms.map((program) => (
          <TrayIcon key={program.id + "-tray-icon"}>
            {program.renderIcon()}
          </TrayIcon>
        ))}
        <TopBarClock />
      </div>
    </div>
  );
};
