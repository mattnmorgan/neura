import { RouterEndpoint } from "../../http-endpoint";
import fs from "fs";

/**
 * Endpoint that fetches any asset in the client directory, excepting
 * HTML content
 */
const endpoint: RouterEndpoint = {
  route: "/assets/",
  endpoints: [
    {
      route: /.*/,
      get: async (server, request, response) => {
        const path = `${process.cwd()}/dist/client/${request.path}`;

        if (fs.existsSync(path) && !path.endsWith(".html")) {
          response.sendFile(path);
        } else {
          response.statusCode = 404;
          response.send("Not Found");
        }
      },
    },
  ],
};

export default endpoint;
