var rtplot = function (id, dataset, height) {
    var margin = 30;
    var w = document.getElementById(id).offsetWidth || 916;
    w = w - 220;
    var h = height || 600 ;// - margin*2; //250;

    var max = d3.max(dataset.data, function(d) { return d.max; });

    var yScale = d3.scale.ordinal()
        //.domain(d3.range(dataset.data.length))
        .domain(dataset.data.map(function(d) { return d.lbl; }))
        .rangeRoundBands([0, h], 0.05);


    var xScale = d3.scale.linear()
        .domain([0, max])
        .range([0, w]);

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("top");

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left");

    //Create SVG element
    var svg = d3.select("#"+id)
        .append("svg")
        .attr("width", w + 170)
        .attr("height", h + margin)
        .append("g")
        .attr("transform", "translate(" + 120 + "," + margin + ")");

    svg.append("g")
      .attr("class", "x axis")
      .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);


    svg.selectAll(".y.axis text")
      .attr("transform", "translate(" + 0 + "," + -18 + ")");

    // Create bars
    svg.selectAll("rect.span")
        .data(dataset.data)
        .enter()
        .append("rect")
        .attr("class", "span")
        .attr("y", function(d, i) {
            //console.log("hahaha",d,i, yScale(d.lbl));
            return yScale(d.lbl)  + (yScale.rangeBand() - 40) / 2;
        })
        .attr("x", function(d) {
            //return h - xScale(d.min);
            return xScale(d.min);
        })
        .attr("height", 40)//yScale.rangeBand())
        .attr("width", function(d) {
            //console.log(d.max, d.min, d.max-d.min)
            return xScale(d.max-d.min);
        })
        /*.attr("fill", function(d) {
            return "rgb(0, 0, " + (d.val/dataset.max * 10) + ")";
            // return "hsv(0, 0, " + (d.val/dataset.max * 10) + ")";
        });*/
        .attr("fill", "#27AE60");

        svg.selectAll("rect.avg")
            .data(dataset.data)
            .enter()
            .append("rect")
            .attr("class", "avg")
            .attr("y", function(d, i) {
                return yScale(d.lbl)  + (yScale.rangeBand() - 60) / 2;
            })
            .attr("x", function(d) {
                //return h - xScale(d.min);
                return xScale(d.avg);
            })
            .attr("height", 60)//yScale.rangeBand())
            .attr("width", function(d) {
                return 5;
            })
            /*.attr("fill", function(d) {
                return "rgb(0, 0, " + (d.val/dataset.max * 10) + ")";
                // return "hsv(0, 0, " + (d.val/dataset.max * 10) + ")";
            });*/
            .attr("fill", "red");

        svg.selectAll("rect.devmin")
            .data(dataset.data)
            .enter()
            .append("rect")
            .attr("class", "devmin")
            .attr("y", function(d, i) {
                return yScale(d.lbl)  + (yScale.rangeBand() - 60) / 2;
            })
            .attr("x", function(d) {
                //return h - xScale(d.min);
                //console.log(d.avg, d.std);
                return xScale(d.avg - d.std);
            })
            .attr("height", 60)//yScale.rangeBand())
            .attr("width", function(d) {
                return 5;
            })
            /*.attr("fill", function(d) {
                return "rgb(0, 0, " + (d.val/dataset.max * 10) + ")";
                // return "hsv(0, 0, " + (d.val/dataset.max * 10) + ")";
            });*/
            .attr("fill", "red");

        svg.selectAll("rect.devmax")
            .data(dataset.data)
            .enter()
            .append("rect")
            .attr("class", "devmax")
            .attr("y", function(d, i) {
                return yScale(d.lbl)  + (yScale.rangeBand() - 60) / 2;
            })
            .attr("x", function(d) {
                //return h - xScale(d.min);
                return xScale(d.avg + d.std);
            })
            .attr("height", 60)//yScale.rangeBand())
            .attr("width", function(d) {
                return 5;
            })
            /*.attr("fill", function(d) {
                return "rgb(0, 0, " + (d.val/dataset.max * 10) + ")";
                // return "hsv(0, 0, " + (d.val/dataset.max * 10) + ")";
            });*/
            .attr("fill", "red");

    // Create min labels
    svg.selectAll("text.min")
        .data(dataset.data)
        .enter()
        .append("text")
        .attr("class", "min")
        .text(function(d) {
            //console.log(d);
            return d.min;
        })
        .attr("text-anchor", "right")
        .attr("y", function(d, i) {
            return yScale(d.lbl) + yScale.rangeBand() / 2 + 3;
        })
        .attr("x", function(d) {
            return xScale(d.min) - this.getComputedTextLength();
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .attr("fill", "black");

        // Create max labels
        svg.selectAll("text.max")
            .data(dataset.data)
            .enter()
            .append("text")
            .attr("class", "max")
            .text(function(d) {
                //console.log(d);
                return d.max;
            })
            .attr("text-anchor", "left")
            .attr("y", function(d, i) {
                return yScale(d.lbl) + yScale.rangeBand() / 2 + 3;
            })
            .attr("x", function(d) {
                return xScale(d.max) + 5;
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("fill", "black");
};
