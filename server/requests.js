const axios = require("axios");
const moment = require("moment");

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

let channelTimer = null;
function getChannels() {
  if (channelTimer) {
    clearInterval(channelTimer);
  }

  channelTimer = setTimeout(() => {
    axios
      .post(`${BASE_URL}/devices/current`, {
        "api-key": "1berqh6otk5rcupdb8s9mr9db238mo0kplrgcamgm53ff",
        "login-id": "rdga9751",
        "login-pass": "eifjN23S"
      })
      .then(res => {
        channels = res.data.devices || [];

        // const resetLimit = +res.headers["x-ratelimit-reset"] || 120;
        // const limitCount = +res.headers["x-ratelimit-limit"] || 10;
        // const interval = resetLimit / limitCount;

        // setTimeout(getChannels, interval * 1000);

        if (sockets) {
          sockets.emit("channels", channels);
        }

        console.log(
          `fetched channels at ${moment().format("MMM DD, YYYY kk:mm:ss")}`
        );
      });
  }, 120000);
}

function getStoredChannels() {
  if (channels.length === 0) {
    getChannels();
  }

  return channels;
}

let dataTimer = null;
function getLatestData() {
  if (dataTimer) {
    clearInterval(dataTimer);
  }

  dataTimer = setInterval(() => {
    Promise.all(
      serials.map(serial =>
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

            const resetLimit = +res.headers["x-ratelimit-reset"] || 60;
            const limitCount = +res.headers["x-ratelimit-limit"] || 60;

            return resetLimit / limitCount;
          })
      )
    ).then(intervals => {
      // if (intervals.length > 0) {
      //   let max = 0;
      //   intervals.forEach(i => {
      //     max = Math.max(i, max);
      //   });
      //   setTimeout(getLatestData, max * intervals.length * 1000);
      //   console.log(
      //     `fetched latest data, next fetch in ${max * intervals.length} seconds`
      //   );
      // } else {
      //   setTimeout(getLatestData, 1000);
      // }
      console.log(
        `data fetched at ${moment().format("MMM DD, YYYY kk:mm:ss")}`
      );
    });
  }, 120000);
}

function setSocketIo(io) {
  sockets = io;
}

function setSerials(list) {
  serials = list;
  getLatestData();
}

function getStoredData() {
  return data;
}

module.exports = {
  setSocketIo,
  setSerials,
  getStoredChannels,
  getChannels,
  getLatestData,
  getStoredData
};
