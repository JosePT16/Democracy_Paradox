function drawAfricaMap(targetYear) {
//function for calling in the animation
//IA: How to create functions for calling inside D3

  return new Promise((resolve) => {

    const mapGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    mapGroup.setAttribute("class", "year_" + targetYear);

    const projection = d3.geoMercator()
      .scale(300)           
      .center([20, 0]);    

    const path = d3.geoPath().projection(projection);

    Promise.all([
      d3.json("afr.geojson"),
      d3.csv("afr.csv")
    ]).then(([geo, csv]) => {

      // Filter for year
      const dataMap = {};
      csv.forEach(d => {
        if (+d.year === targetYear) {
          dataMap[d.id] = +d.dem;
        }
      });

      const group = d3.select(mapGroup);

      group.selectAll("path")
        .data(geo.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("stroke", "black")
        .attr("fill", d => {
          let code = d.properties.id;     // for matching the fields
          let val = dataMap[code];
          return val === 1 ? "#04724D" : "#A53F2B";
        });

      resolve(group);  // Return the <g>
    });
  });
}
