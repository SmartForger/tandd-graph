import Vue from "vue";

export function setChannels(state, loggers) {
  const channels = [];

  loggers.forEach(logger => {
    logger.channel.forEach(ch => {
      channels.push({
        id: `ch_${logger.serial}_${ch.num}`,
        name: logger.name,
        serial: logger.serial,
        channel: ch.name,
        num: ch.num,
        unit: ch.unit
      });
    });
  });

  state.channels = channels;
}

export function setChannelDescription(state, { id, description }) {
  const channels = state.channels.filter(ch => ch.id === id);
  if (channels[0]) {
    channels[0].description = description;
  }
}

export function setData(state, { serial, data }) {
  Vue.set(state.data, serial, data);
}

export function setEndTime(state, time) {
  state.endTime = Math.max(state.endTime, time);
}

export function setStartTime(state, time) {
  state.startTime =
    state.startTime === 0 ? time : Math.min(state.startTime, time);
}

export function toggleChannel(state, id) {
  let i = state.selected.indexOf(id);
  if (i < 0) {
    state.selected.push(id);
  } else {
    state.selected.splice(i, 1);
  }
}

export function setView(state, v) {
  state.view = v;
}

export function setThreshold(state, { key, val }) {
  Vue.set(state.threshold, key, +val);
}
