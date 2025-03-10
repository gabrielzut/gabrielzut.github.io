import React, { FC } from "react";
import { BootScreen } from "./BootScreen";
import { Wanderer } from "./Wanderer";
import { BiosScreen } from "./BiosScreen";
import { ShutdownScreen } from "./ShutdownScreen";
import { useEffect } from "react";
import { getEnv, setEnv } from "../../utils/localStorage";
interface KernelProps {}

export const Kernel: FC<KernelProps> = (props) => {
  useEffect(() => {
    if (!getEnv("PATH")) {
      setEnv("PATH", "/bin");
    }
  }, []);

  return (
    <div>
      <ShutdownScreen />
      <BiosScreen />
      <BootScreen />
      <Wanderer />
    </div>
  );
};
