import { RouterEndpoint } from "./http-endpoint";
import fs from "fs";

/**
 * Endpoint that fetches any page's content on the server
 */
const endpoint: RouterEndpoint = {
  route: "/",
  endpoints: [
    {
      route: /.*/,
      get: async (server, request, response) => {
        const path = `${process.cwd()}/dist/client/html/${request.path}`;
        const path1 = `${path}.html`;
        const path2 = `${path}/index.html`;
        const exists1 = fs.existsSync(path1);
        const exists2 = fs.existsSync(path2);
        const notHtml = !path.endsWith(".html");

        /*
         * For a page, i.e. localhost:8080/subpage, one of two paths can match:
         * - dist/client/html/subpage.html
         * - dist/client/html/subpage/index.html
         */
        if (notHtml && exists1) {
          response.sendFile(path1);
        } else if (notHtml && exists2) {
          response.sendFile(path2);
        } else {
          response.statusCode = 404;
          response.send("Not Found");
        }
      },
    },
  ],
};

export default endpoint;
