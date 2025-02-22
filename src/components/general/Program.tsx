import React from "react";
import DraggableWindow from "./DraggableWindow";
import { ProgramEntry } from "../programs";
import { GenerateUUID } from "../../utils/generators";

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
  isSystemOwned = false;

  public static of<T>(entry: ProgramEntry<T>) {
    return new Program(
      GenerateUUID(),
      entry.name,
      entry.component,
      entry.shouldShowFrame,
      entry.trayIcon,
      entry.defaultX,
      entry.defaultY,
      true,
      entry.icon,
      false,
      entry.defaultWidth,
      entry.defaultHeight,
      entry.minWidth,
      entry.minHeight,
      false,
      entry.props,
    );
  }

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
    minHeight = 200,
    isSystemOwned = false,
    props?: React.ComponentProps<T>,
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
    this.isSystemOwned = isSystemOwned;
    this.props = props;
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
        style={{
          top: this.y,
          left: this.x,
          position: "absolute",
          zIndex: 999999,
        }}
        key={this.id}
      >
        <ComponentToRender {...(props as React.ComponentProps<T>)} />
      </div>
    );
  }
}
