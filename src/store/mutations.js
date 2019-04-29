import Vue from "vue";

export function setChannels(state, loggers) {
  const channels = [];

  loggers.forEach(logger => {
    logger.channel.forEach(ch => {
      const chInfo = {
        id: `ch_${logger.serial}_${ch.num}`,
        name: logger.name,
        serial: logger.serial,
        channel: ch.name,
        num: ch.num,
        unit: ch.unit
      };
      const ch1 = state.channels.find(c => c.id === chInfo.id);
      if (ch1) {
        chInfo.description = ch1.description;
        chInfo.color = ch1.color;
      }

      channels.push(chInfo);
    });
  });

  state.channels = channels;
}

export function setChannelAttribute(state, { id, attr, value }) {
  const channels = state.channels.filter(ch => ch.id === id);
  if (channels[0]) {
    Vue.set(channels[0], attr, value);
  }
}

export function setData(state, { serial, data }) {
  Vue.set(state.data, serial, data);
  state.dataUpdated = 1 - state.dataUpdated;
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

export function setTitle(state, val) {
  state.title = val;
}

export function setDescription(state, val) {
  state.description = val;
}
