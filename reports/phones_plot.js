var phonesplot = function (a_id, b_id, a_dataset, b_dataset, total) {
    var margin = 5//10;//30;
    var w = document.getElementById(a_id).offsetWidth - margin*5;//500; //520;
    var h = 400 ;// - margin*2; //250;

    var dim = 5//28;

    var columns = 39;//10;

    d3.select("#svg-a").remove();
    d3.select("#svg-b").remove();

    //Create SVG element
    var svg = d3.select("#"+a_id)
        .append("svg")
        .attr("width", w + margin*4)
        .attr("height", h + margin)
        .attr("id", "svg-a")
        .append("g")
        .attr("transform", "translate(" + margin + "," + margin + ")");

    // Create bars
    svg.selectAll("rect.a")
        .data(d3.values(a_dataset))
        .enter()
        .append("rect")
        .attr("class", "a")
        .attr("y", function(d, i) {
            // console.log("y:", Math.floor(i/columns)*(40 + margin))
            return Math.floor(i/columns)*(dim + margin);
        })
        .attr("x", function(d, i) {
            // console.log("x:", (i%columns)*(40 + margin))
            return (i%columns)*(dim + margin);
        })
        .attr("height", dim)
        .attr("width", dim)
        .attr("fill", function(d) {
            if (d.state === 'pending')
                return "gray";
            else if (d.state === 'created')
                return "black";
            else if (d.state === 'connected')
                return "red";
            if (d.state === 'registered')
                return "green";
            else if (d.state === 'oncall')
                return "blue";
        });

    //Create SVG element
    var svg = d3.select("#"+b_id)
        .append("svg")
        .attr("width", w + margin*4)
        .attr("height", h + margin)
        .attr("id", "svg-b")
        .append("g")
        .attr("transform", "translate(" + margin + "," + margin + ")");

    // Create bars
    svg.selectAll("rect.b")
        .data(d3.values(b_dataset))
        .enter()
        .append("rect")
        .attr("class", "b")
        .attr("y", function(d, i) {
            // console.log("y:", Math.floor(i/columns)*(40 + margin))
            return Math.floor(i/columns)*(dim + margin);
        })
        .attr("x", function(d, i) {
            // console.log("x:", (i%columns)*(40 + margin))
            return (i%columns)*(dim + margin);
        })
        .attr("height", dim)
        .attr("width", dim)
        .attr("fill", function(d) {
            if (d.state === 'pending')
                return "gray";
            else if (d.state === 'created')
                return "black";
            else if (d.state === 'connected')
                return "red";
            if (d.state === 'registered')
                return "green";
            else if (d.state === 'oncall')
                return "blue";
        });
}
