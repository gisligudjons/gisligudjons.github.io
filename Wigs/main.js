
/*global d3*/

d3.json("WigData.json", function(someData){
  someData.forEach((d) => {
      d.date = d["Decade"];
      d.group = d["Century"];
      d.value = d["Count"];
  });

  var range = d3.max(someData, function(d){return d["Decade"];}) - d3.min(someData, function(d){return d["Decade"];});

  var width = 600,
    height = 500,
    start = 0,
    end = 2.25,
    numSpirals = 2
    margin = {top:50,bottom:50,left:50,right:50};

  var theta = function(r) {
    return numSpirals * Math.PI * r;
  };

  // used to assign nodes color by group
  var color = d3.scaleOrdinal(d3.schemeTableau10);

  var r = d3.min([width, height]) / 2 - 10;

  var radius = d3.scaleLinear()
    .domain([start, end])
    .range([20, r]);
  var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.left + margin.right)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  var points = d3.range(start, end + 0.001, (end - start) / 1000);

 


  var spiral = d3.radialLine()
    .curve(d3.curveCardinal)
    .angle(theta)
    .radius(radius);

  var path = svg.append("path")
    .datum(points)
    .attr("id", "spiral")
    .attr("d", spiral)
    .style("fill", "none")
    .style("stroke", "steelblue");

  var spiralLength = path.node().getTotalLength(),
      barWidth = (spiralLength / range) + 4;

  var timeScale = d3.scaleTime()
    .domain(d3.extent(someData, function(d){
      return d["Decade"];
    }))
    .range([0, spiralLength]);

  
  
  
  // yScale for the bar height
  var yScale = d3.scaleRadial()
    .domain([0, d3.max(someData, function(d){
      return d.value;
    })])
    .range([0, (r / numSpirals) - 30]);


    var tooltip = d3.select("#chart")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)


    var tipMouseover = function(d) {
        

        tooltip
        .html("In the " + d.Decade + "'s there were " + d.Count + " cases of wigs in portraits")
        .style("left", (d3.event.pageX + 15) + "px")
        .style("top", (d3.event.pageY - 28) + "px")
        .transition()
        .duration(200) // ms
        .style("opacity", .9) // started as 0!
        };

        // tooltip mouseout event handler
    var tipMouseout = function(d) {
            tooltip.transition()
                .duration(300) // ms
                .style("opacity", 0); // don't care about position!
            };
    

  svg.selectAll("rect")
    .data(someData)
    .enter()
    .append("rect")
    .on("mouseover", tipMouseover)
    .on("mouseleave", tipMouseout)
    .attr("x", function(d,i){
      
      var linePer = timeScale(d.date),
          posOnLine = path.node().getPointAtLength(linePer),
          angleOnLine = path.node().getPointAtLength(linePer - barWidth);
    
      d.linePer = linePer; // % distance are on the spiral
      d.x = posOnLine.x; // x postion on the spiral
      d.y = posOnLine.y; // y position on the spiral
      
      d.a = (Math.atan2(angleOnLine.y, angleOnLine.x) * 180 / Math.PI) - 90; //angle at the spiral position

      return d.x;
    })
    .attr("y", function(d){
      return d.y;
    })
    .attr("width", function(d){
      return barWidth;
    })
    .attr("height", function(d){
      return yScale(d.value);
    })
    .style("fill", function(d){return color(d.group);})
    .style("stroke", "none")
    .attr("transform", function(d){
      return "rotate(" + d.a + "," + d.x  + "," + d.y + ")"; // rotate the bar
    });
    

  
//   // add date labels
//   var tF = d3.timeFormat("%Y"),
//       firstInMonth = {};
      

// var tooltip = d3.select("#vis-container").append("div")
//       .attr("class", "tooltip")
//       .style("opacity", 0);

// var tipMouseover = function(d) {
//         var color = colorScale(d.manufacturer);
//         var html  = d.cereal + "<br/>" +
//                     "<span style='color:" + color + ";'>" + d.manufacturer + "</span><br/>" +
//                     "<b>" + d.sugar + "</b> sugar, <b/>" + d.calories + "</b> calories";
//         tooltip.html(html)
//                     .style("left", (d3.event.pageX + 15) + "px")
//                     .style("top", (d3.event.pageY - 28) + "px")
//                   .transition()
//                     .duration(200) // ms
//                     .style("opacity", .9) // started as 0!
// };
// var tipMouseout = function(d) {
//         tooltip.transition()
//             .duration(300) // ms
//             .style("opacity", 0); // don't care about position!     
// };     

// // select the svg area
// var SVG = d3.select("#chart")

// // create a list of keys
// var keys = ["17th Century", "18th Century", "19th Century", "20th Century", "21st Century"]

// // Usually you have a color scale in your chart already
// var color1 = d3.scaleOrdinal()
//   .domain(keys)
//   .range(d3.schemeTableau10);

// // Add one dot in the legend for each name.
// var size = 20
// SVG.selectAll("mydots")
//   .data(keys)
//   .enter()
//   .append("rect")
//     .attr("x", 100)
//     .attr("y", function(d,i){ return 100 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
//     .attr("width", size)
//     .attr("height", size)
//     .style("fill", function(d){ return color1(d)})

// // Add one dot in the legend for each name.
// SVG.selectAll("mylabels")
//   .data(keys)
//   .enter()
//   .append("text")
//     .attr("x", 100 + size*1.2)
//     .attr("y", function(d,i){ return 100 + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
//     .style("fill", function(d){ return color1(d)})
//     .text(function(d){ return d})
//     .attr("text-anchor", "left")
//     .style("alignment-baseline", "right")



// var tooltip = d3.select("#chart")
// .append('div')
// .attr('class', 'tooltip');


// tooltip.append('div')
// .attr('class', 'value');
// tooltip.append('div')
// .attr('class', 'date')

// svg.selectAll("rect")
// .on('mouseover', function(d) {

//     tooltip.select('.value').html("Wigs: <b>" + Math.round(d.value*100)/100 + "<b>");
//     tooltip.select('.date').html("Decade: <b>" + d.Decade + "'s");


//     d3.select(this)
//     .style("fill","#FFFFFF")
//     .style("stroke","#000000")
//     .style("stroke-width","2px");

//     tooltip.style('display', 'block');
//     tooltip.style('opacity', 1);

// })
// .on('mousemove', function(d) {
//     tooltip.style('top', (d3.event.layerY + 100) + 'px')
//     .style('left', (d3.event.layerX + 550) + 'px');
// })
// .on('mouseout', function(d) {
//     d3.selectAll("rect")
//     .style("fill", function(d){return color(d.group);})
//     .style("stroke", "none")

//     tooltip.style('display', 'none');
//     tooltip.style('opacity',0);
// });










});