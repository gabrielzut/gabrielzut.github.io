import React from "react";
import DraggableWindow from "./DraggableWindow";

export class Program<T extends React.FC<any>> {
  id: string;
  name: string;
  component: T;
  props?: React.ComponentProps<T>;
  shouldShowFrame: boolean;
  icon?: string;
  trayIcon?: React.FC;
  isDragging = false;
  x = 0;
  y = 0;
  height = 300;
  width = 300;
  maximized = false;
  minimized = false;
  shouldShowInThePanel = true;
  minWidth = 200;
  minHeight = 200;

  constructor(
    id: string,
    name: string,
    component: T,
    shouldShowFrame = true,
    trayIcon?: React.FC,
    x = 0,
    y = 0,
    shouldShowInThePanel = true,
    icon?: string,
    maximized = false,
    width = 300,
    height = 300,
    minWidth = 200,
    minHeight = 200
  ) {
    this.id = id;
    this.name = name;
    this.component = component;
    this.shouldShowFrame = shouldShowFrame;
    this.trayIcon = trayIcon;
    this.x = x;
    this.y = y;
    this.maximized = maximized;
    this.width = width;
    this.height = height;
    this.icon = icon;
    this.shouldShowInThePanel = shouldShowInThePanel;
    this.minWidth = minWidth;
    this.minHeight = minHeight;
  }

  renderIcon() {
    if (!this.trayIcon) return <React.Fragment />;
    const IconToRender = this.trayIcon;
    return <IconToRender />;
  }

  render() {
    const { component: ComponentToRender, props } = this;

    return this.shouldShowFrame ? (
      <DraggableWindow
        key={this.id}
        className={"program framed"}
        windowName={this.name}
        defaultX={this.x}
        defaultY={this.y}
        defaultMaximized={this.maximized}
        windowId={this.id}
        defaultHeight={this.height}
        defaultWidth={this.width}
        isMinimized={this.minimized}
        icon={this.icon}
        minWidth={this.minWidth}
        minHeight={this.minHeight}
      >
        <ComponentToRender {...(props as React.ComponentProps<T>)} />
      </DraggableWindow>
    ) : (
      <div
        style={{ top: this.y, left: this.x, position: "absolute" }}
        key={this.id}
      >
        <ComponentToRender {...(props as React.ComponentProps<T>)} />
      </div>
    );
  }
}
