<template>
  <div :class="'last-data-point ' + bubblePos" :style="{left, top}">
    <div class="channel-row" :key="i" v-for="(ch, i) in channels">
      <div class="label" :style="{color: ch.color}">{{ch.label}}</div>
      <div class="value" :style="{color: ch.color}">{{ch.val}} °C</div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";

export default {
  name: "LastDataPoint",
  computed: {
    ...mapGetters(["selectedChannels"]),
    ...mapState(["data"]),
    channels() {
      return this.selectedChannels.map(ch => {
        const data = this.data[ch.serial];
        const key = "ch" + ch.num;
        const val = data[data.length - 1][key];
        return {
          label: ch.description,
          color: ch.color,
          val
        };
      });
    },
    left() {
      return this.x + "px";
    },
    top() {
      return this.y + "px";
    }
  },
  props: {
    x: Number,
    y: Number,
    bubblePos: String
  }
};
</script>

<style lang="css" scoped>
.last-data-point {
  position: absolute;
  left: 0px;
  top: 0px;
}
.top {
  transform: translate(-100%, -100%) translate(-10px, -40px);
}
.bottom {
  transform: translate(-100%, -40px) translate(-10px, 80px);
}
.channel-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  white-space: nowrap;
}
.label {
  font-size: 30px;
  margin-right: 16px;
}
.value {
  font-size: 36px;
  font-weight: bold;
  width: 150px;
}
</style>
