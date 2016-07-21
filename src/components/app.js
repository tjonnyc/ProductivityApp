import React, { Component } from 'react';
import Chart from 'chart.js';

export default class App extends Component {
  	
  	render() {

  		function createChart(referencedChart)	{
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
