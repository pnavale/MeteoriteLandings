var svg = d3.select("#Linechart"),
    margin = {top: 50, right: 280, bottom: 110, left: 50},
    margin2 = {top: 430, right: 280, bottom: 30, left: 50},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    height2 = +svg.attr("height") - margin2.top - margin2.bottom;

var parsedate = d3.timeFormat("%Y");
    
var x = d3.scaleLinear().range([0, width]),
    x2 = d3.scaleLinear().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    y2 = d3.scaleLinear().range([height2, 0]);

var xAxis = d3.axisBottom(x),
    xAxis2 = d3.axisBottom(x2),
    yAxis = d3.axisLeft(y);
// alert('1::');
var brush = d3.brushX()
    .extent([[0, 0], [width, height2]])
    .on("brush end", brushed);

var zoom1 = d3.zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([[0, 0], [width, height]])
    .extent([[0, 0], [width, height]])
    .on("zoom", zoomed);
// alert('2::');
    var line = d3.line()
        .x(function (d) { return x(d.date); })
        .y(function (d) { return y(d.count); });

    var line2 = d3.line()
        .x(function (d) { return x2(d.date); })
        .y(function (d) { return y2(d.count); });

    var clip = svg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", width)
        .attr("height", height)
        .attr("x", 0)
        .attr("y", 0); 
// alert('3::');

    var Line_chart = svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("clip-path", "url(#clip)");


    var focus = svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var context = svg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");
// alert('4::');
d3.csv("Chart2/totalmetcount_linechart.csv", type, function (error, data) {
  if (error) throw error;
// alert('after4::');
  x.domain(d3.extent(data, function(d) { return d.date; }));
  y.domain([0, d3.max(data, function (d) { return d.count; })]);
  x2.domain(x.domain());
  y2.domain(y.domain());


    focus.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    focus.append("g")
        .attr("class", "axis axis--y")
        .call(yAxis);

    Line_chart.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);
// alert('5::');
    context.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line2);


  context.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height2 + ")")
      .call(xAxis2);

  context.append("g")
      .attr("class", "brush")
      .call(brush)
      .call(brush.move, x.range());

  svg.append("rect")
      .attr("class", "zoom")
      .attr("width", width)
      .attr("height", height)
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .call(zoom1);
// alert('6::');
  // text label for the x axis
  svg.append("text")             
      .attr("transform",
            "translate(" + (width/1.7) + " ," + 
                           (height + margin.top + 30) + ")")
      .style("text-anchor", "middle")
      .text("Year");

    // text label for the y axis
  svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 1.4))
      .attr("dy", "4em")
      .style("text-anchor", "middle")
      .text("Count");  
    
    // text label for the title
    svg.append("text")
    .attr("x", (width / 2))             
        .attr("y", 40- (margin.top / 10))
        .attr("text-anchor", "middle")  
        .style("font-size", "20px") 
        .style("text-decoration", "underline")  
        .text("Meteorite Count Over the Years");
});
// alert('7::');
function brushed() {
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
  var s = d3.event.selection || x2.range();
  x.domain(s.map(x2.invert, x2));
  Line_chart.select(".line").attr("d", line);
  focus.select(".axis--x").call(xAxis);
  svg.select(".zoom").call(zoom1.transform, d3.zoomIdentity
      .scale(width / (s[1] - s[0]))
      .translate(-s[0], 0));
}

function zoomed() {
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
  var t = d3.event.transform;
  x.domain(t.rescaleX(x2).domain());
  Line_chart.select(".line").attr("d", line);
  focus.select(".axis--x").call(xAxis);
  context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
}

function type(d) {
//  d.date = parsedate(d.date);
//  d.count = +d.count;
    d.date = +d.date;
  d.count = +d.count;
  return d;
}