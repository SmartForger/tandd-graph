<template>
  <div class="legend">
    <div class="channel-col" :key="i" v-for="(group, i) in groups">
      <div class="channel-row" :key="j" v-for="(channel, j) in group">
        <div class="color-box" :style="{backgroundColor: channel.color}"/>
        <div class="name" :style="{color: channel.color}">{{ channel.name }}</div>
      </div>
    </div>
    <div class="description">{{description}}</div>
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";

export default {
  name: "Legend",
  computed: {
    ...mapGetters(["selectedChannels"]),
    ...mapState(["data", "description"]),
    groups() {
      const channels = this.selectedChannels.map(ch => ({
        color: ch.color,
        name: ch.description
      }));
      const groups = [];
      let cGroup = [];
      channels.forEach((ch, i) => {
        cGroup.push(ch);
        if (i % 2 === 1) {
          groups.push(cGroup);
          cGroup = [];
        }
      });
      if (cGroup.length > 0) {
        groups.push(cGroup);
      }
      return groups;
    },
    left() {
      return this.x + "px";
    },
    top() {
      return this.y + "px";
    }
  }
};
</script>

<style lang="css" scoped>
.legend {
  position: absolute;
  left: 30px;
  top: 100%;
  display: flex;
  flex-wrap: nowrap;
  overflow: hidden;
  padding: 20px;
  transform: translate(0, -100%) translate(0, -30px);
}
.channel-col {
  margin-right: 20px;
  flex: 0;
}
.channel-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.channel-row:last-child {
  margin-bottom: 0;
}
.color-box {
  width: 40px;
  height: 40px;
  margin-right: 24px;
}
.name {
  font-family: "Open Sans", "Helvetica Neue", sans-serif;
  font-size: 36px;
  white-space: nowrap;
}
.description {
  color: white;
  font-size: 20px;
  flex: 1;
  margin-top: 8px;
  padding-left: 50px;
  border-left: 5px solid #2d668e;
  margin-left: 30px;
}
</style>
