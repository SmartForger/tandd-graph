import * as io from "socket.io-client";

const socketURL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8000/"
    : "https://tandd-dev.herokuapp.com/";

let socket = io(socketURL);

export const initSocket = () => {
  socket.on("connect", () => {
    console.log("Connected to server...");
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from server ...");
  });
};

export const getSocket = () => {
  return socket;
};
