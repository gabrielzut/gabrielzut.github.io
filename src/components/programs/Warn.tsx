import { FC } from "react";
import warnIcon from "../../assets/img/warn.gif";

interface WarnProps {}

const Warn: FC<WarnProps> = (props) => {
  return (
    <div className="warn">
      <div>
        <img
          src={warnIcon}
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
