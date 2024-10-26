import { FC } from "react";
interface LoadingProps {
  type: "boot" | "default" | "small";
  progress: number;
}

export const Loading: FC<LoadingProps> = ({ type = "default", progress }) => {
  return (
    <div className={`loading-${type}`}>
      <div className="loading-bar" style={{ width: progress + "%" }} />
    </div>
  );
};
