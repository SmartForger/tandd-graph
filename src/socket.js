import * as io from "socket.io-client";

const socketURL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8000/"
    : "https://tandd-dev.herokuapp.com/";

let socket = io(socketURL);
let store = null;

export const initSocket = _store => {
  store = _store;

  socket.on("connect", () => {
    console.log("Connected to server...");
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from server ...");
  });

  socket.on("devices", loggers => {
    store.commit("setChannels", loggers);
  });
};

export const refreshChannel = id => {
  const channel = store.state.channels.find(ch => ch.id === id);
  const selected = store.state.selected;
  const filtered = store.state.channels.filter(
    ch => ch.serial === channel.serial && selected.indexOf(ch.id) >= 0
  );

  const ev = `data:${channel.serial}`;
  if (filtered.length > 0 && !socket.hasListeners(ev)) {
    socket.on(`data:${channel.serial}`, data => {
      const list = data.data;

      store.commit("setStartTime", list[0].unixtime);
      store.commit("setEndTime", list[list.length - 1].unixtime);
      store.commit("setData", {
        serial: channel.serial,
        data: list
      });
    });
    socket.emit("data", channel.serial);
  } else if (filtered.length === 0 && socket.hasListeners(ev)) {
    socket.removeAllListeners(ev);
  }
};
