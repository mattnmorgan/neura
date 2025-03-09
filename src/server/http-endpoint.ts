import Server from "./server";
import { Request, Response } from "express";

type Endpoint = {
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
  route: string | RegExp;
  endpoints: Endpoint[];
};

export default Endpoint;
export { RouterEndpoint };
