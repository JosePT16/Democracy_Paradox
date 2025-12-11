const svg_lat = d3.select("#map_lat");

//setting the years
const years = [1978, 1979, 1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
  1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999];
const maps_lac = [];

let currentYearIndex = 0;
let timer = null;

//loading the maps
Promise.all(years.map(y => drawLatMap(y)))
  .then(results => {

    results.forEach((mapObj, i) => {
      maps_lac.push({
        year: years[i],
        map_object: mapObj
      });
    });

    updateMap();  
    setupButtons();
  });

// Update map
function updateMap() {
  d3.select("#map_title")
    .text("Democracy in Latin America - " + maps_lac[currentYearIndex].year);

  svg_lat
    .selectAll("g.mapYear")
    .data([maps_lac[currentYearIndex]], d => d.year)
    .join(
      enter =>
        enter
          .append(d => d.map_object.node())
          .attr("class", "mapYear")
          .style("opacity", 0)
          .transition()
          .duration(1)
          .style("opacity", 1),

      update =>
        update
          .transition()
          .duration(1)
          .style("opacity", 1),

      exit =>
        exit
          .transition()
          .duration(1)
          .style("opacity", 0)
          .remove()
    );
}

// Next year
function nextYear() {
  if (currentYearIndex < maps_lac.length - 1) {
    currentYearIndex += 1;
    updateMap();
  } else {
    stopAnimation(); 
  }
}

// Play
function playAnimation() {
  if (!timer) {
    timer = setInterval(nextYear, 450);
  }
}

//Stop
function stopAnimation() {
  clearInterval(timer);
  timer = null;
}

//IA: How to add a restart button
function restartAnimation() {
  stopAnimation();          
  currentYearIndex = 0;     
  updateMap();              
}

// UI buttons
function setupButtons() {
  const controls = d3.select("#map_controls");

  controls.append("button")
    .text("Play")
    .on("click", playAnimation);
  
  controls.append("button")
    .text("Restart")
    .on("click", restartAnimation);
  
  controls.append("button")
    .text("Stop")
    .on("click", stopAnimation);
}
