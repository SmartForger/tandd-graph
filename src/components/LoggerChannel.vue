<template>
  <div class="logger-channel">
    <h4>{{ channel.name }}</h4>
    <h4>{{ channel.channel }}</h4>
    <b-form-textarea
      id="description"
      :value="channel.description"
      placeholder="Channel Description..."
      rows="3"
      max-rows="3"
      @change="descriptionChanged"
    ></b-form-textarea>
    <b-table hover :items="tableData"></b-table>
  </div>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import { getSocket } from "../socket";
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

      return this.data[this.channel.serial]
        ? this.data[this.channel.serial].slice(-300).map(d => ({
            time: moment(d.unixtime * 1000).format("YYYY-MM-DD kk:mm"),
            [tempField]: d[ch]
          }))
        : [];
    }
  },
  methods: {
    ...mapMutations(["setChannelDescription"]),
    descriptionChanged(val) {
      this.setChannelDescription({
        id: this.channel.id,
        description: val
      });
    }
  },
  mounted() {
    // const socket = getSocket();
    // socket.on(`data:${this.channel.serial}`, this.receiveData);
    // socket.emit("data", this.channel.serial);
  },
  beforeDestroy() {
    // const socket = getSocket();
    // socket.removeListener(`data:${this.channel.serial}`, this.receiveData);
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
</style>
