var svg2 = d3.select("#scatterplot"),
    margin = {top: 40, right: 120, bottom: 60, left: 70},
    width = +svg2.attr("width") - margin.left - margin.right,
    height = +svg2.attr("height") - margin.top - margin.bottom;

    //IA: how to make a scatter on D3
var g = svg2.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Tooltip
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("font-size", "18px");


var scatterSlider = d3.select("#scatterYearSlider");
var scatterLabel  = d3.select("#scatterYearLabel");

// Loading data
d3.csv("scatter.csv").then(data => {

    data.forEach(function(d) {
        d.year    = +d.year;
        d.gini    = +d.gini_disp_mean;
        d.repress = +d.v2csreprss;
    });

    // Populate dropdown
    var uniqueCountries = Array.from(new Set(data.map(d => d.country_name))).sort();
    var dropdown = d3.select("#countryFilter");

    dropdown.selectAll("option.country")
        .data(uniqueCountries)
        .enter()
        .append("option")
        .attr("class", "country")
        .attr("value", d => d)
        .text(d => d);

    // Extract years
    var years = Array.from(new Set(data.map(d => d.year))).sort();
    var defaultYear = years[years.length - 1];

    scatterSlider.attr("min", years[0]);
    scatterSlider.attr("max", years[years.length - 1]);
    scatterSlider.property("value", defaultYear);
    scatterLabel.text(defaultYear);

    var color = d3.scaleOrdinal()
        .domain(["Electoral Authoritarian", "Minimally Democratic", "Democratic", "Autocratic"])
        .range(["#a57e2bff", "#a57e2bff", "#04724D", "#A53F2B"]);

    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    var xAxisGroup = g.append("g")
        .attr("transform", "translate(0," + height + ")");

    var yAxisGroup = g.append("g");

    // Points group
    var pointsGroup = g.append("g")
        .attr("class", "points");


    g.append("text")
        .attr("x", width / 2)
        .attr("y", height + 45)
        .style("text-anchor", "middle")
        .style("font-size", "25px")
        .text("Gini (Inequality)");

    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -50)
        .style("text-anchor", "middle")
        .style("font-size", "25px")
        .text("Cost of Repression");

    // Legend
    var legendData = [
        {label: "Democratic", color: "#04724D"},
        {label: "Autocratic", color: "#b13c24ff"},
        {label: "Electoral authoritarism\nor Minimally Democracy", color: "#a57e2bff"},
    ];

    var legend = g.append("g")
        .attr("transform", "translate(" + (width + 20) + ", 20)");

    legend.selectAll("rect")
        .data(legendData)
        .enter()
        .append("rect")
        .attr("x", -120)
        .attr("y", (d, i) => i * 22)
        .attr("width", 14)
        .attr("height", 14)
        .attr("fill", d => d.color);

    legend.selectAll("text")
        .data(legendData)
        .enter()
        .append("text")
        .attr("x", 22)
        .attr("y", (d, i) => i * 22 + 12)
        .style("font-size", "18px")
        .each(function(d) {
            var lines = d.label.split("\n");
            d3.select(this)
              .selectAll("tspan")
              .data(lines)
              .enter()
              .append("tspan")
              .attr("x", -100)
              .attr("dy", (line, i) => i === 0 ? 0 : 18)
              .text(line => line);
        });


    function update(year) {

        var filtered = data.filter(d => d.year === +year);
        filtered = filtered.filter(d => !isNaN(d.gini) && !isNaN(d.repress));

        if (!filtered.length) {
            pointsGroup.selectAll("circle").remove();
            return;
        }

        x.domain(d3.extent(filtered, d => d.gini)).nice();
        y.domain(d3.extent(filtered, d => d.repress)).nice();

        xAxisGroup.call(d3.axisBottom(x)).selectAll("text").style("font-size", "16px");
        yAxisGroup.call(d3.axisLeft(y)).selectAll("text").style("font-size", "16px");

        var selectedCountry = dropdown.property("value");

        // Data join
        var circles = pointsGroup.selectAll("circle")
            .data(filtered, d => d.country_name);

        // for exiting 
        circles.exit().remove();

    
        var circlesEnter = circles.enter()
            .append("circle")
            .attr("r", 10)
            .attr("cx", d => x(d.gini))
            .attr("cy", d => y(d.repress))
            .attr("fill", d => color(d.class))
            .attr("opacity", 0.85)
            .on("mouseover", function(event, d) {
                tooltip
                    .style("opacity", 1)
                    .style("left", (event.pageX + 12) + "px")
                    .style("top", (event.pageY - 28) + "px")
                    .html(
                        "<b>" + d.country_name + "</b><br>" +
                        "Gini: " + d.gini + "<br>" +
                        "Repression: " + d.repress + "<br>" +
                        "Class: " + d.class
                    );
            })
            .on("mousemove", function(event) {
                tooltip
                    .style("left", (event.pageX + 12) + "px")
                    .style("top",  (event.pageY - 28) + "px");
            })
            .on("mouseout", () => tooltip.style("opacity", 0));


        circlesEnter.merge(circles)
            .transition()
            .duration(500)
            .attr("cx", d => x(d.gini))
            .attr("cy", d => y(d.repress))
            .attr("fill", d => color(d.class))
            .attr("opacity", d => {
                if (selectedCountry === "all") return 0.85;
                return d.country_name === selectedCountry ? 0.9 : 0.1;
            });
    }

    // Initial drawn
    update(defaultYear);

    //control
    scatterSlider.on("input", function() {
        let year = +this.value;
        scatterLabel.text(year);
        update(year);
    });

    dropdown.on("change", function() {
        update(+scatterSlider.property("value"));
    });

});
