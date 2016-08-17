var histplot = function (id, dataset) {
	var margin = 10;//10;//30;
	var w = document.getElementById(id).offsetWidth || 916;
	w = w - margin*15;//500; //520;
	var h = 400 ;

	var bins = 20;

	var formatCount = d3.format(",.0f");

	var min = d3.min(dataset, function(d) { return d.response; });
	var max = d3.max(dataset, function(d) { return d.response; });

	//console.log(min,max);

	//console.log(calcMeanSdVar(d3.values(dataset)))

	//console.log(calcMeanSdVar1(d3.values(dataset)))

	var x = d3.scale.linear()
		.domain([0, 1])
		//.domain([min, max])
		.range([0, w]);

	// Generate a histogram using twenty uniformly-spaced bins.
	var data = d3.layout.histogram()
		.bins(x.ticks(bins))
		// .range([min, max])
		.value(function(d) { return (d.response-min)/(max-min); })
		(dataset);

	var y = d3.scale.linear()
		.domain([0, d3.max(data, function(d) { return d.y; })])
		.range([h, 0]);

	var xAxis = d3.svg.axis()
		.scale(x)
		.tickFormat(function(d, i){
			console.log(d,i);
			return Math.floor(d * (max-min) + min);
		})
		.orient("bottom");

	//console.log(x(0), x(0.5), x(1));

	var svg = d3.select("#"+id).append("svg")
		.attr("width", w + margin*6)
		.attr("height", h + margin*3)
	  .append("g")
		// .attr("height", h - margin*4)
		// .attr("width", w - margin - 50)
		.attr("transform", "translate(" + 4*margin + "," + 0 + ")");

	var bar = svg.selectAll(".bar1")
		.data(data)
	  .enter().append("g")
		.attr("class", "bar1")
		.attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

	bar.append("rect")
		.attr("x", 1)
		.attr("class", "bar")
		.attr("width", x(data[0].dx) - 1)
		.attr("height", function(d) { return h - y(d.y); });

	bar.append("text")
		.attr("dy", ".75em")
		.attr("y", function(d) {
			console.log( h - y(d.y));
			if ( h - y(d.y) < 20)
				return - 20;
			else
				return 6;
		})
		.attr("x", x(data[0].dx) / 2)
		.attr("text-anchor", "middle")
		.attr("fill", function(d) {
			if ( h - y(d.y) < 20)
				return "black";
			else
				return "white";
		})
		.text(function(d) { return formatCount(d.y); });

	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + h + ")")
		.call(xAxis);

}

var callhistplot = function (id, dataset) {
	var margin = 10;//10;//30;
	var w = document.getElementById(id).offsetWidth || 916;
	w = w - margin*15;//500; //520;
	var h = 100 ;

	var bins = 20;

	var formatCount = d3.format(",.0f");

	//var min = d3.min(dataset});
	//var max = d3.max(dataset);

	//console.log(min,max);

	//console.log(calcMeanSdVar(d3.values(dataset)))

	//console.log(calcMeanSdVar1(d3.values(dataset)))

	var r = calcMeanSdVar(dataset);

	var min = r.min;
	var max = r.max;

	var x = d3.scale.linear()
		.domain([0, 1])
		//.domain([min, max])
		.range([0, w]);

	// Generate a histogram using twenty uniformly-spaced bins.
	var data = d3.layout.histogram()
		.bins(x.ticks(bins))
		// .range([min, max])
		.value(function(d) { return (d-min)/(max-min); })
		(dataset);

	var y = d3.scale.linear()
		.domain([0, d3.max(data, function(d) { return d.y; })])
		.range([h, 0]);

	var xAxis = d3.svg.axis()
		.scale(x)
		.tickFormat(function(d, i){
			console.log(d,i);
			return Math.floor(d * (max-min) + min);
		})
		.orient("bottom");

	//console.log(x(0), x(0.5), x(1));

	var svg = d3.select("#"+id).append("svg")
		.attr("width", w + margin*6)
		.attr("height", h + margin*2)
	  .append("g")
		// .attr("height", h - margin*4)
		// .attr("width", w - margin - 50)
		.attr("transform", "translate(" + 4*margin + "," + -0.5*margin + ")");

	var bar = svg.selectAll(".bar1")
		.data(data)
	  .enter().append("g")
		.attr("class", "bar1")
		.attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

	bar.append("rect")
		.attr("x", 1)
		.attr("class", "bar")
		.attr("width", x(data[0].dx) - 1)
		.attr("height", function(d) { return h - y(d.y); });

	bar.append("text")
		.attr("dy", ".75em")
		.attr("y", function(d) {
			console.log( h - y(d.y));
			if ( h - y(d.y) < 20)
				return - 20;
			else
				return 6;
		})
		.attr("x", x(data[0].dx) / 2)
		.attr("text-anchor", "middle")
		.text(function(d) { return formatCount(d.y); });

	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + h + ")")
		.call(xAxis);

}

function calcMeanSdVar(values) {
	// NOTE:
	// For Population Standard Deviation use count to divide
	// For Standard Deviation use count - 1 to divide
	var r = {
		mean: 0,
		variance: 0,
		deviation: 0,
		min: 0,
		max: 0,
	};

	var count = values.length;

	r.min = values[count - 1];

	for (var m, s = 0, l = count; l--;) {
		s += values[l];
		if (r.min > values[l]) r.min = values[l];
		if (r.max < values[l]) r.max = values[l];
	}

	for (m = r.mean = s / count, l = count, s = 0; l--;) {
		s += Math.pow(values[l] - m, 2);
	}

	r.variance = s / count;
	r.deviation = Math.sqrt(r.variance);

	return r;
}

/*function calcMeanSdVar(values) {
	var r = {
		mean: 0,
		variance: 0,
		deviation: 0,
	};

	var count = values.length;

	for(var m, s = 0, l = count; l--; ) {
		s += values[l].response;
	}

	for(m = r.mean = s / count, l = count, s = 0; l--;) {
		s += Math.pow(values[l].response - m, 2)
	}

	r.variance = s / count;
	r.deviation = Math.sqrt(r.variance);

	return r;
}

function calcMeanSdVar1(values) {
	var r = {mean: 0, variance: 0, deviation: 0};
	var t = values.length;

	for(var m, s = 0, l = t; l--; s += parseInt(values[l].response));
	for(m = r.mean = s / t, l = t, s = 0; l--; s += Math.pow(parseInt(values[l].response) - m, 2));
	return r.deviation = Math.sqrt(r.variance = s / t), r;
}*/
