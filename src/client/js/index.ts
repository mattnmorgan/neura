export * from "@shoelace-style/shoelace/dist/shoelace.js";

import SocketClient from "./socket-client";

let socket: SocketClient = new SocketClient({}).registerEndpoints([
  {
    name: "test",
    execute: async (connection, callback, text) => {
      console.log(text);
      callback({ apple: "10" });
    },
  },
]);

socket.initialize().then(() => {
  socket.emit(
    {
      onResponse: async (error, response) => {
        console.log("response received to start", JSON.stringify(response));
      },
    },
    "test",
    "a start"
  );
});
