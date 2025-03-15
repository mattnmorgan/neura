import { default as cluster, Worker } from "node:cluster";
import { availableParallelism } from "node:os";
import { setupPrimary } from "@socket.io/cluster-adapter";
import { authenticator, totp, hotp } from "otplib";
import Connection from "./database/connection";
import HttpServer from "./endpoints/http-server";
import SocketServer from "./endpoints/socket-server";
import HttpEndpoint, { RouterEndpoint } from "./endpoints/http/http-endpoint";
import SocketEndpoint from "./endpoints/socket-io/socket-endpoint";

export default class Server {
  /**
   * Collection of database connections
   */
  private databases: { [name: string]: Connection<any> };

  /**
   * Http server
   */
  public httpServer: HttpServer;

  /**
   * Socket IO server
   */
  public socketServer: SocketServer;

  /**
   * Initial port to count up from to initialize cluster
   */
  private port: number;

  /**
   * Number of threads at most to launch
   */
  private threads: number;

  /**
   * Workers launched
   */
  private workers: Worker[];

  public constructor(port: number, threads: number) {
    this.port = port;
    this.threads = threads;
    this.workers = [];
    this.databases = {};
    this.httpServer = new HttpServer(this);
    this.socketServer = new SocketServer(this);
  }

  public async launch(): Promise<Server> {
    if (cluster.isPrimary) {
      const cpus = availableParallelism();

      for (let t = 0; t < this.threads && t < cpus; t++) {
        this.workers.push(cluster.fork({ PORT: this.port + t }));
      }

      setupPrimary();
    } else {
      for (const name of Object.keys(this.databases)) {
        await this.databases[name].initialize();
      }
      await this.httpServer.initialize();
      await this.socketServer.initialize();
    }

    return this;
  }

  /**
   * Stores a database connection. If the name provided is already in use,
   * then an error is thrown.
   *
   * @param name The name of the database connection to set
   * @param connection The database connection to store under the name
   */
  public addDatabase(name: string, connection: Connection<any>): this {
    if (name in this.databases) {
      throw new Error(`Database connection name "${name}" already in use`);
    }
    this.databases[name] = connection;
    return this;
  }

  /**
   * Gets a database connection. If one does not exist with the given name,
   * then an error is thrown.
   *
   * @param name Name of the database connection to fetch
   * @returns The database connection under the given name
   */
  public getDatabase(name: string): Connection<any> {
    if (!(name in this.databases)) {
      throw new Error(`No database connection with name "${name}"`);
    }
    return this.databases[name];
  }

  /**
   * Registers an http endpoint for recognition by the server
   *
   * @param endpoint Http endpoint to register
   */
  public addRoute(endpoint: HttpEndpoint): this {
    this.httpServer.registerEndpoint(endpoint);
    return this;
  }

  /**
   * Registers multiple endpoints for recognition by the server
   *
   * @param endpoints Http endpoints to register
   */
  public addRoutes(endpoints: HttpEndpoint[]): this {
    endpoints.forEach((endpoint) => this.addRoute(endpoint));
    return this;
  }

  /**
   * Registers a socket io endpoint for recognition by the server
   *
   * @param endpoint Socket endpoint to register
   */
  public addSocketRoute(endpoint: SocketEndpoint): this {
    this.socketServer.registerEndpoint(endpoint);
    return this;
  }

  /**
   * Registers multiple socket io endpoints for recognition by the server
   *
   * @param endpoints Socket endpoints to register
   */
  public addSocketRoutes(endpoints: SocketEndpoint[]): this {
    endpoints.forEach((endpoint) => this.addSocketRoute(endpoint));
    return this;
  }

  /**
   * Registers a router endpoint
   *
   * @param endpoint Endpoint to register
   */
  public addRouter(endpoint: RouterEndpoint): this {
    this.httpServer.registerRouter(endpoint);
    return this;
  }

  /**
   * Register router endpoints
   *
   * @param endpoints Router endpoints to register
   */
  public addRouters(endpoints: RouterEndpoint[]): this {
    endpoints.forEach((endpoint) => this.addRouter(endpoint));
    return this;
  }

  /**
   * Authenticate a user
   *
   * @param algorithm Algorithm to use
   * @param token Token to test
   * @param secret Secret for the user to authenticate
   * @param counter Counter (required for hotp)
   * @returns True if the token, secret, and counter match against the algorithm provided
   */
  public authorize(
    algorithm: "auth" | "totp" | "hotp",
    token: string,
    secret: string,
    counter?: number
  ): boolean {
    switch (algorithm) {
      case "auth":
        return authenticator.verify({ token, secret });
      case "totp":
        return totp.verify({ token, secret });
      case "hotp":
        if (!counter) {
          return false;
        }
        return hotp.verify({ token, secret, counter });
    }
  }
}
