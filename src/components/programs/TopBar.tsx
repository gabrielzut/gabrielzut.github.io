import { FC, ReactNode, useEffect, useState } from "react";
import smallLogo from "../../assets/img/small-logo.png";
import { useSelector } from "react-redux";
import { RootState } from "../../redux";

interface TrayIconProps {
  children: ReactNode;
}

interface TopBarProps {}

export const TrayIcon: FC<TrayIconProps> = ({ children }) => {
  return <div className="tray-icon">{children}</div>;
};

export const TopBar: FC<TopBarProps> = (props) => {
  const [dateAndTime, setDateAndTime] = useState(
    new Date().toLocaleTimeString()
  );
  const openedPrograms = useSelector(
    (state: RootState) => state.processManager.programs
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
      <div className="system-tray">
        {openedPrograms.map((program) => (
          <TrayIcon key={program.id + "-tray-icon"}>
            {program.renderIcon()}
          </TrayIcon>
        ))}
      </div>
    </div>
  );
};
