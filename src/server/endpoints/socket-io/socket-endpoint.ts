import Server from "../../server";

type Endpoint = {
  /**
   * Name of the endpoint as used in `socket.on()`
   */
  name: string;
  /**
   * Execution method for a socket io endpoint
   *
   * @param server Server connection
   * @param respond Callback method to call after handling message to acknowledge receipt
   * @param args Arguments passed to the socket endpoint
   * @returns
   */
  execute: (
    server: Server,
    respond: (response?: object) => void,
    ...args: any
  ) => Promise<void>;
};

export default Endpoint;
