import * as io from "socket.io-client";

let socket = io("http://localhost:8000");

let storedData = {};
let channels = [];
let serials = [];
let channelCallback = null;
let dataCallbacks = {};

export const initSocket = () => {
  socket.on("connect", () => {
    console.log("Connected to server...");
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from server ...");
  });

  socket.on("channels", data => {
    channels = data.devices;
    if (channelCallback) {
      channelCallback(channels);
    }
  });
};

export const getData = () => {
  return storedData;
};

export const getChannels = () => {
  return channels;
};

export const setChannelCallback = cb => {
  channelCallback = cb;
};

export const setDataCallback = (serial, ch, cb) => {
  if (dataCallbacks[serial]) {
    dataCallbacks[serial][ch] = cb;
  } else {
    dataCallbacks[serial] = { [ch]: cb };
  }
};

export const setSerials = list => {
  serials.forEach(s => {
    if (list.indexOf(s) < 0) {
      socket.removeAllListeners(`ch:${s}`);
    }
  });

  serials = list;
  socket.emit("request-channels", serials);

  serials.forEach(serial => {
    socket.on(`ch:${serial}`, function(data) {
      if (dataCallbacks[serial]) {
        storedData[serial] = data;

        const keys = Object.keys(dataCallbacks[serial]);
        keys.forEach(ch => {
          dataCallbacks[serial][ch](data.data);
        });
      }
    });
  });
};
