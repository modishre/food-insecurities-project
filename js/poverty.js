// constants
const FRAME_HEIGHT = 500;
const FRAME_WIDTH = 450;
const MARGINS = {left: 60, right: 60, top: 50, bottom: 50};
const VIS_HEIGHT = FRAME_HEIGHT - MARGINS.top - MARGINS.bottom;
const VIS_WIDTH = FRAME_WIDTH - MARGINS.left - MARGINS.right;
const r=3.5;
let xScale;
let yScale;


// create a frame
let SCATTER = d3.select('#scatter')
                .append('svg')
                .attr('height', FRAME_HEIGHT)
                .attr('width', FRAME_WIDTH)
                .attr('class', 'frame')
                .style('margin', 'auto');

d3.csv('data/food_desert10.csv').then( function(data) {
    // establish scale for x-axis - lapop10share
    xScale = d3.scaleLinear()
                .domain([0, d3.max(data, (d) => {
                        return parseInt(d.lapop10share);
                    }) + 1])
                .range([0, VIS_WIDTH + MARGINS.left - 15]);
    
    // append x axis
    SCATTER.append('g')
            .attr('transform', 'translate(' + MARGINS.left +
            ',' + (VIS_HEIGHT + MARGINS.top) + ')')
            .call(d3.axisBottom(xScale));
    
    // text label for the x-axis
    SCATTER.append('text')
            .attr('transform',
            'translate(' + ((VIS_WIDTH/2) + 85) + ' ,' +
            (VIS_HEIGHT + MARGINS.top + 40) + ')')
            .text('% Population Beyond 10 mi from Supermarket')
            .attr('font-size', '15px')
            .attr('class', 'axisLabel');
    
    // establish scale for y-axis - poverty rate
    yScale = d3.scaleLinear()
                .domain([0, d3.max(data, (d) => {
                    return parseInt(d.PovertyRate);
                }) + 1])
                .range([VIS_HEIGHT, 0]);
    
    // append y axis
    SCATTER.append('g')
            .attr('transform', 'translate(' + MARGINS.left +
            ',' + (MARGINS.top) + ')')
            .call(d3.axisLeft(yScale));
    
    // text label for the y-axis
    SCATTER.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', MARGINS.left - 60)
            .attr('x', 0 - (VIS_HEIGHT / 2) - 55)
            .attr('dy', '1em')
            .text('Poverty Rate')
            .attr('font-size', '15px')
            .attr('class', 'axisLabel')
			// filling based on percent of pop that is far from supermarket
			.style('fill', function(d) {
				if (d.lapop10share < 20) {return '#73B9EE'}
				else if (d.lapop10share < 40) {return '#5494DA'}
				else if (d.lapop10share < 60) {return '#3373C4'}
				else if (d.lapop10share < 80) {return '#1750AC'}
				else {return '#003396'}
			})
})

function plotPoints() {

    // go through the data in the csv file
    d3.csv('data/food_desert10.csv').then( function (data) {

        // get value from the filter form
        let filter = document.getElementById('stateFilter').value;

        // Create new data with the selection
        let dataFilter = data.filter( function (d) {
            return (filter == 'all') ||
                   (filter == d.State);
        });

        // remove all previously existing points
        SCATTER.selectAll('circle').remove();

        // tool tip
        const TOOLTIP = d3.select("#scatter")
        .append ("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        // setting mouseover functions
        let mouseover = function(event, d) {TOOLTIP.text(d); return TOOLTIP.style("opacity", "0.75")};
        let mousemove = function(event, d) {TOOLTIP.html(d.County + ", " + d.State + "<br> Population: " + d.Pop2010 + "<br> Poverty Rate (%): " + d.PovertyRate)
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

        // plot points
        SCATTER.selectAll('circle')
                .data(dataFilter)
                .enter()
                .append('circle')
                .attr('cx', function (d) {
                    return xScale(d.lapop10share) + MARGINS.left; })
                .attr('cy', function (d) {
                    return yScale(d.PovertyRate) + MARGINS.top; })
                .attr('r', r)
                .attr('class', 'point')
                .attr('id', function (d) {
                    return d.County; })
                // filling based on percent of pop receiving SNAP benefits
                .style('fill', function (d) {
                if (d.lasnaphalfshare < 10) {
                    return '#73B9EE'
                } else if (d.lasnaphalfshare < 20) {
                    return '#5494DA'
                } else if (d.lasnaphalfshare < 30) {
                    return '#3373C4'
                } else if (d.lasnaphalfshare < 40) {
                    return '#1750AC'
                } else {
                    return '#003396'
                }
                })
                // adding tooltip functionality for mouseover, move and leave
                .on('mouseover', mouseover)
                .on("mousemove", mousemove)
                .on("mouseout", mouseout);

        });
}

plotPoints();

// assign an event handler to the form submit button
document.getElementById("submitFilter").addEventListener("click", plotPoints);