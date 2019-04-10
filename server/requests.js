const axios = require("axios");
const moment = require("moment");
const _ = require("lodash");

const BASE_URL = "https://api.webstorage-service.com/v1";
let channels = [];
let sockets = null;
let serials = [];
let data = {};

axios.interceptors.request.use(
  req => {
    return {
      ...req,
      headers: {
        "X-HTTP-Method-Override": "GET",
        "Content-Type": "application/json",
        Host: "api.webstorage-service.com:443"
      }
    };
  },
  error => Promise.reject(error)
);

const getChannels = _.throttle(() => {
  axios
    .post(`${BASE_URL}/devices/current`, {
      "api-key": "1berqh6otk5rcupdb8s9mr9db238mo0kplrgcamgm53ff",
      "login-id": "rdga9751",
      "login-pass": "eifjN23S"
    })
    .then(res => {
      channels = res.data.devices || [];

      if (sockets) {
        sockets.emit("loggers", channels);
      }

      console.log(
        `fetched channels at ${moment().format("MMM DD, YYYY kk:mm:ss")}`
      );
    });
}, 12000);

function scheduleGetChannels() {
  getChannels();

  setInterval(() => {
    getChannels();
  }, 120000);
}

function getStoredChannels() {
  if (channels.length === 0) {
    getChannels();
  }

  return channels;
}

function getDataForSerial(serial) {
  axios
    .post(`${BASE_URL}/devices/latest-data`, {
      "api-key": "1berqh6otk5rcupdb8s9mr9db238mo0kplrgcamgm53ff",
      "login-id": "rdga9751",
      "login-pass": "eifjN23S",
      "remote-serial": serial
    })
    .then(res => {
      data[serial] = res.data || [];
      sockets.emit(`ch:${serial}`, res.data);
    });
}

let dataTimer = null;
function scheduleGetData() {
  if (dataTimer) {
    clearInterval(dataTimer);
  }

  const getAllData = () => {
    Promise.all(serials.map(s => getDataForSerial(s))).then(() => {
      console.log(
        `Data fetched at ${moment().format("MMM DD, YYYY kk:mm:ss")}`
      );
    });
  };

  getAllData();
  dataTimer = setInterval(getAllData, 120000);
}

function getStoredData(serial) {
  if (data[serial]) {
    return data[serial];
  }
  getDataForSerial(serial);
  return { data: [] };
}

function setSocketIo(io) {
  sockets = io;
}

function setSerials(list) {
  serials = list;
}

module.exports = {
  setSocketIo,
  setSerials,
  getStoredChannels,
  getStoredData,
  scheduleGetData,
  scheduleGetChannels
};
