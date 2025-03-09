import Server from "./server";
import { Socket } from "socket.io";

type Endpoint = {
  /**
   * Name of the endpoint as used in `socket.on()`
   */
  name: string;
  /**
   * Execution method for a socket io endpoint
   *
   * @param server Server connection
   * @param callback Callback method to call after handling message to acknowledge receipt
   * @param args Arguments passed to the socket endpoint
   * @returns
   */
  execute: (server: Server, callback: Function, ...args: any) => Promise<void>;
};

export default Endpoint;
