<template>
  <div class="container-fluid" id="app">
    <ListView v-if="view === 'list'" />
    <Graph v-if="view === 'graph'" />
  </div>
</template>

<script>
import { mapState } from "vuex";
import ListView from "./components/ListView";
import Graph from "./components/Graph";

export default {
  name: "app",
  components: {
    ListView,
    Graph
  },
  computed: mapState(["view"])
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
