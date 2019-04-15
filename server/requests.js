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
      let temp = res.data.devices || [];
      refreshData(temp);
      devices = temp;

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
    Promise.all(devices.map(d => getDataForSerial(d.serial))).then(() => {
      console.log(
        `Latest Data fetched at ${moment().format("MMM DD, YYYY kk:mm:ss")}`
      );
    });
  };

  getAllData();
  dataTimer = setInterval(getAllData, 120000);
}

function refreshData(list) {
  list.forEach(d => {
    const filtered = devices.filter(d1 => d1.serial === d.serial);
    if (filtered.length === 0) {
      getDataForSerial(d.serial);
    }
  });

  devices.forEach(d => {
    const filtered = list.filter(d1 => d1.serial === d.serial);
    if (filtered.length === 0) {
      delete data[d.serial];
    }
  });
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
