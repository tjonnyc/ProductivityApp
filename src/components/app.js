import React, { Component } from 'react';
import Chart from 'chart.js';
import parseUrl from './parseUrl_helper';
import Website_Table from './website_table.js';

export default class App extends Component {

	constructor(props) {
		super(props);

		this.state = {
			websites: [],
			view: "url",
			categories: [],
			activeNav: {urlView: "active", categoryView: ""}
		}

		this.pullData();
	}

	//Pulls the users data from the AWS Server and loads the websites array in state
	pullData() {
		let rawData = [];
	  let consolidateTimeSegments = this.consolidateTimeSegments.bind(this);
	  let consolidateCategories = this.consolidateCategories.bind(this);
	  let setState = this.setState.bind(this);

	  var xhttp = new XMLHttpRequest();
	  xhttp.onreadystatechange = function() {
	    if (xhttp.readyState == 4 && xhttp.status == 200) {
				rawData = JSON.parse(xhttp.responseText);
	  		let websites = consolidateTimeSegments(rawData);
				let categories = consolidateCategories(websites);
				setState({websites, categories});				
	    }
	  };
	  xhttp.open("GET", "/data", true);
	  xhttp.send();
	}	

	consolidateCategories(websites) {
		return	websites.reduce(function(prev, curr, index, array) {
			let existingCategoryIndex = prev.findIndex((item) => {return item.category === curr.category});

			if(existingCategoryIndex === -1) {
				prev.push({url: curr.category, timeElapsed: curr.timeElapsed, category: curr.category});
			} else {
				prev[existingCategoryIndex].timeElapsed += curr.timeElapsed;
			}

			return prev;

		}, []);
	}

	consolidateTimeSegments(timeSegments) {
		console.log("Time Segments Object: ", timeSegments);

		return timeSegments.reduce(function(prev, curr, index, array) {
			if (curr.url !== "IDLE") {
				let timeElapsed = 0;
				if (index !== 0 && index !== array.length-1) {
					timeElapsed = (array[index+1].datetime - curr.datetime);
				}

				let existingURLIndex = prev.findIndex((item) => {return item.url === curr.url});

				if(existingURLIndex === -1) {
					prev.push({url: curr.url, timeElapsed, category: curr.category});
				} else {
					prev[existingURLIndex].timeElapsed += timeElapsed;
				}
			}
			
			return prev;
		}, []);
	}

	drawChart(referencedChart) {

		let presentation = [];

		if (this.state.view === "url") {
			presentation = this.state.websites;
		} else if (this.state.view === "category") {
			presentation = this.state.categories;
		}

		console.log("Synthesized Array of Websites: ", presentation);
				
		if (presentation.length && referencedChart)
		{					
			var myChart = new Chart(referencedChart, {
				type: 'pie',
				data: {
					labels: presentation.slice(0,6).map((item) => {return item.url}),
					datasets: [{
						label: 'Avg # of Minutes per Day',
						data: presentation.slice(0,6).map((item) => {return item.timeElapsed}),
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
	}		

	changeView(event) {
		if (event.target.text === "URL View") {
			this.setState({view: "url", activeNav: {urlView: "active", categoryView: ""}});
		} else if (event.target.text === "Category View") {
			this.setState({view: "category", activeNav: {urlView: "", categoryView: "active"}});
		}
	}

	render() {
		return (
			<div>
				<nav className="navbar navbar-default">
				  <div className="container">
				    <div className="navbar-header">
				    	<a href="#" className="navbar-brand">Productivity App</a>
				    </div>
				    <ul className="nav navbar-nav">
				    	<li className={this.state.activeNav.urlView}><a href="#" onClick={this.changeView.bind(this)}>URL View</a></li>
				    	<li className={this.state.activeNav.categoryView}><a href="#" onClick={this.changeView.bind(this)}>Category View</a></li>
				    </ul>
				  </div>
				</nav>
				<canvas id="myChart" width="400" height="400" ref={this.drawChart.bind(this)} />
				<Website_Table websites={this.state.websites} />
			</div>
		);
	}
}
