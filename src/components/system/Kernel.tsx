import React, { FC } from "react";
import { BootScreen } from "./BootScreen";
import { Wanderer } from "./Wanderer";
import { BiosScreen } from "./BiosScreen";
import { ShutdownScreen } from "./ShutdownScreen";
interface KernelProps {}

export const Kernel: FC<KernelProps> = (props) => {
  return (
    <div>
      <ShutdownScreen />
      <BiosScreen />
      <BootScreen />
      <Wanderer />
    </div>
  );
};
