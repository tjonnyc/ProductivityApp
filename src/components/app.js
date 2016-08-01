import React, { Component } from 'react';
import Chart from 'chart.js';

export default class App extends Component {
  	
	constructor(props) {
		super(props);		
	}

	render() {

		function createChart(referencedChart)	{
			
			let timeSegments = [];

			//Retrieves Time Segments Object from Sync
			//console.log("chrome.storage.sync: ", chrome.storage.sync);

				chrome.storage.sync.get("timeSegments", (items) => {
					console.log("Time segments array", items);
				//timeSegments = items["timeSegments"];
				})

			console.log("Time Segments Object: ", timeSegments);


			let websites = timeSegments.reduce(function(prev, curr, index, array) {
				
				let timeElapsed = 0;
				index === 0 ? timeElapsed = 0 : timeElapsed = (curr.dateTime - prev.dateTime);

				if(Object.keys(prev).indexOf(curr.url) === -1) {
					return Object.assign(prev, {url: curr.url, timeElapsed});
				} else {
					return Object.assign(prev, {url: curr.url, timeElapsed: prev[curr.url] + timeElapsed});
				}
			}, {});

			console.log("Synthesized Array of Websites: ", websites);

			var myChart = new Chart(referencedChart, {
		    type: 'pie',
		    data: {
		        labels: ["Facebook", "Netflix", "Gmail", "Google Finance", "Tech Crunch", "Other"],
		        datasets: [{
		            label: 'Avg # of Minutes per Day',
		            data: [35, 61, 10, 5, 5, 25],
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

  	return (
  		<canvas id="myChart" width="400" height="400" ref={createChart} />
  	);
	}
}
