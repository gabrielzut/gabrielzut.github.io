import React from "react";

export class Program {
  id: string;
  name: string;
  component: React.FC;
  shouldShowFrame: boolean;

  constructor(
    id: string,
    name: string,
    component: React.FC,
    shouldShowFrame = true
  ) {
    this.id = id;
    this.name = name;
    this.component = component;
    this.shouldShowFrame = shouldShowFrame;
  }

  render() {
    const ComponentToRender = this.component;
    return <ComponentToRender />;
  }
}
