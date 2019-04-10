const express = require("express");
const app = express();
const path = require("path");

const http = require("http").Server(app);
const io = require("socket.io")(http);

const {
  getChannels,
  getStoredChannels,
  setSocketIo,
  getLatestData,
  getStoredData
} = require("./requests");
const initSocketServer = require("./socket");

setSocketIo(io);
const forceSSL = function() {
  return function(req, res, next) {
    if (req.headers["x-forwarded-proto"] !== "https") {
      return res.redirect(["https://", req.get("Host"), req.url].join(""));
    }
    next();
  };
};

app.use(forceSSL());
app.use(express.static(path.join(__dirname, "../dist")));

initSocketServer(io);
getChannels();
getLatestData();

app.get("/api/channels", (req, res) => {
  res.send(getStoredChannels());
});

app.get("/api/data", (req, res) => {
  res.send(getStoredData());
});

app.get("/*", function(req, res) {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

http.listen(process.env.PORT || 8000);
