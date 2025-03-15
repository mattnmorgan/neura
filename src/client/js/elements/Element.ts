import { LitElement } from "lit";

export default class Element extends LitElement {
  render() {
    return this.template;
  }

  get template(): string {
    return "";
  }
}
