import Server from "./server";
import { default as SQLiteConnector } from "./sqlite-connection";
import AssetsEndpoint from "./endpoints/http/assets";
import PageEndpoint from "./endpoints/http/pages";

async function initialize() {
  const server: Server = new Server(8080, 1)
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
        execute: async (server, callback, text) => {
          console.log("message:", text);
          server.socketServer.emit(
            {
              timeout: 1000,
              onResponse: async (error, response) => {
                console.log(
                  "response received to start's response",
                  JSON.stringify(error),
                  JSON.stringify(response)
                );
              },
            },
            "test",
            "a response"
          );
          callback({ banana: true });
        },
      },
    ]);

  await server.launch();
}

initialize();