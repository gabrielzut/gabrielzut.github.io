import React, { FC } from "react";
import { BootScreen } from "./BootScreen";
import { Wanderer } from "./Wanderer";
import { BiosScreen } from "./BiosScreen";
interface KernelProps {}

export const Kernel: FC<KernelProps> = (props) => {
  return (
    <div>
      <BiosScreen />
      <BootScreen />
      <Wanderer />
    </div>
  );
};
