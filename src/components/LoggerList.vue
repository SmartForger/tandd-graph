<template>
  <div class="loggers">
    <h4>Available Loggers</h4>
    <ul>
      <li :key="i" v-for="(channel, i) in channels">
        <b-form-checkbox
          :id="checkbox(i)"
          :checked="channel.selected"
          :name="channel.id"
          @change="selectChannel(channel.id)"
          >{{ channel.label }}</b-form-checkbox
        >
      </li>
    </ul>
    <b-row class="input-row">
      <b-col sm="6">
        <label for="upper_threshold">Upper Threshold</label>
      </b-col>
      <b-col sm="6">
        <b-form-input
          id="upper_threshold"
          type="number"
          :value="threshold.upper"
          @change="changeUpperThreshold"
        ></b-form-input>
      </b-col>
    </b-row>
    <b-row class="input-row">
      <b-col sm="6">
        <label for="lower_threshold">Lower Threshold</label>
      </b-col>
      <b-col sm="6">
        <b-form-input
          id="lower_threshold"
          type="number"
          :value="threshold.lower"
          @change="changeLowerThreshold"
        ></b-form-input>
      </b-col>
    </b-row>
    <hr />
    <div class="input-row">
      <label for="title">Title</label>
      <b-form-input
        id="title"
        :value="title"
        @change="changeTitle"
      ></b-form-input>
    </div>
    <div class="input-row">
      <label for="description">Description</label>
      <b-form-textarea
        id="description"
        :value="description"
        rows="3"
        @change="changeDescription"
      ></b-form-textarea>
    </div>
    <hr />
    <div class="graph-btn-wrapper">
      <b-button variant="primary" class="graph-btn" @click="showGraph">
        Graph
      </b-button>
    </div>
    <ul class="errors">
      <template v-for="(error, i) in errors">
        <li class="error-text" v-if="error === 1">
          Please select channels to display.
        </li>
        <li class="error-text" v-if="error === 2">
          Please enter valid thresholds.
        </li>
        <li class="error-text" v-if="error === 3">
          Upper threshould should be greater than or equal to lower threshold.
        </li>
        <li class="error-text" v-if="error === 4">
          Please enter graph title.
        </li>
        <li class="error-text" v-if="error === 6">
          Please enter graph description.
        </li>
        <li class="error-text" v-if="error === 6">
          Please enter channel descriptions.
        </li>
        <li class="error-text" v-if="error === 7">
          Please select channel colors.
        </li>
      </template>
    </ul>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapState } from "vuex";
import { refreshChannel } from "../socket";

export default {
  name: "LoggerList",
  computed: {
    ...mapGetters(["channels", "selectedChannels"]),
    ...mapState(["title", "description", "threshold"])
  },
  data() {
    return {
      errors: []
    };
  },
  methods: {
    ...mapMutations([
      "toggleChannel",
      "setView",
      "setThreshold",
      "setTitle",
      "setDescription"
    ]),
    selectChannel(id) {
      this.toggleChannel(id);
      refreshChannel(id);
    },
    showGraph() {
      this.errors = [];
      if (this.selectedChannels.length === 0) {
        this.errors.push(1);
      }
      if (isNaN(this.threshold.upper) || isNaN(this.threshold.lower)) {
        this.error.push(2);
      }
      if (this.threshold.upper < this.threshold.lower) {
        this.errors.push(3);
      }
      if (!this.title) {
        this.errors.push(4);
      }
      if (!this.description) {
        this.errors.push(5);
      }
      this.selectedChannels.forEach(ch => {
        if (!ch.description && this.errors.indexOf(6) < 0) {
          this.errors.push(6);
        }
        if (!ch.color && this.errors.indexOf(7) < 0) {
          this.errors.push(7);
        }
      });
      if (this.errors.length > 0) {
        return;
      }

      this.setView("graph");
    },
    changeUpperThreshold(val) {
      this.setThreshold({ key: "upper", val });
    },
    changeLowerThreshold(val) {
      this.setThreshold({ key: "lower", val });
    },
    changeTitle(val) {
      this.setTitle(val);
    },
    changeDescription(val) {
      this.setDescription(val);
    },
    checkbox(i) {
      return `checkbox-${i}`;
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
.input-row {
  margin-top: 16px;
}
.input-row label {
  padding-top: 6px;
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
.errors {
  margin-top: 40px;
}
.error-text {
  color: red;
  margin-bottom: 10px;
  padding: 0;
}
</style>
