import { FC, useEffect, useState } from "react";
import smallLogo from "../../assets/img/small-logo.png";

interface TopBarProps {}

export const TopBar: FC<TopBarProps> = (props) => {
  const [dateAndTime, setDateAndTime] = useState(
    new Date().toLocaleTimeString()
  );

  useEffect(() => {
    setInterval(() => {
      setDateAndTime(new Date().toLocaleTimeString());
    }, 1000);
  }, []);

  return (
    <div className="top-bar">
      <button className="start-button">
        <img
          src={smallLogo}
          className="logo"
          draggable={false}
          alt="ZutiOS logotype"
        />
      </button>
      <div className="clock">{dateAndTime}</div>
      <div className="system-tray"></div>
    </div>
  );
};
