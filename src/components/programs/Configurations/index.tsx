import { FC } from "react";
import { ProgramEntry } from "..";
import configIcon from "../../../assets/img/system.png";
import appearanceIcon from "../../../assets/img/appearance.gif";

interface ConfigurationsProps {}

interface OptionEntryProps {
  shortcut: { name: string; icon: string };
  onClick: React.MouseEventHandler;
}

const OptionEntry: FC<OptionEntryProps> = ({ shortcut: option, onClick }) => {
  return (
    <button onClick={onClick} className="option-entry">
      <img
        className="icon"
        alt={`${option.name} option icon`}
        src={option.icon}
      />
      <div className="name">{option.name}</div>
    </button>
  );
};

const options = [{ name: "Appearance", icon: appearanceIcon }];

export const Configurations: FC<ConfigurationsProps> = () => {
  return (
    <div className="configurations">
      <div className="left-panel">
        {options.map((option) => (
          <OptionEntry shortcut={option} key={option.name} onClick={() => {}} />
        ))}
      </div>
    </div>
  );
};

export const configurationsEntry: ProgramEntry<ConfigurationsProps> = {
  component: Configurations,
  name: "System configuration",
  shouldShowFrame: true,
  defaultX: window.innerWidth / 2 - 400,
  defaultY: window.innerHeight / 2 - 400,
  defaultHeight: 500,
  defaultWidth: 800,
  icon: configIcon,
  minWidth: 340,
  minHeight: 400,
};
