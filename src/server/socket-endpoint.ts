import Server from "./server";
import { Socket } from "socket.io";

type Endpoint = {
  name: string;
  execute: (server: Server, ...args: any[]) => Promise<void>;
};

export default Endpoint;
