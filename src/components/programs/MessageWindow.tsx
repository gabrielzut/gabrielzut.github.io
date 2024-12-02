import { FC } from "react";
import warnIconImport from "../../assets/img/warn.gif";
import errorIcon from "../../assets/img/error.gif";
import { ProgramEntry } from ".";

interface MessageWindowProps {
  text: string;
  type: string;
}

const MessageWindow: FC<MessageWindowProps> = ({ text, type }) => {
  return (
    <div className="warn">
      <div>
        <img
          src={type === "warn" ? warnIcon : errorIcon}
          className="logo"
          draggable={false}
          alt="ZutiOS logotype"
        />
      </div>
      {text}
    </div>
  );
};

export default MessageWindow;

export const warnIcon = warnIconImport;

export const warnProgramEntry: ProgramEntry<MessageWindowProps> = {
  component: MessageWindow,
  name: "Warning",
  shouldShowFrame: true,
  defaultX: window.innerWidth / 2 - 75,
  defaultY: window.innerHeight / 2 - 75,
  icon: warnIcon,
};

export const errorProgramEntry: ProgramEntry<MessageWindowProps> = {
  component: MessageWindow,
  name: "Error",
  shouldShowFrame: true,
  defaultX: window.innerWidth / 2 - 75,
  defaultY: window.innerHeight / 2 - 75,
  icon: errorIcon,
};
