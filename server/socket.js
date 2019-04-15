const { setSerials } = require("./requests");
const { getStoredDevices, getStoredData } = require("./requests");

module.exports = function(io) {
  io.on("connection", socket => {
    console.log("A client is connected.");

    socket.emit("devices", getStoredDevices());

    socket.on("disconnect", socket => {
      console.log("Client disconnected...");
    });

    socket.on("serials", params => {
      setSerials(params);
    });

    socket.on("data", serial => {
      socket.emit(`data:${serial}`, getStoredData(serial));
    });
  });
};
