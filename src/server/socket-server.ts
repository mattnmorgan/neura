import { Server as SocketIoServer, Socket } from "socket.io";
import { createAdapter } from "@socket.io/cluster-adapter";
import { default as GlobalServer } from "./server";
import SocketEndpoint from "./socket-endpoint";

export default class SocketServer {
  private ioServer: SocketIoServer;

  private globalServer: GlobalServer;

  /**
   * Collection of endpoints supported by the server
   */
  private endpoints: SocketEndpoint[];

  /**
   * Callback executed when a connection comes in but was not recovered
   */
  private onFailedRecovery: (
    server: GlobalServer,
    socket: Socket
  ) => Promise<void>;

  /**
   * Callback executed when a connection comes in and was successfully recovered
   */
  private onSuccessfulRecovery: (
    server: GlobalServer,
    socket: Socket
  ) => Promise<void>;

  public constructor(server: GlobalServer) {
    this.globalServer = server;
    this.endpoints = [];
    this.onFailedRecovery = async () => {};
    this.onSuccessfulRecovery = async () => {};
  }

  public async initialize(): Promise<void> {
    this.ioServer = new SocketIoServer(this.globalServer.httpServer.server, {
      connectionStateRecovery: {},
      adapter: createAdapter(),
    });

    this.ioServer.on("connection", async (socket) => {
      // For each endpoint, register it to be executed via socketio
      this.endpoints.forEach((endpoint) => {
        socket.on(endpoint.name, async (...args) => {
          endpoint.execute(this.globalServer, ...args);
        });
      });

      if (!socket.recovered) {
        this.onFailedRecovery(this.globalServer, socket);
      } else {
        this.onSuccessfulRecovery(this.globalServer, socket);
      }
    });
  }

  /**
   * Registers an endpoint for socket to acknowledge. If the same name is
   * detected in another endpoint, an error is thrown
   *
   * @param endpoint Endpoint to register
   */
  public registerEndpoint(endpoint: SocketEndpoint): this {
    if (
      this.endpoints.find(
        (registered) =>
          registered.name.toLowerCase() == endpoint.name.toLowerCase()
      )
    ) {
      throw new Error(`Endpoint is already registered for "${endpoint.name}"`);
    }
    this.endpoints.push(endpoint);
    return this;
  }

  get server(): SocketIoServer {
    return this.ioServer;
  }
}
