import { Socket } from "socket.io-client";

type Endpoint = {
  /**
   * Name of the endpoint as used in `socket.on()`
   */
  name: string;
  /**
   * Execution method for a socket io endpoint
   *
   * @param socket Socket connection
   * @param respond Callback method to call after handling message to acknowledge receipt
   * @param args Arguments passed to the socket endpoint
   * @returns
   */
  execute: (connection: Socket, respond: (response?: object) => void, ...args: any) => Promise<void>;
};

export default Endpoint;
