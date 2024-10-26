import { FC } from "react";
interface WindowTitleProps {
  name: string;
}

export const WindowTitle: FC<WindowTitleProps> = ({ name }) => {
  return <div className="window-title">{name}</div>;
};
