import React from "react";

export class Program {
  id: string;
  name: string;
  component: React.FC;
  shouldShowFrame: boolean;
  trayIcon?: React.FC;
  top?: number;
  left?: number;

  constructor(
    id: string,
    name: string,
    component: React.FC,
    shouldShowFrame = true,
    trayIcon?: React.FC,
    top = 0,
    left = 0
  ) {
    this.id = id;
    this.name = name;
    this.component = component;
    this.shouldShowFrame = shouldShowFrame;
    this.trayIcon = trayIcon;
    this.top = top;
    this.left = left;
  }

  renderIcon() {
    if (!this.trayIcon) return <React.Fragment />;
    const IconToRender = this.trayIcon;
    return <IconToRender />;
  }

  render() {
    const ComponentToRender = this.component;
    return <ComponentToRender />;
  }
}
