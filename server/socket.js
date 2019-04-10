const { setSerials } = require("./requests");
const { getStoredChannels } = require("./requests");

module.exports = function(io) {
  io.on("connection", socket => {
    console.log("A client is connected.");

    socket.emit("channels", getStoredChannels());

    socket.on("disconnect", socket => {
      console.log("Client disconnected...");
    });

    socket.on("request-channels", params => {
      setSerials(params);
    });
  });
};
