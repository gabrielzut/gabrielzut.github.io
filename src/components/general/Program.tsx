import React from "react";
import DraggableWindow from "./DraggableWindow";

export class Program {
  id: string;
  name: string;
  component: React.FC;
  shouldShowFrame: boolean;
  trayIcon?: React.FC;
  isDragging = false;
  x = 0;
  y = 0;
  height = 300;
  width = 300;
  maximized = false;

  constructor(
    id: string,
    name: string,
    component: React.FC,
    shouldShowFrame = true,
    trayIcon?: React.FC,
    x = 0,
    y = 0,
    maximized = false,
    width = 300,
    height = 300
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
  }

  renderIcon() {
    if (!this.trayIcon) return <React.Fragment />;
    const IconToRender = this.trayIcon;
    return <IconToRender />;
  }

  render() {
    const ComponentToRender = this.component;
    return this.shouldShowFrame ? (
      <DraggableWindow
        key={this.id}
        className={`program ${this.shouldShowFrame ? "framed" : ""}`}
        windowName={this.name}
        defaultX={this.x}
        defaultY={this.y}
        defaultMaximized={this.maximized}
        windowId={this.id}
        defaultHeight={this.height}
        defaultWidth={this.width}
      >
        <ComponentToRender />
      </DraggableWindow>
    ) : (
      <div
        style={{ top: this.y, left: this.x, position: "absolute" }}
        key={this.id}
      >
        <ComponentToRender />
      </div>
    );
  }
}
