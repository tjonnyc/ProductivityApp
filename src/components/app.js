import React, { Component } from 'react';
import Chart from 'chart.js';
import parseUrl from './parseUrl_helper';
import Website_Table from './website_table.js';
import {Doughnut} from 'react-chartjs-2';

export default class App extends Component {

	constructor(props) {
		super(props);

		this.state = {
			websites: [],
			view: "url",
			categories: [],
			activeNav: {urlView: "active", categoryView: ""},
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

	generateChartData() {		

		let presentation = [];

		if (this.state.view === "url") {
			presentation = this.state.websites.slice(0).sort((a,b) => {return b.timeElapsed - a.timeElapsed;}).slice(0,8);
		} else if (this.state.view === "category") {
			presentation = this.state.categories.slice(0).sort((a,b) => {return b.timeElapsed - a.timeElapsed;}).slice(0,8);
		}
				
		if (presentation.length)
		{			
			return {
				labels: presentation.map((item) => {return item.url}),
				datasets: [{
					label: 'Avg # of Minutes per Day',
					data: presentation.map((item) => {return item.timeElapsed}),
					backgroundColor: [
						'rgba(114, 147, 203, 1)',
						'rgba(225, 151, 76, 1)',
						'rgba(132, 186, 91, 1)',
						'rgba(211, 94, 96, 1)',
						'rgba(128, 133, 133, 1)',
						'rgba(144, 103, 167, 1)',							
						'rgba(171, 104, 87, 1)',
						'rgba(204, 194, 16, 1)'
					]
				}]
			}
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
		var chart;
		if (this.state.websites.length) {
			chart = <Doughnut id="myChart" data={this.generateChartData()} width={400}/>;
		} else {
			chart = "Loading...";
		}

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
				<div className="container-fluid">
					<div className="row">						
						<div className="col-sm-6 col-md-6 col-lg-6">
							{chart}
						</div>
						<Website_Table id="displayedTable" websites={this.state.websites.slice(0).sort((a,b) => {return b.timeElapsed - a.timeElapsed;})} />
					</div>
				</div>
			</div>
		);
	}
}
