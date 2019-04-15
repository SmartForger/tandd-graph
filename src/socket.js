import * as io from "socket.io-client";

// let socket = io("https://tandd-dev.herokuapp.com/");
let socket = io("http://localhost:8000/");

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
