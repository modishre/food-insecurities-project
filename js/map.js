import us from './states-albers-10m.json' assert {type:'json'};

// setting up constants for map visualization
const FRAME_HEIGHT1 = 610;
const FRAME_WIDTH1 = 975;
const MARGINS1 = {left: 0, right: 0, top: 0, bottom: 0};
const r=3.5;

const VIS_HEIGHT1 = FRAME_HEIGHT1 - MARGINS1.top - MARGINS1.bottom;
const VIS_WIDTH1 = FRAME_WIDTH1 - MARGINS1.left - MARGINS1.right;

//creating path and projection
const path = d3.geoPath();

// setting up frame for the map
const FRAME1 = d3.select('#map')
                .append('svg')
                .attr('height', FRAME_HEIGHT1)
                .attr('width', FRAME_WIDTH1)
                .attr('class', 'mapFrame')
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

// setting up constants for three bottom scatter plots
const FRAME_HEIGHT2 = 500;
const FRAME_WIDTH2 = 450;
const MARGINS2 = {left: 60, right: 60, top: 50, bottom: 50};

const VIS_HEIGHT2 = FRAME_HEIGHT2 - MARGINS2.top - MARGINS2.bottom;
const VIS_WIDTH2 = FRAME_WIDTH2 - MARGINS2.left - MARGINS2.right;

// setting up frames for three scatterplots associated with the map
const PLOT1 = d3.select("#subplot1")
				.append("svg")
				.attr("height", FRAME_HEIGHT2)
				.attr("width", FRAME_WIDTH2)
				.attr("class", "frame")

const PLOT2 = d3.select("#subplot2")
				.append("svg")
				.attr("height", FRAME_HEIGHT2)
				.attr("width", FRAME_WIDTH2)
				.attr("class", "frame")

const PLOT3 = d3.select("#subplot3")
				.append("svg")
				.attr("height", FRAME_HEIGHT2)
				.attr("width", FRAME_WIDTH2)
				.attr("class", "frame")

