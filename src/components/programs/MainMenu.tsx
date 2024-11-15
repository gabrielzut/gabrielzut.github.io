import { FC, useCallback, useEffect, useMemo, useRef } from "react";
import { closeProgram } from "../../redux/reducers/ProcessManagerReducer";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux";
import { programCategories, ProgramEntry } from ".";
import shutDownIcon from "../../assets/img/shutdown.gif";
import { shutDownSystem } from "../../redux/reducers/SystemReducer";

interface ProgramCategoryProps {
  name: string;
  icon: string;
}

export const ProgramCategory: FC<ProgramCategoryProps> = ({ name, icon }) => {
  return (
    <div className="program-category-entry">
      <img alt={`program category ${name} menu icon`} src={icon}></img>
      {name}
    </div>
  );
};

interface MainMenuProps {}

export const MainMenu: FC<MainMenuProps> = () => {
  const menuRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
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
      <input type="text" className="search-bar" placeholder="Search program" />
      <div className="program-list">
        {programCategories.map((category) => (
          <ProgramCategory
            name={category.name}
            key={category.name + "-category"}
            icon={category.icon}
          />
        ))}
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
