const { setSerials } = require("./requests");
const { getStoredChannels, getStoredData } = require("./requests");

module.exports = function(io) {
  io.on("connection", socket => {
    console.log("A client is connected.");

    socket.emit("loggers", getStoredChannels());

    socket.on("disconnect", socket => {
      console.log("Client disconnected...");
    });

    socket.on("serials", params => {
      setSerials(params);
    });

    socket.on("data", serial => {
      socket.emit(`ch:${serial}`, getStoredData(serial));
    });
  });
};
