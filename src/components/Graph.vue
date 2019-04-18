<template>
  <div class="row" id="graph_view" ref="container">
    <b-button class="close-btn" variant="outline-info" @click="showList">
      &times;
    </b-button>
  </div>
</template>

<script>
import * as d3 from "d3";
import { mapMutations } from "vuex";

export default {
  name: "Graph",
  methods: {
    ...mapMutations(["setView"]),
    showList() {
      this.setView("list");
    },
    draw() {},
    makeChart(data) {
      const svgWidth = this.$refs.container.clientWidth;
      const svgHeight = this.$refs.container.clientHeight;
      const margin = { top: 60, right: 80, bottom: 280, left: 140 };
      const chartWidth = svgWidth - margin.left - margin.right;
      const chartHeight = svgHeight - margin.top - margin.bottom;

      const x = d3
        .scaleTime()
        .range([0, chartWidth])
        .domain(d3.extent(data, d => d.date));
      const y = d3
        .scaleLinear()
        .range([chartHeight, 0])
        .domain([0, d3.max(data, d => d.pct95)]);

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
        .attr("height", svgHeight)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      this.addAxesAndLegend(svg, xAxis, yAxis, margin, chartWidth, chartHeight);
      this.drawPaths(svg, data, x, y);
    },
    addAxesAndLegend(svg, xAxis, yAxis, margin, chartWidth, chartHeight) {
      const legendWidth = 200;
      const legendHeight = 100;

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

      // const legend = svg
      //   .append("g")
      //   .attr("class", "legend")
      //   .attr("transform", "translate(" + (chartWidth - legendWidth) + ", 0)");

      // legend
      //   .append("rect")
      //   .attr("class", "legend-bg")
      //   .attr("width", legendWidth)
      //   .attr("height", legendHeight);

      // legend
      //   .append("rect")
      //   .attr("class", "outer")
      //   .attr("width", 75)
      //   .attr("height", 20)
      //   .attr("x", 10)
      //   .attr("y", 10);

      // legend
      //   .append("text")
      //   .attr("x", 115)
      //   .attr("y", 25)
      //   .text("5% - 95%");

      // legend
      //   .append("rect")
      //   .attr("class", "inner")
      //   .attr("width", 75)
      //   .attr("height", 20)
      //   .attr("x", 10)
      //   .attr("y", 40);

      // legend
      //   .append("text")
      //   .attr("x", 115)
      //   .attr("y", 55)
      //   .text("25% - 75%");

      // legend
      //   .append("path")
      //   .attr("class", "median-line")
      //   .attr("d", "M10,80L85,80");

      // legend
      //   .append("text")
      //   .attr("x", 115)
      //   .attr("y", 85)
      //   .text("Median");
    },
    drawPaths(svg, data, x, y) {
      const medianLine = d3
        .line()
        .curve(d3.curveBasis)
        .x(function(d) {
          return x(d.date);
        })
        .y(function(d) {
          return y(d.pct50);
        });

      svg.datum(data);

      svg
        .append("path")
        .attr("class", "median-line")
        .attr("d", medianLine);
    }
  },
  mounted() {
    const parseDate = d3.timeParse("%Y-%m-%d");

    d3.json("data.json").then(data => {
      const graphData = data.map(d => ({
        date: parseDate(d.date),
        pct05: d.pct05 / 1000,
        pct25: d.pct25 / 1000,
        pct50: d.pct50 / 1000,
        pct75: d.pct75 / 1000,
        pct95: d.pct95 / 1000
      }));
      this.makeChart(graphData);
    });
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
