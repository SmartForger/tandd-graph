<template>
  <div class="loggers">
    <h4>Available Loggers</h4>
    <ul>
      <li :key="i" v-for="(logger, i) in loggers">
        <b-form-checkbox
          :id="`checkbox-${i}`"
          v-model="logger.selected"
          :name="`logger-${i}`"
          @change="loggerChanged"
        >{{loggerLabel(logger)}}</b-form-checkbox>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "LoggerList",
  props: {
    loggers: Array
  },
  methods: {
    loggerLabel(logger) {
      return `${logger.name} - ${logger.channel}`;
    },
    loggerChanged() {
      this.$emit("listChanged");
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.loggers {
  border-right: 1px solid #aaa;
  padding-top: 40px;
  height: 100%;
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
