import React, { Component } from 'react';
import Chart from 'chart.js';
import parseUrl from './parseUrl_helper';

export default class App extends Component {

	constructor(props) {
		super(props);

		this.createChart = this.createChart.bind(this);
		this.consolidateTimeSegments = this.consolidateTimeSegments.bind(this);
		this.drawChart = this.drawChart.bind(this);
	}

	createChart(referencedChart) {
		//Retrieves Time Segments Object from AWS Server	
	  
	  let rawData = [];
	  var xhttp = new XMLHttpRequest();

	  xhttp.onreadystatechange = function() {
	    if (xhttp.readyState == 4 && xhttp.status == 200) {
				rawData = JSON.parse(xhttp.responseText);
				console.log("Data from server: ", rawData);
	    }
	  };
	  xhttp.open("GET", "/data", false);
	  xhttp.send();
				
   	let websites = this.consolidateTimeSegments(rawData);
		console.log("Consolidated Websites: ", websites);
	
		this.drawChart(referencedChart, websites);
	}

	consolidateTimeSegments(timeSegments) {
		console.log("Time Segments Object: ", timeSegments);

		return timeSegments.reduce(function(prev, curr, index, array) {
			let timeElapsed = 0;
			index === 0 ? timeElapsed = 0 : timeElapsed = (curr.datetime - array[index-1].datetime);

			let existingURLIndex = prev.findIndex((item) => {return item.url === parseUrl(curr.url)});

			if(existingURLIndex === -1) {
				prev.push({url: parseUrl(curr.url), timeElapsed});
			} else {
				prev[existingURLIndex].timeElapsed += timeElapsed;
			}

			return prev;
		}, []);
	}

	drawChart(referencedChart, websites) {

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
