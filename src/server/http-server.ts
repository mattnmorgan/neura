import { default as express, Express } from "express";
import { createServer, Server } from "node:http";
import { default as GlobalServer } from "./server";
import HttpEndpoint, { RouterEndpoint } from "./http-endpoint";

export default class HttpServer {
  private expressServer: Express;

  private httpServer: Server;

  private globalServer: GlobalServer;

  /**
   * Collection of endpoints supported by the server
   */
  private endpoints: HttpEndpoint[];

  /**
   * Collection of router endpoints supported by the server
   */
  private routerEndpoints: RouterEndpoint[];

  public constructor(globalServer: GlobalServer) {
    this.endpoints = [];
    this.routerEndpoints = [];
    this.globalServer = globalServer;
  }

  public async initialize(): Promise<void> {
    this.expressServer = express();
    this.httpServer = createServer(this.expressServer);

    // For each endpoint's supported methods, register the method
    this.endpoints.forEach((endpoint) => {
      Object.keys(endpoint).forEach((method) => {
        if (typeof endpoint[method] == "function") {
          this.expressServer[method](endpoint.route, async (req, res) => {
            await endpoint[method](this.globalServer, req, res);
          });
        }
      });
    });

    // For each router endpoint, register
    this.routerEndpoints.forEach((routerEndpoint) => {
      const router = express.Router();

      routerEndpoint.endpoints.forEach((endpoint) => {
        Object.keys(endpoint).forEach((method) => {
          if (typeof endpoint[method] == "function") {
            router[method](endpoint.route, async (req, res) => {
              await endpoint[method](this.globalServer, req, res);
            });
          }
        });
      });

      this.expressServer.use(routerEndpoint.route, router);
    });

    this.httpServer.listen(process.env.PORT, () => {
      console.log(
        "Http server has been turned on for port " + process.env.PORT
      );
    });
  }

  /**
   * Registers an endpoint for acknowledgement by the server. If an endpoint with the same
   * route is already defined, then an error is thrown.
   *
   * @param endpoint Endpoint to register
   */
  public registerEndpoint(endpoint: HttpEndpoint): this {
    if (
      this.endpoints.find(
        (registered) =>
          (registered.route instanceof RegExp
            ? registered.route.source.toLowerCase()
            : registered.route.toLowerCase()) ==
          (endpoint.route instanceof RegExp
            ? endpoint.route.source.toLowerCase()
            : endpoint.route.toLowerCase())
      )
    ) {
      throw new Error(
        `Endpoint is already registered for route "${endpoint.route}"`
      );
    }
    this.endpoints.push(endpoint);
    return this;
  }

  /**
   * Register an express router
   *
   * @param endpoint The router endpoint to register
   */
  public registerRouter(endpoint: RouterEndpoint): this {
    if (
      this.routerEndpoints.find(
        (registered) =>
          (registered.route instanceof RegExp
            ? registered.route.source.toLowerCase()
            : registered.route.toLowerCase()) ==
          (endpoint.route instanceof RegExp
            ? endpoint.route.source.toLowerCase()
            : endpoint.route.toLowerCase())
      )
    ) {
      throw new Error(
        `Router endpoint is already registered for route "${endpoint.route}"`
      );
    }
    this.routerEndpoints.push(endpoint);
    return this;
  }

  get server(): Server {
    return this.httpServer;
  }
}
