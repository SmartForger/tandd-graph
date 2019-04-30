<template>
  <div class="row" id="graph_view" ref="container">
    <b-button class="close-btn" variant="outline-info" @click="showList">&times;</b-button>
    <LastDataPoint :x="bubbleX" :y="bubbleY" :bubblePos="bubblePos"/>
    <Legend :x="30" :y="ybottom"/>
  </div>
</template>

<script>
import * as d3 from "d3";
import { mapMutations, mapGetters, mapState } from "vuex";
import _ from "lodash";

import LastDataPoint from "./LastDataPoint";
import Legend from "./Legend";

export default {
  name: "Graph",
  components: {
    LastDataPoint,
    Legend
  },
  computed: {
    ...mapGetters(["selectedChannels"]),
    ...mapState(["data", "dataUpdated", "title", "description", "threshold"])
  },
  data() {
    return {
      timeframe: [],
      ytop: 0,
      ybottom: 0,
      bubbleX: 0,
      bubbleY: 0,
      bubblePos: "top"
    };
  },
  watch: {
    dataUpdated() {
      this.debouncedMakeChart();
    }
  },
  methods: {
    ...mapMutations(["setView"]),
    showList() {
      this.setView("list");
    },
    makeChart() {
      const svgWidth = this.$refs.container.clientWidth;
      const svgHeight = this.$refs.container.clientHeight;
      const margin = { top: 150, right: 160, bottom: 280, left: 140 };
      const chartWidth = svgWidth - margin.left - margin.right;
      const chartHeight = svgHeight - margin.top - margin.bottom;

      const extents = this.selectedChannels.map(ch => {
        const arr = this.data[ch.serial];
        return [arr[0], arr[arr.length - 1]];
      });
      this.timeframe = d3.extent(d3.merge(extents), d => +d.unixtime * 1000);
      const x = d3
        .scaleTime()
        .range([0, chartWidth])
        .domain(this.timeframe);

      const yextents = this.selectedChannels.map(ch => {
        const arr = this.data[ch.serial];
        const key = "ch" + ch.num;
        return d3.extent(arr, d => (isNaN(d[key]) ? 0 : d[key]));
      });
      const ydomain = d3.extent([
        ...d3.merge(yextents, d => (isNaN(d) ? 0 : d)),
        this.threshold.upper,
        this.threshold.lower
      ]);
      const y = d3
        .scaleLinear()
        .range([chartHeight, 0])
        .domain(ydomain);

      const xAxis = d3
        .axisBottom(x)
        .tickSizeInner(-chartHeight - 80)
        .tickSizeOuter(0)
        .tickPadding(-40);
      const yAxis = d3
        .axisLeft(y)
        .tickSizeInner(0)
        .tickSizeOuter(0)
        .tickPadding(20)
        .tickFormat(d => d + " °C");

      d3.select("#graph_view svg").remove();

      const svg = d3
        .select("#graph_view")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

      const svgDefs = svg.append("defs");
      const thresholdGradient = svgDefs
        .append("linearGradient")
        .attr("id", "threshold_gradient")
        .attr("gradientTransform", "rotate(90)");
      thresholdGradient
        .append("stop")
        .attr("class", "th-stop-top")
        .attr("offset", "0");
      thresholdGradient
        .append("stop")
        .attr("class", "th-stop-middle")
        .attr("offset", "0.5");
      thresholdGradient
        .append("stop")
        .attr("class", "th-stop-bottom")
        .attr("offset", "1");

      const container = svg
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      svg
        .append("text")
        .attr("class", "graph-title")
        .attr("x", svgWidth / 2)
        .attr("y", 100)
        .text(this.title);

      this.addAxesAndLegend(
        container,
        xAxis,
        yAxis,
        margin,
        chartWidth,
        chartHeight
      );
      this.addThresholdArea(container, y, chartWidth);
      this.drawPaths(container, x, y);
      this.addDataPoint(container, chartWidth);
    },
    addAxesAndLegend(svg, xAxis, yAxis, margin, chartWidth, chartHeight) {
      const axes = svg.append("g");

      axes
        .append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (chartHeight + 80) + ")")
        .call(xAxis)
        .call(g => g.select(".domain").remove());

      const yAxisG = axes
        .append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .call(g => g.select(".domain").remove());
      yAxisG
        .append("path")
        .attr("class", "domain")
        .attr("d", `M0.5,${chartHeight + 80}V0.5`);
      yAxisG
        .append("path")
        .attr("class", "domain")
        .attr("d", `M0.5,${chartHeight + 80}V0.5`)
        .attr("transform", "translate(-80, 0)");
    },
    addThresholdArea(svg, y, chartWidth) {
      const yUpper = y(this.threshold.upper);
      const yLower = y(this.threshold.lower);

      svg
        .append("rect")
        .attr("class", "threshold-area")
        .attr("x", 0)
        .attr("y", yUpper)
        .attr("width", chartWidth)
        .attr("height", yLower - yUpper)
        .attr("fill", "white");
      svg
        .append("line")
        .attr("class", "threshold-line")
        .attr("x1", 0)
        .attr("y1", yLower)
        .attr("x2", chartWidth + 80)
        .attr("y2", yLower);
      svg
        .append("line")
        .attr("class", "threshold-line")
        .attr("x1", 0)
        .attr("y1", yUpper)
        .attr("x2", chartWidth + 80)
        .attr("y2", yUpper);
      svg
        .append("text")
        .attr("class", "threshold-label")
        .attr("x", 50)
        .attr("y", yUpper - 8)
        .text(this.threshold.upper + " °C");
      svg
        .append("text")
        .attr("class", "threshold-label")
        .attr("x", 50)
        .attr("y", yLower - 8)
        .text(this.threshold.lower + " °C");
    },
    drawPaths(svg, x, y) {
      this.ytop = 0;
      this.ybottom = 0;
      this.selectedChannels.forEach(ch => {
        const key = "ch" + ch.num;

        const line = d3
          .line()
          .curve(d3.curveBasis)
          .x(d => x(d.unixtime * 1000))
          .y(d => (isNaN(d[key]) ? y(0) : y(d[key])));

        const arr = this.data[ch.serial];
        const lastData = arr[arr.length - 1];
        const lastY = y(lastData[key]);
        if (this.ytop === 0 || this.ytop > lastY) {
          this.ytop = lastY;
        }
        if (this.ybottom < lastY) {
          this.ybottom = lastY;
        }

        svg
          .append("path")
          .data([arr])
          .attr("class", "median-line")
          .attr("stroke", ch.color)
          .attr("d", line);

        svg
          .append("circle")
          .attr("cx", x(lastData.unixtime * 1000))
          .attr("cy", lastY)
          .attr("r", 5)
          .attr("stroke-width", 3)
          .attr("stroke", ch.color)
          .attr("fill", "rgba(255,255,255,0.8)");
      });
    },
    addDataPoint(svg, chartWidth) {
      const r = 20;
      const el = document.querySelector(".last-data-point");
      const w = el.clientWidth - 10;
      const h = el.clientHeight - 20;

      const g = svg.append("g");
      if (this.ytop < 200) {
        g.attr("transform", `translate(${chartWidth}, ${this.ybottom + 10})`);
        g.append("path")
          .attr("class", "last-data-point revert")
          .attr(
            "d",
            `
              m 0,0 l -${r / 2},${r}
              l -${w + r / 2},0 a ${r} ${r} 90 0 0 -${r} ${r}
              l 0,${h} a ${r} ${r} 90 0 0 ${r} ${r}
              l ${w},0 a ${r} ${r} 90 0 0 ${r} -${r}
              l 0, -${h + r * 3}
            `
          );
        this.bubbleY = this.ybottom + 150;
        this.bubblePos = "bottom";
      } else {
        g.attr("transform", `translate(${chartWidth}, ${this.ytop - 10})`);
        g.append("path")
          .attr("class", "last-data-point revert")
          .attr(
            "d",
            `
              m 0,0 l -${r / 2},-${r}
              l -${w + r / 2},0 a ${r} ${r} 90 0 1 -${r} -${r}
              l 0,-${h} a ${r} ${r} 90 0 1 ${r} -${r}
              l ${w},0 a ${r} ${r} 90 0 1 ${r} ${r}
              l 0, ${h + r * 3}
            `
          );
        this.bubbleY = this.ytop + 150;
        this.bubblePos = "top";
      }
      this.bubbleX = chartWidth + 140;
    }
  },
  mounted() {
    this.debouncedMakeChart = _.debounce(this.makeChart, 3000);
    this.makeChart();
  }
};
</script>

<style scoped>
#graph_view {
  height: 100vh;
  position: relative;
  background: #1b425e;
}
.close-btn {
  border-radius: 50%;
  position: absolute;
  top: 10px;
  right: 30px;
}
.white {
  color: white;
}
</style>
