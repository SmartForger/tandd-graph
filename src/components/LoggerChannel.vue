<template>
  <div class="logger-channel">
    <h4>{{ channel.name }}</h4>
    <h4>{{ channel.channel }}</h4>
    <b-form-input
      id="description"
      :value="channel.description"
      placeholder="Channel Description..."
      @change="descriptionChanged"
    ></b-form-input>
    <b-form-select
      class="mt-10"
      :value="channel.color"
      :options="colors"
      placeholder="Select a color"
      @change="selectColor"
    ></b-form-select>
    <b-table hover :items="tableData"></b-table>
    <span class="more" v-if="more">...</span>
  </div>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import * as moment from "moment";

export default {
  name: "LoggerChannel",
  props: {
    channel: Object
  },
  computed: {
    ...mapState(["data"]),
    tableData() {
      const ch = `ch${this.channel.num}`;
      const tempField = `Temp(${this.channel.unit})`;
      const chData = this.data[this.channel.serial];
      return chData
        ? chData
            .slice(-300)
            .map(d => ({
              time: moment(d.unixtime * 1000).format("YYYY-MM-DD kk:mm"),
              [tempField]: d[ch]
            }))
            .reverse()
        : [];
    }
  },
  watch: {
    data(val) {
      const chData = val[this.channel.serial];
      if (chData && chData.length > 300) {
        this.more = true;
      } else {
        this.more = false;
      }
    }
  },
  data() {
    return {
      colors: [
        { value: "#5fc2a0", text: "TemperPack" },
        { value: "#fcb13b", text: "Yellow" },
        { value: "#d95a4d", text: "Red" },
        { value: "#04658d", text: "Blue" },
        { value: "#e6e7e8", text: "Light Grey" }
      ],
      more: false
    };
  },
  methods: {
    ...mapMutations(["setChannelAttribute"]),
    descriptionChanged(val) {
      this.setChannelAttribute({
        id: this.channel.id,
        attr: "description",
        value: val
      });
    },
    selectColor(color) {
      this.setChannelAttribute({
        id: this.channel.id,
        attr: "color",
        value: color
      });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.logger-channel {
  width: 260px;
  padding: 40px 10px 10px;
  text-align: center;
  flex: none;
}
h4 {
  margin-bottom: 10px;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  padding: 16px 0 0;
  font-size: 16px;
}
.mt-10 {
  margin-top: 10px;
}
.more {
  display: block;
  font-size: 20px;
  font-weight: bold;
  letter-spacing: 1.1em;
  margin-top: -20px;
  margin-bottom: 30px;
}
</style>
