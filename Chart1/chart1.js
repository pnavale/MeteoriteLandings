
var width = "750",
    height = "800",
    active = d3.select(null);

var svg1 = d3.select( "#Map" )
  .append( "svg" )
  .attr( "width", width )
  .attr( "height", height )
  .on("click", stopped, true);

svg1.append("rect")
    .attr("class", "background")
    .attr("height", height)
    .on("click", reset);

var countries = svg1.append( "g" ).attr( "class", "countries" );

var projection = d3.geoMercator()
  .scale( 100 )
  .rotate( [0,0] )
  .center( [10, 10] )
  .translate( [width/2,height/2] );

var zoom = d3.zoom()
              .scaleExtent([1,8])
              .on("zoom",zoomed);  

var geoPath = d3.geoPath()
    .projection( projection )
    .pointRadius(1.7);

var color = d3.scaleThreshold()
    .domain([1000000, 10000000, 50000000, 100000000, 1000000000])
    .range(["#f7f7f7", "#d9d9d9", "#bdbdbd", "#969696", "#636363", "#252525"]);
    // .range(["#f2f0f7", "#dadaeb", "#bcbddc", "#9e9ac8", "#756bb1", "#54278f"]);

var rateByPop = {};

world_json.features.forEach(function(d) {
  rateByPop[d.id] = +[d.properties.POP2005];
});
//console.log(rateByPop);

countries.selectAll( "path" )
  .data( world_json.features )
  .enter()
  .append( "path" )
  .attr( "d", geoPath )
  .attr("class", "feature")
  .style("fill", function(d){
    return color(rateByPop[d.id])
  })
  .on("click", clicked);
//console.log(world_json.features);

function clicked(d) {
  if (active.node() === this) return reset();
  active.classed("active", false);
  active = d3.select(this).classed("active", true);

  var bounds = geoPath.bounds(d),
      dx = bounds[1][0] - bounds[0][0],
      dy = bounds[1][1] - bounds[0][1],
      x = (bounds[0][0] + bounds[1][0]) / 2,
      y = (bounds[0][1] + bounds[1][1]) / 2,
      scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
      translate = [width / 2 - scale * x, height / 2 - scale * y];

  svg1.transition()
      .duration(50)
      .call( zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale) );

}

function reset() {
  active.classed("active", false);
  active = d3.select(null);

  svg1.transition()
      .duration(750)
      .call( zoom.transform, d3.zoomIdentity );
}

function zoomed() {
  countries.style("stroke-width", 1.5 / d3.event.transform.k + "px");
  met.style("stroke-width", 1.5 / d3.event.transform.k + "px");

  countries.attr("transform", d3.event.transform);
  met.attr("transform", d3.event.transform);
}

// If the drag behavior prevents the default click,
// also stop propagation so we don’t click-to-zoom.
function stopped() {
  if (d3.event.defaultPrevented) d3.event.stopPropagation();
}

var met = svg1.append( "g" ).attr("id", "mets").attr( "class", "met" );

met.selectAll( "path" )
  .data( met3_json.features )
  .enter()
  .append( "path" )
  .attr( "d", geoPath )
  .style("fill", function(d){
  	if([d.properties.fall]== "Fell"){
  		return "#f03b20";
  	}	else{
  		return "#feb24c";
  	}
  } )
  .style("fill-opacity", .5)
  .on("mouseover", function(d){
    d3.select("#name").text(d.properties.name);
    d3.select("#id").text(d.properties.id);
    d3.select("#nametype").text(d.properties.nametype);
    d3.select("#class").text(d.properties.recclass);
    d3.select("#mass").text(d.properties.mass);
    d3.select("#fall").text(d.properties.fall);
    d3.select("#year").text(d.properties.year);
  });
  // .on("mouseout", function(d){
  //   d3.select("").text("");
  // })
  // .on( "click", function(){
  //   d3.select(this).remove();
  // });

  svg1.append("text")
  	.attr("x", 50)
  	.attr("y", 10)
  	.style("fill", "#A9A9A9")
  	.style("stroke", "#000000")
  	.on("click", function(){
  		var active = mets.active ? false : true,
  		newOpacity = active ? 0 : 1;
  		d3.select("#mets").style("opacity", newOpacity);
  		mets.active = active;
  	})
  	.text("Show/hide meteorites");

//---------Legend--------------
var legend = svg1.selectAll('g.legendEntry')
    .data(color.range().reverse())
    .enter()
    .append('g')
    .attr('class', 'legendEntry');

legend
    .append('rect')
    .attr("x", width-680)
    .attr("y", function(d, i) {
       return (1+i) * 20;
    })
   .attr("width", 10)
   .attr("height", 10)
   .style("stroke", "black")
   .style("stroke-width", 1)
   .style("fill", function(d){return d;}); 
    //the data objects are the fill colors

legend
    .append('text')
    .attr("x", width - 665) //leave 5 pixel space after the <rect>
    .attr("y", function(d, i) {
       return (1+i) * 20;
    })
    .attr("dy", "0.8em") //place text one line *below* the x,y point
    .text(function(d,i) {
        var extent = color.invertExtent(d);
        //extent will be a two-element array, format it however you want:
        var format = d3.format("0.2f");
        return format(+extent[0]) + " - " + format(+extent[1]);
    }); 
//-----------Legend End------------ 

  
