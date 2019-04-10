<template>
  <div class="container-fluid" id="app">
    <div class="row">
      <div class="col-12 col-md-3">
        <LoggerList :loggers="loggers" @listChanged="listChanged"/>
      </div>
      <div class="col-12 col-md-9 channels">
        <template v-for="(logger, i) in loggers">
          <LoggerChannel :key="i" :logger="logger" :data="sampleData" v-if="logger.selected"/>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import LoggerList from "./components/LoggerList";
import LoggerChannel from "./components/LoggerChannel";
import {
  initSocket,
  setChannelCallback,
  getChannels,
  setSerials
} from "./socket.js";

export default {
  name: "app",
  components: {
    LoggerList,
    LoggerChannel
  },
  data() {
    return {
      loggers: []
    };
  },

  methods: {
    receiveChannels(loggers) {
      let channels = [];
      loggers.forEach(logger => {
        logger.channel.forEach(ch => {
          channels.push({
            name: logger.name,
            channel: ch.name,
            chId: `ch${ch.num}`,
            unit: ch.unit,
            serial: logger.serial,
            selected:
              this.loggers.filter(
                l =>
                  l.serial === logger.serial &&
                  l.channel === ch.name &&
                  l.selected
              ).length > 0
          });
        });
      });
      this.loggers = channels;
    },
    listChanged() {
      setTimeout(() => {
        setSerials(
          this.loggers
            .filter(logger => logger.selected)
            .map(logger => logger.serial)
        );
      }, 100);
    }
  },

  mounted() {
    initSocket();
    setChannelCallback(this.receiveChannels);
    this.receiveChannels(getChannels());
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
.channels {
  display: flex;
  flex-wrap: nowrap;
}
</style>
