import React, { FC } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux";
interface WandererProps {}

export const Wanderer: FC<WandererProps> = (props) => {
  const openedPrograms = useSelector(
    (state: RootState) => state.processManager.programs
  );

  return (
    <div className="wanderer">
      {openedPrograms.map((program) => program.render())}
    </div>
  );
};
