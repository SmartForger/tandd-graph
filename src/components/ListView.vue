<template>
  <div class="row" id="list">
    <div class="left-panel">
      <LoggerList />
    </div>
    <div class="channels">
      <template v-for="(channel, i) in selectedChannels">
        <LoggerChannel :key="i" :channel="channel" />
      </template>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

import LoggerList from "./LoggerList";
import LoggerChannel from "./LoggerChannel";

export default {
  name: "ListView",
  components: {
    LoggerList,
    LoggerChannel
  },
  computed: mapGetters(["selectedChannels"])
};
</script>

<style scoped>
#list {
  height: 100vh;
}
.channels {
  display: flex;
  flex: 1;
  flex-wrap: nowrap;
  overflow-y: auto;
  height: 100%;
}
.left-panel {
  border-right: 1px solid #aaa;
  max-width: 400px;
  min-width: 320px;
  width: 33%;
  height: 100%;
}
</style>
