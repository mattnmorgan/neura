import { Server as SocketIoServer, Socket } from "socket.io";
import { createAdapter } from "@socket.io/cluster-adapter";
import { default as GlobalServer } from "./server";
import SocketEndpoint from "./socket-endpoint";

export type EmitConfig = {
  /**
   * Is the emission volatile (should it be cached for reconnections)
   */
  volatile?: boolean;
  /**
   * Is there a timeout on the emission to receive a response
   */
  timeout?: number;
  /**
   * Callback on a response being received or an error occuring. Only specify
   * a callback if a timeout is also being provided
   *
   * @param error Error information
   * @param response Response information from clients
   */
  onResponse: (error?: object, response?: object[]) => Promise<void>;
};

export default class SocketServer {
  private ioServer: SocketIoServer;

  private globalServer: GlobalServer;

  /**
   * Connections to this server from clients, and the data associated with them
   */
  private connections: Map<Socket, object>;

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
    this.connections = new Map<Socket, object>();
    this.onFailedRecovery = async () => {};
    this.onSuccessfulRecovery = async () => {};
  }

  public async initialize(): Promise<void> {
    this.ioServer = new SocketIoServer(this.globalServer.httpServer.server, {
      connectionStateRecovery: {},
      adapter: createAdapter(),
    });

    this.ioServer.on("connection", async (socket) => {
      this.connections.set(socket, {});

      // For each endpoint, register it to be executed via socketio
      this.endpoints.forEach((endpoint) => {
        socket.on(endpoint.name, async (...args) => {
          endpoint.execute(
            this.globalServer,
            args[args.length - 1],
            ...args.slice(0, args.length - 1)
          );
        });
      });

      socket.on("disconnect", () => {
        this.connections.delete(socket);
      });

      if (!socket.recovered) {
        this.onFailedRecovery(this.globalServer, socket);
      } else {
        this.onSuccessfulRecovery(this.globalServer, socket);
      }
    });
  }

  /**
   * Emits an event over socket io
   *
   * @param config Configuration for the emission
   * @param event Event name to emit
   * @param args Arguments to pass with the event
   */
  public async emit(
    config: EmitConfig,
    event: string,
    ...args: any
  ): Promise<void> {
    let emitter: any = this.server;
    let emitArgs: any[] = args;

    if (config?.volatile ?? false) {
      emitter = emitter.volatile;
    }

    if (config?.timeout) {
      emitter = emitter.timeout(config.timeout);
    }

    if (config?.onResponse) {
      emitArgs.push(config.onResponse);
    }

    emitter.emit(event, ...emitArgs);
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
