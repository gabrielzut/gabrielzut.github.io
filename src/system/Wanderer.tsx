import React, { FC } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux";
import { WindowTitle } from "../components/general/WindowTitle";
interface WandererProps {}

// Wanderer -> the main process responsible for the desktop environment
export const Wanderer: FC<WandererProps> = (props) => {
  const openedPrograms = useSelector(
    (state: RootState) => state.processManager.programs
  );

  return (
    <div className="wanderer">
      {openedPrograms.map((program) => (
        <div
          key={program.id}
          className={`program ${program.shouldShowFrame ? "framed" : ""}`}
        >
          {program.shouldShowFrame && <WindowTitle name={program.name} />}
          {program.render()}
        </div>
      ))}
    </div>
  );
};
