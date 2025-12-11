var svg = d3.select("#my_dataviz");
var width = +svg.attr("width"),
    height = +svg.attr("height");

var mapGroup = null;

var selectedVariable = "yeardem";

//IA: How to built a choropleth map with d3.js

// Map
var path = d3.geoPath();
var projection = d3.geoMercator()
  .scale(50)
  .center([0, -50])
  .translate([width / 2, height / 2]);

// Data container
var dataByYear = {};

//color and legend
var colorScale = d3.scaleLinear()
  .domain([0, 1])
  .range(["#A53F2B", "#04724D"]);

var legendData = [
  {label: "Democracy", color: "#04724D"},
  {label: "Not Democracy", color: "#A53F2B"}
];

// Loading data
Promise.all([
  d3.json("world.geojson"),
  d3.csv("trial1.csv", function(d) {
    d.year = +d.year;

    if (!dataByYear[d.year]) dataByYear[d.year] = {};

    dataByYear[d.year][d.code] = {
      yeardem: +d.yeardem,
      yearrev: +d.yearrev
    };

    return d;
  })
]).then(([topo]) => {
  ready(null, topo);
});



// DRAW MAP
function ready(error, topo) {

  // Title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 25)
    .style("text-anchor", "left")
    .style("font-size", "25px")
    .style("font-weight", "bold")
    .text("Dynamics of Democracy 1960–2010");

  //legend
  var legend = svg.append("g")
    .attr("transform", "translate(20, 50)"); 

  // IA: How to add a legend to a d3.js map
  legend.selectAll("rect")
    .data(legendData)
    .enter()
    .append("rect")
      .attr("x", 0)
      .attr("y", (d, i) => i * 25)
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", d => d.color);

  // Labels
  legend.selectAll("text")
    .data(legendData)
    .enter()
    .append("text")
      .attr("x", 28)
      .attr("y", (d, i) => i * 25 + 14)
      .style("font-size", "18px")
      .text(d => d.label);


  
  mapGroup = svg.append("g")
    .attr("transform", "translate(0, 100)");

  mapGroup.selectAll("path")
    .data(topo.features.filter(d => d.id !== "ATA"))
    .enter()
    .append("path")
      .attr("d", d3.geoPath().projection(projection))
      .attr("stroke", "#000")
      .attr("fill", "#ccc");

  let defaultYear = Object.keys(dataByYear)[0];
  updateMap(defaultYear);

  d3.select("#yearLabel").text(defaultYear);
  d3.select("#yearSlider").property("value", defaultYear);
}


//IA: How to update a d3.js map based on a slider input
var currentYear = null;

function updateMap(year) {
  currentYear = year;

  mapGroup.selectAll("path")
    .attr("fill", function(d) {

      let yearData = dataByYear[year] || {};
      let entry = yearData[d.id];

      if (!entry) return "#ccc";

      let val = entry[selectedVariable];

      if (isNaN(val)) return "#ccc";

      return colorScale(val);
    });
}


// slider
d3.select("#yearSlider").on("input", function() {
  let year = +this.value;
  d3.select("#yearLabel").text(year);
  updateMap(+year);
});
