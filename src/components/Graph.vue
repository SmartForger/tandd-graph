<template>
  <div class="row" id="graph_view" ref="container">
    <b-button class="close-btn" variant="outline-info" @click="showList">&times;</b-button>
  </div>
</template>

<script>
import * as d3 from "d3";
import { mapMutations, mapGetters, mapState } from "vuex";

export default {
  name: "Graph",
  computed: {
    ...mapGetters(["selectedChannels"]),
    ...mapState(["data"])
  },
  data() {
    return {
      colors: []
    };
  },
  methods: {
    ...mapMutations(["setView"]),
    showList() {
      this.setView("list");
    },
    makeChart(data) {
      const svgWidth = this.$refs.container.clientWidth;
      const svgHeight = this.$refs.container.clientHeight;
      const margin = { top: 150, right: 80, bottom: 280, left: 140 };
      const chartWidth = svgWidth - margin.left - margin.right;
      const chartHeight = svgHeight - margin.top - margin.bottom;

      const extents = this.selectedChannels.map(ch => {
        const arr = this.data[ch.serial];
        return [arr[0], arr[arr.length - 1]];
      });
      const x = d3
        .scaleTime()
        .range([0, chartWidth])
        .domain(d3.extent(d3.merge(extents), d => +d.unixtime * 1000));

      const yextents = this.selectedChannels.map(ch => {
        const arr = this.data[ch.serial];
        const key = "ch" + ch.num;
        return d3.extent(arr, d => (isNaN(d[key]) ? 0 : d[key]));
      });
      const y = d3
        .scaleLinear()
        .range([chartHeight, 0])
        .domain(d3.extent(d3.merge(yextents, d => (isNaN(d) ? 0 : d))));

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

      const svg = d3
        .select("#graph_view")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);
      const container = svg
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      svg
        .append("text")
        .attr("class", "graph-title")
        .attr("x", svgWidth / 2)
        .attr("y", 100)
        .text("Graph");

      this.addAxesAndLegend(
        container,
        xAxis,
        yAxis,
        margin,
        chartWidth,
        chartHeight
      );
      this.drawPaths(container, x, y);
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

      this.colors = d3.scaleOrdinal(d3.schemeAccent);

      const legendContainer = svg
        .append("g")
        .attr("class", "legend")
        .attr("transform", `translate(-80, ${chartHeight + 100})`);

      this.selectedChannels.forEach((channel, i) => {
        const col = Math.floor(i / 2);
        const row = i % 2;

        const legend = legendContainer
          .append("g")
          .attr("transform", `translate(${col * 360}, ${row * 80})`);

        legend
          .append("rect")
          .attr("fill", this.colors(i).toString())
          .attr("width", 40)
          .attr("height", 40);

        legend
          .append("text")
          .attr("class", "legend-text")
          .attr("fill", this.colors(i).toString())
          .attr("x", 60)
          .attr("y", 33)
          .text(`${channel.name} - ${channel.num}`);
      });

      const cols = Math.ceil(this.selectedChannels.length / 2);
      legendContainer
        .append("rect")
        .attr("fill", "#2d668e")
        .attr("width", 5)
        .attr("height", 120)
        .attr("x", cols * 360);

      const text =
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
      const description = text.length > 160 ? text.slice(0, 160) + "..." : text;
      d3.select("#graph_view")
        .append("div")
        .attr("class", "description")
        .attr(
          "style",
          `
          left: ${cols * 360 + 120}px;
          top: ${chartHeight + 250}px;
        `
        )
        .text(description);
    },
    drawPaths(svg, x, y) {
      this.selectedChannels.forEach((ch, i) => {
        const key = "ch" + ch.num;

        const line = d3
          .line()
          .curve(d3.curveBasis)
          .x(d => x(d.unixtime * 1000))
          .y(d => (isNaN(d[key]) ? y(0) : y(d[key])));

        svg
          .append("path")
          .data([this.data[ch.serial]])
          .attr("class", "median-line")
          .attr("stroke", this.colors(i))
          .attr("d", line);
      });
    }
  },
  mounted() {
    const parseDate = d3.timeParse("%Y-%m-%d");

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
