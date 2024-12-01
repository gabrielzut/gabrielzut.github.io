import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { closeProgram } from "../../redux/reducers/ProcessManagerReducer";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux";
import { programCategories, ProgramCategory, ProgramEntry } from ".";
import shutDownIcon from "../../assets/img/shutdown.gif";
import executableIcon from "../../assets/img/executable.png";
import simpleArrowIcon from "../../assets/img/simple-arrow.png";
import { shutDownSystem } from "../../redux/reducers/SystemReducer";
import { openProgram } from "../../utils/binaries";

interface ProgramCategoryEntryProps {
  name: string;
  icon: string;
  onClick: React.MouseEventHandler;
}

export const ProgramCategoryEntry: FC<ProgramCategoryEntryProps> = ({
  name,
  icon,
  onClick,
}) => {
  return (
    <div className="program-category-entry" onClick={onClick}>
      <img alt={`program category ${name} menu icon`} src={icon}></img>
      {name}
    </div>
  );
};

interface MainMenuProps {}

export const MainMenu: FC<MainMenuProps> = () => {
  const menuRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const [expandedCategory, setExpandedCategory] = useState<ProgramCategory>();
  const openedPrograms = useSelector(
    (state: RootState) => state.processManager.programs
  );
  const id = useMemo(
    () => openedPrograms.find((program) => program.name === "mainMenu")?.id,
    [openedPrograms]
  );

  useEffect(() => {
    menuRef.current?.focus();
  }, []);

  const handleOpenProgram = useCallback(
    (program: ProgramEntry) => {
      openProgram(program);
      if (id) dispatch(closeProgram(id));
    },
    [dispatch, id]
  );

  const handleCloseExpandedCategory = useCallback(() => {
    setExpandedCategory(undefined);
  }, []);

  return (
    <div
      ref={menuRef}
      className="main-menu"
      tabIndex={0}
      onBlur={useCallback(
        (e: React.FocusEvent<HTMLDivElement>) => {
          if (
            id &&
            !e.relatedTarget?.className.includes("start-button") &&
            !menuRef.current?.contains(e.relatedTarget)
          )
            dispatch(closeProgram(id));
        },
        [dispatch, id]
      )}
    >
      <div className="vertical-name">
        <div>
          ZutiOS<b>98</b>
        </div>
      </div>
      <input
        name="menu-search"
        type="text"
        className="search-bar"
        placeholder="Search program"
      />
      <div className="program-list">
        {expandedCategory ? (
          <>
            <div className="program-category-entry-expanded">
              <button onClick={handleCloseExpandedCategory}>
                <img alt="go-back-icon" src={simpleArrowIcon} />
              </button>
              <img
                alt={`${expandedCategory.name} category expanded icon`}
                src={expandedCategory.icon}
              />
              {expandedCategory.name}
            </div>
            {expandedCategory.programs.map((program) => (
              <ProgramCategoryEntry
                onClick={() => handleOpenProgram(program)}
                name={program.name}
                key={program.name + "-program"}
                icon={program.icon ?? executableIcon}
              />
            ))}
          </>
        ) : (
          <>
            {programCategories.map((category) => (
              <ProgramCategoryEntry
                onClick={() => setExpandedCategory(category)}
                name={category.name}
                key={category.name + "-category"}
                icon={category.icon}
              />
            ))}
          </>
        )}
      </div>
      <button
        className="shutdown-button"
        onClick={useCallback(() => dispatch(shutDownSystem()), [dispatch])}
      >
        <img src={shutDownIcon} alt="Shutdown icon" />
        Shutdown computer...
      </button>
    </div>
  );
};

export const mainMenuProgramEntry: ProgramEntry = {
  component: MainMenu,
  name: "mainMenu",
  defaultWidth: 300,
  defaultHeight: 400,
  shouldShowFrame: false,
  defaultX: 5,
  defaultY: 43,
};
