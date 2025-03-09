import Server from "./server";
import { default as SQLiteConnector } from "./sqlite-connection";
import AssetsEndpoint from "./endpoints/http/assets";
import PageEndpoint from "./endpoints/http/pages";

new Server(8080, 1)
  .addDatabase("test", new SQLiteConnector("./dist/test-file.db"))
  .addRouters([AssetsEndpoint, PageEndpoint])
  .addRoutes([
    {
      route: "/name/:nameId",
      get: async (server, request, response) => {
        console.log("yipee");
        console.log(request.params);
      },
    },
  ])
  .addSocketRoutes([
    {
      name: "test",
      execute: async (server) => {
        console.log("yep");
      },
    },
  ])
  .launch();
