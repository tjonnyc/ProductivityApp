import React, { Component } from 'react';
import Chart from 'chart.js';

export default class App extends Component {

	constructor(props) {
		super(props);

		this.createChart = this.createChart.bind(this);
		this.consolidateTimeSegments = this.consolidateTimeSegments.bind(this);
		this.drawChart = this.drawChart.bind(this);
	}

	createChart(referencedChart) {
		//Retrieves Time Segments Object from Sync			
		chrome.storage.sync.get("timeSegments",(items) => {				
			let websites = this.consolidateTimeSegments(items["timeSegments"]);
			console.log("Consolidated Websites: ", websites);
			
			this.drawChart(referencedChart, websites);
		});
	}		

	consolidateTimeSegments(timeSegments) {
		console.log("Time Segments Object: ", timeSegments);

		return timeSegments.reduce(function(prev, curr, index, array) {				
			let timeElapsed = 0;
			index === 0 ? timeElapsed = 0 : timeElapsed = (curr.dateTime - array[index-1].dateTime);

			let existingURLIndex = prev.findIndex((item) => {return item.url === curr.url});

			if(existingURLIndex === -1) {
				prev.push({url: curr.url, timeElapsed});
			} else {
				prev[existingURLIndex].timeElapsed += timeElapsed;
			}

			return prev;
		}, []);
	}

	drawChart(referencedChart, websites)	{

		console.log("Synthesized Array of Websites: ", websites);

		var myChart = new Chart(referencedChart, {
	    type: 'pie',
	    data: {
	        labels: websites.map((item) => {return item.url}),
	        datasets: [{
	            label: 'Avg # of Minutes per Day',
	            data: websites.map((item) => {return item.timeElapsed}),
	            backgroundColor: [
	                'rgba(255, 99, 132, 0.2)',
	                'rgba(54, 162, 235, 0.2)',
	                'rgba(255, 206, 86, 0.2)',
	                'rgba(75, 192, 192, 0.2)',
	                'rgba(153, 102, 255, 0.2)',
	                'rgba(255, 159, 64, 0.2)'
	            ]
	        }]
	    },
	    options: {
	    	
	    }
		});
	}	

	render() {
  	return (
  		<canvas id="myChart" width="400" height="400" ref={this.createChart} />
  	);
	}
}
