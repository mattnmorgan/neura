import Server from "../../server";
import { Request, Response } from "express";

type Endpoint = {
  /**
   * The route for this endpoint, which can include parameters using `:` as defined in
   * express documentation
   */
  route: RegExp | string;
  get?: (server: Server, request: Request, response: Response) => Promise<void>;
  head?: (
    server: Server,
    request: Request,
    response: Response
  ) => Promise<void>;
  options?: (
    server: Server,
    request: Request,
    response: Response
  ) => Promise<void>;
  trace?: (
    server: Server,
    request: Request,
    response: Response
  ) => Promise<void>;
  put?: (server: Server, request: Request, response: Response) => Promise<void>;
  delete?: (
    server: Server,
    request: Request,
    response: Response
  ) => Promise<void>;
  post?: (
    server: Server,
    request: Request,
    response: Response
  ) => Promise<void>;
  patch?: (
    server: Server,
    request: Request,
    response: Response
  ) => Promise<void>;
  connect?: (
    server: Server,
    request: Request,
    response: Response
  ) => Promise<void>;
};

type RouterEndpoint = {
  /**
   * The route that this router handles
   */
  route: string | RegExp;
  /**
   * The collection of endpoints associated with this router
   */
  endpoints: Endpoint[];
};

export default Endpoint;
export { RouterEndpoint };
