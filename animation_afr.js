
const svg_afr = d3.select("#map_afr");

//setting the years
const years_afr = [
  1985, 1986, 1987, 1988, 1989,
  1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000
];

const maps_afr = [];

let currentYearIndex_afr = 0;
let timer_afr = null;

// Loading the maps
Promise.all(years_afr.map(y => drawAfricaMap(y)))
  .then(results => {

    results.forEach((mapObj, i) => {
      maps_afr.push({
        year: years_afr[i],
        map_object: mapObj
      });
    });

    updateAfricaMap();   
    setupAfricaButtons();
  });

// Update the map
function updateAfricaMap() {

  d3.select("#map_title_afr")
    .text("Democracy in Africa - " + maps_afr[currentYearIndex_afr].year);

  svg_afr
    .selectAll("g.mapYear")
    .data([maps_afr[currentYearIndex_afr]], d => d.year)
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
function nextAfricaYear() {
  if (currentYearIndex_afr < maps_afr.length - 1) {
    currentYearIndex_afr += 1;
    updateAfricaMap();
  } else {
    stopAfricaAnimation();
  }
}

// Play
function playAfricaAnimation() {
  if (!timer_afr) {
    timer_afr = setInterval(nextAfricaYear, 450);
  }
}

function stopAfricaAnimation() {
  clearInterval(timer_afr);
  timer_afr = null;
}

//IA: How to add a restart button

function restartAfricaAnimation() {
  stopAfricaAnimation();
  currentYearIndex_afr = 0;
  updateAfricaMap();
}

// UI buttons
function setupAfricaButtons() {
  const controls = d3.select("#map_controls_afr");

  controls.append("button")
    .text("Play")
    .on("click", playAfricaAnimation);

  controls.append("button")
    .text("Restart")
    .on("click", restartAfricaAnimation);

  controls.append("button")
    .text("Stop")
    .on("click", stopAfricaAnimation);
}
