import { RouterEndpoint } from "./http-endpoint";
import fs from "fs";
import mime from "mime-types";

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
          response.setHeader("Content-Type", mime.lookup(path));

          if (response.getHeader("Content-Type") == "application/javascript") {
            const mapPath = path + ".map";

            if (fs.existsSync(mapPath)) {
              response.setHeader("SourceMap", `/assets${request.path}.map`);
            }
          }

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
