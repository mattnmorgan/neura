import React, { useState } from "react";

export default class NeuraApp extends React.Component<{ name?: string }> {
  render() {
    return <div>I'm an app: {this.props.name ?? "undefined!"}</div>;
  }
}
