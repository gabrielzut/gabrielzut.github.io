import React, { FC } from "react";
import { BootScreen } from "./BootScreen";
import { Wanderer } from "./Wanderer";
interface KernelProps {}

export const Kernel: FC<KernelProps> = (props) => {
  return (
    <div>
      <BootScreen />
      <Wanderer />
    </div>
  );
};
