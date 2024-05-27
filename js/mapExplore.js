import us from './states-albers-10m.json' assert {type:'json'};

// setting up constants for map visualization
const FRAME_HEIGHT1 = 610;
const FRAME_WIDTH1 = 975;
const MARGINS1 = {left: 0, right: 0, top: 0, bottom: 0};

const VIS_HEIGHT1 = FRAME_HEIGHT1 - MARGINS1.top - MARGINS1.bottom;
const VIS_WIDTH1 = FRAME_WIDTH1 - MARGINS1.left - MARGINS1.right;

//creating path and projection
const path = d3.geoPath();
const projection = d3.geoAlbersUsa().scale(1300).translate([FRAME_WIDTH1 /2 , FRAME_HEIGHT1/2])

// setting up frame for the map
const FRAME1 = d3.select('#map')
                .append('svg')
                .attr('height', FRAME_HEIGHT1)
                .attr('width', FRAME_WIDTH1)
                .attr('class', 'frame')
                .append('g')
                .attr('transform', "translate(" + MARGINS1.left + "," + (MARGINS1.bottom) + ")")

// drawing shape of US
const stateBackground = FRAME1.append('path')
	.attr('fill', '#ddd')
	.attr('d', path(topojson.feature(us, us.objects.nation)));
// drawing borders of states
const stateBorders = FRAME1.append('path')
	.attr('fill', 'none')
	.attr('stroke', '#fff')
	.attr('stroke-linejoin', 'round')
	.attr('stroke-linecap', 'round')
	.attr('d', path(topojson.mesh(us, us.objects.states, (a, b) => a !== b)));


// read in the data
d3.csv("data/food_desert10.csv").then( function(data) {

	// console log to check if reading data correctly
	data.forEach(function (d) {
		console.log(d)
	})

	//creating projection and scale for radius based on population
	const projector = d3.geoAlbersUsa().scale(1300).translate([FRAME_WIDTH1 / 2, FRAME_HEIGHT1 / 2])
	const rscale = d3.scaleLinear()
		.range([0, 0.0008]) //scales down population to be radius

	// plotting counties on map
	const MAP = FRAME1.selectAll('g')
		.data(data)
		.join('g');

	// tool tip
	const TOOLTIP = d3.select("#map")
		.append("div")
		.attr("class", "tooltip")
		.style("opacity", 0);

	// setting mouseover functions
    let mouseover = function(event, d) {TOOLTIP.text(d); return TOOLTIP.style("opacity", "0.75")};
    let mousemove = function(event, d) {TOOLTIP.html(d.County + ', ' + d.State + '<br> Population: ' + d.Pop2010 + "<br> Severity: " + d.lapop10share)
				.style("left", (event.pageX + 10) + "px")
	            .style("top", (event.pageY - 50) + "px")
	            // adding border to point hovering
	            const point = d3.select(this)
	            point.attr('stroke', 'black')
	            point.attr('stroke-width', '2px')}
	let mouseout = function(){
	            const point = d3.select(this)
	            point.attr('stroke', 'none');
	            return TOOLTIP.style("opacity", "0")};


	MAP.append('g')
		// using projection to transform points
		.attr('transform', ({Long, Lat}) => `translate(${projector([Long, Lat]).join(",")})`)
		.append('circle')
		.attr('r', (d) => {
			return rscale(d.Pop2010);
		})
		.attr('class', 'mapPoint')
		.style('opacity', 0.5)
		// filling based on percent of pop that is far from supermarket
		.style('fill', function (d) {
			if (d.lapop10share < 20) {
				return '#73B9EE'
			} else if (d.lapop10share < 40) {
				return '#5494DA'
			} else if (d.lapop10share < 60) {
				return '#3373C4'
			} else if (d.lapop10share < 80) {
				return '#1750AC'
			} else {
				return '#003396'
			}
		})
		// adding tooltip functionality for mouseover, move and leave
        .on('mouseover', mouseover)
		.on("mousemove", mousemove)
		.on("mouseout", mouseout);

	let zoom = d3.zoom()
		.scaleExtent([0.25, 10])
		.translateExtent([[0, 0], [VIS_WIDTH1, VIS_HEIGHT1]])
		.on('zoom', handleZoom);



	function handleZoom(e) {
		d3.select('svg g')
			.attr('transform', e.transform);
	}

	function initZoom() {
		d3.select('svg')
			.call(zoom);
	}


	initZoom();
});