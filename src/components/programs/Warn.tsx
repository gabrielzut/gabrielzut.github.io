import { FC } from "react";
import icon from "../../assets/img/warn.gif";

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
