import Vue from "vue";
import Vuex from "vuex";

import * as getters from "./getters";
import * as mutations from "./mutations";
// import * as actions from "./actions";

Vue.use(Vuex);

const state = {
  view: "list",
  channels: [],
  selected: [],
  data: {},
  dataUpdated: 0,
  threshold: {
    upper: 0,
    lower: 0
  },
  startTime: 0,
  endTime: 0,
  title: "",
  description: ""
};

const store = new Vuex.Store({
  state,
  getters,
  mutations
});

export default store;
