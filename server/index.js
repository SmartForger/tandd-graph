const express = require("express");
const app = express();
const path = require("path");
const socketIO = require("socket.io");

require("dotenv").config();

const {
  setSocketIo,
  scheduleGetDevices,
  getStoredDevices,
  scheduleGetData,
  getStoredData
} = require("./requests");
const initSocketServer = require("./socket");

// const forceSSL = function() {
//   return function(req, res, next) {
//     if (req.headers["x-forwarded-proto"] !== "https") {
//       return res.redirect(["https://", req.get("Host"), req.url].join(""));
//     }
//     next();
//   };
// };

// app.use(forceSSL());
app.use(express.static(path.join(__dirname, "../dist")));

app.get("/api/devices", (req, res) => {
  res.send(getStoredDevices());
});

app.get("/api/data", (req, res) => {
  const { serial } = req.query;
  res.send(getStoredData(serial));
});

if (process.env.NODE_ENV === "production") {
  app.get("/*", function(req, res) {
    res.sendFile(path.join(__dirname, "../dist/index.html"));
  });
}

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, function() {
  console.log(`Server listening on port ${PORT}`);
});

const io = socketIO(server);
setSocketIo(io);
initSocketServer(io);
scheduleGetDevices();
scheduleGetData();
