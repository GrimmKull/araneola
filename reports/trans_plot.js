var transplot = function (id, dataset) {
	if (dataset.data.length === 0) return;

    var margin = 30;
	var w = document.getElementById(id).offsetWidth || 916;
    //var w = document.getElementById(id).offsetWidth - margin*5;//500; //520;
	w = w - margin*5;
    var h = 250 - margin*2; //250;
// console.log(dataset.data[0]);

	document.getElementById(id+"_lbl").innerText = dataset.type;

    var states = dataset.data[0].map(function(item){ return item.state; });

    var x = d3.scale.ordinal().domain(states).rangePoints([0, w]);
    var y = {};

    var line = d3.svg.line(),
        axis = d3.svg.axis().orient("left"),
        foreground;

    d3.select("#svg-" + id).remove();

    //Create SVG element
    var svg = d3.select("#"+id)
        .append("svg:svg")
            .attr("id", "svg-" + id)
            .attr("width", w + margin*2 + 40)//- margin - margin)
            .attr("height", h + margin*2)//- margin - margin)
        .append("svg:g")
            .attr("transform", "translate(" + 2*margin + "," + margin + ")");

    states.forEach(function(p) {
        // flowers.forEach(function(p) { p[d] = +p[d]; });

        y[p] = d3.scale.linear()
            .domain(d3.extent(dataset.data, function(d) {
                for (var i = 0; i < d.length; i++) {
                    // if (d[i].state == p) console.log(d[i].end - d[i].start)
                    if (d[i].state == p) return d[i].end - d[i].start;
                }
                return 0;
            }))
            .range([h, 0]);
    });

  // Add foreground lines.
  foreground = svg.append("svg:g")
      .attr("class", "foreground")
    .selectAll("path")
      .data(dataset.data)
      .attr("class","line")
    .enter().append("svg:path")
      .attr("d", function(d) {
          var info = 0;
          for (var i = 0; i < d.length; i++) {
            //if (d == )
          }
        //   console.log(d);

          return line(states.map(function(p) {
            //   console.log(p, d, y[p](d), x(p));
            var temp = 0;
            for (var i = 0; i < d.length; i++) {
                //console.log(p[i].state, d);
                if (d[i].state == p) temp = d[i].end - d[i].start;
            }

            return [x(p), y[p](temp)];
          }));//traits.map(function(p) { return [x(p), y[p](d[p])]; }));
      })
    .attr("fill", 'none')
    .attr("stroke", '#27AE60')
    .attr("class", function(d) { return d.state; });

  // Add a group element for each trait.
  var g = svg.selectAll(".state")
      .data(states)
    .enter().append("svg:g")
      .attr("class", "state")
      .attr("transform", function(d) { return "translate(" + x(d) + ")"; });

  // Add an axis and title.
  g.append("svg:g")
      .attr("class", "axis")
      .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
    .append("svg:text")
      .attr("text-anchor", "middle")
      .attr("y", -9)
      .text(String);
};
