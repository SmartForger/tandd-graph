<template>
  <div class="logger-channel">
    <h4>{{logger.name}}</h4>
    <h4>{{logger.channel}}</h4>
    <b-table hover :items="data"></b-table>
  </div>
</template>

<script>
import { getSocket } from "../socket";
import * as moment from "moment";

export default {
  name: "LoggerChannel",
  props: {
    logger: Object
  },
  data() {
    return {
      data: []
    };
  },
  methods: {
    receiveData(data) {
      const ch = this.logger.chId;
      const tempField = `Temp(${this.logger.unit})`;

      this.data = data.data
        .map(d => ({
          time: moment(d.unixtime * 1000).format("kk:mm:ss"),
          [tempField]: d[ch]
        }))
        .reverse();
    }
  },
  mounted() {
    const socket = getSocket();
    socket.on(`ch:${this.logger.serial}`, this.receiveData);
    socket.emit("data", this.logger.serial);
  },
  beforeDestroy() {
    const socket = getSocket();
    socket.removeListener(`ch:${this.logger.serial}`, this.receiveData);
    socket.emit("");
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.logger-channel {
  width: 200px;
  padding: 40px 10px 10px;
  text-align: center;
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
