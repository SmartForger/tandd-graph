const axios = require("axios");
const moment = require("moment");
const _ = require("lodash");

let devices = [];
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

const getDevices = _.throttle(() => {
  axios
    .post(`${process.env.BASE_URL}/devices/current`, {
      "api-key": process.env.API_KEY,
      "login-id": process.env.LOGIN_ID,
      "login-pass": process.env.LOGIN_PASS
    })
    .then(res => {
      devices = res.data.devices || [];

      if (sockets) {
        sockets.emit("devices", devices);
      }

      console.log(
        `fetched devices at ${moment().format("MMM DD, YYYY kk:mm:ss")}`
      );
    });
}, 12000);

function scheduleGetDevices() {
  getDevices();

  setInterval(() => {
    getDevices();
  }, 120000);
}

function getStoredDevices() {
  if (devices.length === 0) {
    getDevices();
  }

  return devices;
}

function getDataForSerial(serial) {
  axios
    .post(`${process.env.BASE_URL}/devices/latest-data`, {
      "api-key": "1berqh6otk5rcupdb8s9mr9db238mo0kplrgcamgm53ff",
      "login-id": "rdga9751",
      "login-pass": "eifjN23S",
      "remote-serial": serial
    })
    .then(res => {
      data[serial] = res.data || [];
      sockets.emit(`data:${serial}`, res.data);
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
        `Latest Data fetched at ${moment().format("MMM DD, YYYY kk:mm:ss")}`
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
  getStoredDevices,
  scheduleGetDevices,
  getStoredData,
  scheduleGetData
};
