<template>
  <div class="loggers">
    <h4>Available Loggers</h4>
    <ul>
      <li :key="i" v-for="(channel, i) in channels">
        <b-form-checkbox
          :id="`checkbox-${i}`"
          :checked="channel.selected"
          :name="channel.id"
          @change="selectChannel(channel.id)"
          >{{ channel.label }}</b-form-checkbox
        >
      </li>
    </ul>
    <b-row class="threshold">
      <b-col sm="6">
        <label for="upper_threshold">Upper Threshold</label>
      </b-col>
      <b-col sm="6">
        <b-form-input
          id="upper_threshold"
          type="number"
          v-model="upperThreshold"
          @change="changeUpperThreshold"
        ></b-form-input>
      </b-col>
    </b-row>
    <b-row class="threshold">
      <b-col sm="6">
        <label for="lower_threshold">Lower Threshold</label>
      </b-col>
      <b-col sm="6">
        <b-form-input
          id="lower_threshold"
          type="number"
          v-model="lowerThreshold"
          @change="changeLowerThreshold"
        ></b-form-input>
      </b-col>
    </b-row>
    <div class="graph-btn-wrapper">
      <b-button variant="primary" class="graph-btn" @click="showGraph">
        Graph
      </b-button>
    </div>
    <div class="error-text" v-if="error === 1">
      Please select channels to display!
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
import { refreshChannel } from "../socket";

export default {
  name: "LoggerList",
  computed: mapGetters(["channels", "selectedChannels"]),
  data() {
    return {
      error: 0,
      upperThreshold: 0,
      lowerThreshold: 0
    };
  },
  methods: {
    ...mapMutations(["toggleChannel", "setView", "setThreshold"]),
    selectChannel(id) {
      if (this.error === 1) {
        this.error = 0;
      }
      this.toggleChannel(id);
      refreshChannel(id);
    },
    showGraph() {
      if (this.selectedChannels.length === 0) {
        this.error = 1;
        return;
      }
      this.setView("graph");
    },
    changeUpperThreshold(val) {
      this.setThreshold({ key: "upper", val });
    },
    changeLowerThreshold(val) {
      this.setThreshold({ key: "lower", val });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.loggers {
  padding-top: 40px;
  height: 100%;
  width: 300px;
  margin: 0 auto;
}
ul {
  list-style: none;
  padding: 0;
  margin-bottom: 50px;
}
li {
  padding: 16px 0 0;
  font-size: 16px;
}
.threshold {
  margin-top: 16px;
}
.graph-btn-wrapper {
  margin-top: 50px;
  display: flex;
  justify-content: center;
}
.graph-btn {
  width: 200px;
  font-size: 20px;
  font-weight: bold;
}
.error-text {
  color: red;
  margin-top: 30px;
}
</style>
