var prplot = function (id, dataset) {
var margin = 20;
var w = document.getElementById(id).offsetWidth || 916;
w = w - margin*3;
var h = 180; //250;

var xScale = d3.scale.ordinal()
    .domain(d3.range(dataset.data.length))
    .rangeRoundBands([0, w], 0.05);

var yScale = d3.scale.linear()
    .domain([0, dataset.max])
    .range([0, h]);

d3.select("#svg-" + id).remove();

//Create SVG element
var svg = d3.select("#"+id)
    .append("svg")
    .attr("id", "svg-" + id)
    .attr("width", w)
    .attr("height", h);

// Create bars
svg.selectAll("rect.bar")
    .data(dataset.data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", function(d, i) {
        return xScale(i)  + (xScale.rangeBand() - 60) / 2;
    })
    .attr("y", function(d) {
        //console.log("sdjkfsdk", d.val);
        return h - yScale(d.val);
    })
    .attr("width", 60)//xScale.rangeBand())
    .attr("height", function(d) {
        return yScale(d.val);
    })
    /*.attr("fill", function(d) {
        return "rgb(0, 0, " + (d.val/dataset.max * 10) + ")";
        // return "hsv(0, 0, " + (d.val/dataset.max * 10) + ")";
    });*/
    .attr("fill", "#27AE60");

// Create value labels
svg.selectAll("text.value")
    .data(dataset.data)
    .enter()
    .append("text")
    .attr("class", "value")
    .text(function(d) {
        //console.log(d);
        return d.val;
    })
    .attr("text-anchor", "middle")
    .attr("x", function(d, i) {
        return xScale(i) + xScale.rangeBand() / 2;
    })
    .attr("y", function(d) {
        console.log(d.lbl, yScale(d.val))
        return yScale(d.val) < 30 ? h - yScale(d.val) - 5 : h - yScale(d.val) + 14;
    })
    .attr("font-family", "sans-serif")
    .attr("font-size", "11px")
    .attr("fill", function(d) {
        return yScale(d.val) < 30 ? "black" : "white";
    });

// Create machine labels
svg.selectAll("text.title")
    .data(dataset.data)
    .enter()
    .append("text")
    .attr("class", "title")
    .text(function(d) {
        //console.log(d);
        return d.lbl;
    })
    .attr("text-anchor", "middle")
    .attr("x", function(d, i) {
        return xScale(i) + xScale.rangeBand() / 2;
    })
    .attr("y", function(d) {
        // return h - yScale(d.val) + 14;
        //return h - 4;
        return 10;
    })
    .attr("font-family", "sans-serif")
    .attr("font-size", "11px")
    .attr("color", "#eee");
}
