import { FC } from "react";
import icon from "../../assets/img/warn.gif";
import { ProgramEntry } from ".";

interface WarnProps {}

const Warn: FC<WarnProps> = (props) => {
  return (
    <div className="warn">
      <div>
        <img
          src={icon}
          className="logo"
          draggable={false}
          alt="ZutiOS logotype"
        />
      </div>
      Under construction!
    </div>
  );
};

export default Warn;

export const warnIcon = icon;

export const warnProgramEntry: ProgramEntry = {
  component: Warn,
  name: "Warning",
  shouldShowFrame: true,
  defaultX: window.innerWidth / 2 - 75,
  defaultY: window.innerHeight / 2 - 75,
  icon: warnIcon,
};
