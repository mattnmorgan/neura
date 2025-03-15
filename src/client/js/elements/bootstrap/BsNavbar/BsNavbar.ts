import BootstrapElement from "../../BootstrapElement";
import { customElement } from "lit/decorators.js";
import { SignalWatcher, signal, watch } from "@lit-labs/signals";

@customElement("bs-navbar")
export default class BsNavbar extends BootstrapElement {
  name = "test a navbar";

  onClick() {
    console.log("clicky");
  }
}