// read in the data
d3.csv("data/food_desert10.csv").then( function(data) {

	//creating projection and scale for radius based on population
	const projector = d3.geoAlbersUsa().scale(1300).translate([FRAME_WIDTH1/2, FRAME_HEIGHT1/2])
	const rscale = d3.scaleLinear()
		.range([0,0.0008]) //scales down population to be radius

	// plotting counties on map
	const MAP = FRAME1.selectAll('g')
		.data(data)
		.join('g');

	 // tool tip
    const TOOLTIP = d3.select("#row")
        .append ("div")
            .attr("class", "tooltip")
            .style("opacity", 0);


   
    // setting mouseover functions
    let mouseover = function(event, d) {TOOLTIP.text(d); return TOOLTIP.style("opacity", "0.75")};
    let mousemove = function(event, d) {TOOLTIP.html(d.County + '<br>' + d.State + '<br> Population: ' + d.Pop2010 + "<br> Severity (%): " + d.lapop10share)
				.style("left", (event.pageX + 10) + "px")
	            .style("top", (event.pageY - 50) + "px")
	            // adding border to point hovering 
	            const point = d3.select(this)
	            point.attr('stroke', 'black')
	            point.attr('stroke-width', '2px')
	            }
	let mouseout = function(){ // removing border after hoveriing
				const point = d3.select(this)
	            point.attr('stroke', 'none');
				return TOOLTIP.style("opacity", "0") };

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
			.style('fill', function(d) {
				if (d.lapop10share < 20) {return '#73B9EE'}
				else if (d.lapop10share < 40) {return '#5494DA'}
				else if (d.lapop10share < 60) {return '#3373C4'}
				else if (d.lapop10share < 80) {return '#1750AC'}
				else {return '#003396'}
			})
		 // adding tooltip functionality for mouseover, move and leave
        .on('mouseover', mouseover)
			.on("mousemove", mousemove)
			.on("mouseout", mouseout);


	// BELOW IS ALL FOR SCATTER PLOTS
	// set scale for x-axis --> % food insecure on x-axis for all three scatter plots
	const xScale = d3.scaleLinear()
		.domain([0, d3.max(data, (d) => {
			return parseInt(d.lapop10share);}) + 1])
		.range([0, VIS_WIDTH2 + MARGINS2.left - 10]);

	// ALL FOR LEFT GRAPH
	// add x-axis to left graph
	PLOT1.append("g")
		.attr("transform", "translate(" + MARGINS2.left +
			"," + (VIS_HEIGHT2 + MARGINS2.top) + ")")
		.call(d3.axisBottom(xScale));
	// text label for the x-axis
	PLOT1.append("text")
		.attr("transform",
			"translate(" + ((VIS_WIDTH2/2) + 85) + " ," +
						   (VIS_HEIGHT2 + MARGINS2.top + 40) + ")")
		.text("% Population Beyond 10 mi from Supermarket")
		.attr("font-size", "15px")
		.attr("class", "axisLabel")
	;

	// set scale for y-axis for left graph --> population on y-axis
	const yScaleLeft = d3.scaleLinear()
		.domain([0, d3.max(data, (d) => {
			return parseInt(d.Pop2010);
		}) + 1])
		.range([VIS_HEIGHT2, 0])

	// add y-axis on left graph
	PLOT1.append("g")
		.attr('transform', "translate(" + MARGINS2.left +
			"," + (MARGINS2.bottom) + ")")
		.call(d3.axisLeft(yScaleLeft));

	// text label for the y-axis
	PLOT1.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", MARGINS2.left - 60)
		.attr("x", 0 - (VIS_HEIGHT2 / 2) - 55)
		.attr("dy", "1em")
		.text("County Population")
		.attr("font-size", "15px")
		.attr("class", "axisLabel");

	// add points to left scatter plot
	const LEFT = PLOT1.selectAll("circle")
		.data(data)
		.enter()
		.append("circle")
		.attr("cx", (d) => {
			return (xScale(d.lapop10share) + MARGINS2.left);}) // x value --> cx
		.attr("cy", (d) => {
			return (yScaleLeft(d.Pop2010) + MARGINS2.top);}) // y value --> cy
		.attr("r", 3) // point radius
		.attr("class", "point")
		// adding tooltip functionality for mouseover, move and leave
        .on('mouseover', mouseover)
		.on("mousemove", mousemove)
		.on("mouseout", mouseout);

	// ALL FOR MIDDLE GRAPH
	// add x-axis to middle graph
	PLOT2.append("g")
		.attr("transform", "translate(" + MARGINS2.left +
			"," + (VIS_HEIGHT2 + MARGINS2.top) + ")")
		.call(d3.axisBottom(xScale));

	// text label for the x-axis
	PLOT2.append("text")
		.attr("transform",
			"translate(" + ((VIS_WIDTH2/2) + 85) + " ," +
						   (VIS_HEIGHT2 + MARGINS2.top + 40) + ")")
		.text("% Population Beyond 10 mi from Supermarket")
		.attr("font-size", "15px")
		.attr("class", "axisLabel");

	// set scale for y-axis for left graph --> % population with SNAP on y-axis
	const yScaleMiddle = d3.scaleLinear()
		.domain([0, d3.max(data, (d) => {
			return parseInt(d.lasnaphalfshare);
		}) + 1])
		.range([VIS_HEIGHT2, 0])

	// add y-axis on left graph
	PLOT2.append("g")
		.attr('transform', "translate(" + MARGINS2.left +
			"," + (MARGINS2.bottom) + ")")
		.call(d3.axisLeft(yScaleMiddle));

	// text label for the y-axis
	PLOT2.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", MARGINS2.left - 50)
		.attr("x", 0 - (VIS_HEIGHT2 / 2) - 50)
		.attr("dy", "1em")
		.text("% Housing Units Receiving SNAP & Beyond 0.5 mi from Supermarket")
		.attr("font-size", "12px")
		.attr("class", "axisLabel");

	// add points to left scatter plot
	const MIDDLE = PLOT2.selectAll("circle")
		.data(data)
		.enter()
		.append("circle")
		.attr("cx", (d) => {
			return (xScale(d.lapop10share) + MARGINS2.left);}) // x value --> cx
		.attr("cy", (d) => {
			return (yScaleMiddle(d.lasnaphalfshare) + MARGINS2.top);}) // y value --> cy
		.attr("r", 3) // point radius
		.attr("class", "point")
		// adding tooltip functionality for mouseover, move and leave
        .on('mouseover', mouseover)
		.on("mousemove", mousemove)
		.on("mouseout", mouseout);;

	// ALL FOR RIGHT GRAPH
	// add x-axis to right graph
	PLOT3.append("g")
		.attr("transform", "translate(" + MARGINS2.left +
			"," + (VIS_HEIGHT2 + MARGINS2.top) + ")")
		.call(d3.axisBottom(xScale));

	// text label for the x-axis
	PLOT3.append("text")
		.attr("transform",
			"translate(" + ((VIS_WIDTH2/2) + 85) + " ," +
						   (VIS_HEIGHT2 + MARGINS2.top + 40) + ")")
		.text("% Population Beyond 10 mi from Supermarket")
		.attr("font-size", "15px")
		.attr("class", "axisLabel");


	// set scale for y-axis for left graph --> % access to cars on y-axis
	const yScaleRight = d3.scaleLinear()
		.domain([0, d3.max(data, (d) => {
			return parseInt(d.lahunvhalfshare);
		}) + 1])
		.range([VIS_HEIGHT2, 0])

	// add y-axis on left graph
	PLOT3.append("g")
		.attr('transform', "translate(" + MARGINS2.left +
			"," + (MARGINS2.bottom) + ")")
		.call(d3.axisLeft(yScaleRight));

	// text label for the y-axis
	PLOT3.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", MARGINS2.left - 50)
		.attr("x", 0 - (VIS_HEIGHT2 / 2) - 50)
		.attr("dy", "1em")
		.text("% Housing Units Without Vehicles & Beyond 0.5 mi from Supermarket")
		.attr("font-size", "12px")
		.attr("class", "axisLabel");

	// add points to left scatter plot
	const RIGHT = PLOT3.selectAll("circle")
		.data(data)
		.enter()
		.append("circle")
		.attr("cx", (d) => {
			return (xScale(d.lapop10share) + MARGINS2.left);}) // x value --> cx
		.attr("cy", (d) => {
			return (yScaleRight(d.lahunvhalfshare) + MARGINS2.top);}) // y value --> cy
		.attr("r", 3) // point radius
		.attr("class", "point")
		// adding tooltip functionality for mouseover, move and leave
        .on('mouseover', mouseover)
		.on("mousemove", mousemove)
		.on("mouseout", mouseout);

	// ADD BRUSHING
	FRAME1.append("g")
   		 .attr("class", "brush")
		 .call(d3.brush()
			 .on("brush", updateChart));


	// function that is triggered when brush area is updated
	function updateChart(event) {
		const extent = event.selection;
		console.log(extent)
		MAP.classed("selected", function (d) {
			return isBrushed(extent, (MARGINS1.left + projector([d.Long, d.Lat])[0]),
				(MARGINS1.top + projector([d.Long, d.Lat])[1]))
		})
		let dataFilter;
		if (extent === []) {
			MAP.classed('selected', false);
			dataFilter = data;
		} else {
			// Create new data with the selection
			dataFilter = data.filter(function (d) {
				return isBrushed(extent, (MARGINS1.left + projector([d.Long, d.Lat])[0]),
					(MARGINS1.top + projector([d.Long, d.Lat])[1]));
			});

		}
		plotPoints(dataFilter)

	};




	function isBrushed(brush_coords, cx, cy) {
       let x0 = brush_coords[0][0],
           x1 = brush_coords[1][0],
           y0 = brush_coords[0][1],
           y1 = brush_coords[1][1];
      return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;    // This return TRUE or FALSE depending on if the points is in the selected area
  	}

	function plotPoints(dataFilter) {
		console.log(dataFilter)
        // remove all previously existing points
        PLOT1.selectAll('circle').remove();
		PLOT2.selectAll('circle').remove();
		PLOT3.selectAll('circle').remove();

        // plot points
        PLOT1.selectAll('circle')
                .data(dataFilter)
                .enter()
                .append('circle')
                .attr('cx', function (d) {
                    return xScale(d.lapop10share) + MARGINS2.left; })
                .attr('cy', function (d) {
                    return yScaleLeft(d.Pop2010) + MARGINS2.top; })
                .attr('r', r)
                .attr('class', 'point')
                .on('mouseover', mouseover)
		        .on("mousemove", mousemove)
		        .on("mouseout", mouseout);

		PLOT2.selectAll('circle')
                .data(dataFilter)
                .enter()
                .append('circle')
                .attr('cx', function (d) {
                    return xScale(d.lapop10share) + MARGINS2.left; })
                .attr('cy', function (d) {
                    return yScaleMiddle(d.lasnaphalfshare) + MARGINS2.top; })
                .attr('r', r)
                .attr('class', 'point')
                .on('mouseover', mouseover)
		        .on("mousemove", mousemove)
		        .on("mouseout", mouseout);

		PLOT3.selectAll('circle')
                .data(dataFilter)
                .enter()
                .append('circle')
                .attr('cx', function (d) {
                    return xScale(d.lapop10share) + MARGINS2.left; })
                .attr('cy', function (d) {
                    return yScaleRight(d.lahunvhalfshare) + MARGINS2.top; })
                .attr('r', r)
                .attr('class', 'point')
                .on('mouseover', mouseover)
		        .on("mousemove", mousemove)
		        .on("mouseout", mouseout);
};

// function that resets the map/scatters after brushing
function resetBrush() {
	plotPoints(data);
	MAP.classed('selected', false);
}

// add event listener to reset selection button
document.getElementById('reset').addEventListener('click', resetBrush);

});




