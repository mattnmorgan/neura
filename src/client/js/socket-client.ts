import io, { Socket, SocketOptions, ManagerOptions } from 'socket.io-client';
import Endpoint from './socket-endpoint';

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
   * Callback on a response being received or an error occuring
   * 
   * @param error Error information
   * @param response Response information
   */
  onResponse: (error?: object, response?: object) => Promise<void>;
};

export default class SocketClient {
  /**
   * Socket io connection
   */
  private socket: Socket;

  /**
   * Configuration for the socket
   */
  private config: Partial<SocketOptions & ManagerOptions>;

  /**
   * Endpoints this socket connection handles
   */
  private endpoints: Endpoint[];

  public constructor(config: Partial<SocketOptions & ManagerOptions>) {
    this.endpoints = [];
    this.config = {
      ackTimeout: config.ackTimeout ?? 10000,
      retries: config.retries ?? 3,
      auth: config.auth ?? {}
    };
  }

  public async initialize(): Promise<void> {
    this.socket = io(this.config);

    // Register all endpoints for the socket
    this.endpoints.forEach((endpoint) => {
      this.socket.on(endpoint.name, async (...args) => {
        await endpoint.execute(this.connection, args[args.length - 1], ...args.slice(0, args.length - 1));
      });
    });
  }

  /**
   * Registers a socket io endpoint. If another endpoint matches the name, an error is thrown.
   * 
   * @param endpoint Endpoint to register
   */
  public registerEndpoint(endpoint: Endpoint): this {
    if (this.endpoints.find((registered) => registered.name.toLowerCase() == endpoint.name.toLowerCase())) {
      throw new Error(`Endpoint is already registered with the name "${endpoint.name}"`);
    }
    this.endpoints.push(endpoint);
    return this;
  }

  /**
   * Registers multiple socket io endpoints
   * 
   * @param endpoints Endpoints to register
   */
  public registerEndpoints(endpoints: Endpoint[]): this {
    endpoints.forEach((endpoint) => this.registerEndpoint(endpoint));
    return this;
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
    let emitter: any = this.connection;
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


  public get connection(): Socket {
    return this.socket;
  }
}