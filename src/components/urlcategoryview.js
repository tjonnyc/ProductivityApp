//import libraries
import React, { Component } from 'react';
import {Doughnut} from 'react-chartjs-2';

//import components
import Website_Table from './website_table.js';

export default class UrlCategoryView extends Component {

	constructor(props) {
		super(props);		
	}

	returnNotExluded(website) {
		return !(website.exclude === "true");
	}

	generatePersonalChartData() {		

		let presentation = [];

		if (this.props.location.pathname === "/") {
			presentation = this.props.main.websites.slice(0).filter(this.returnNotExluded).sort((a,b) => {return b.timeElapsed - a.timeElapsed;}).slice(0,8);
		} else if (this.props.location.pathname === "/category") {
			presentation = this.props.main.categories.slice(0).sort((a,b) => {return b.timeElapsed - a.timeElapsed;}).slice(0,8);
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

	generatePublicChartData() {		

		let presentation = [];

		if (this.props.location.pathname === "/") {
			presentation = this.props.main.publicWebsites.slice(0).filter(this.returnNotExluded).sort((a,b) => {return b.timeElapsed - a.timeElapsed;}).slice(0,8);
		} else if (this.props.location.pathname === "/category") {
			presentation = this.props.main.publicCategories.slice(0).sort((a,b) => {return b.timeElapsed - a.timeElapsed;}).slice(0,8);
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

	render() {
		var personalChart;
		if (this.props.main.websites.length) {
			personalChart = <Doughnut id="myChart" data={this.generatePersonalChartData()} height={400}/>;
		} else {
			personalChart = "Loading...";
		}

		var publicChart;
		if (this.props.main.publicWebsites.length) {
			publicChart = <Doughnut id="myChart" data={this.generatePublicChartData()} height={400}/>;
		} else {
			publicChart = "Loading...";
		}

		return (
			<div>
				<div className="container-fluid">
					<div className="row">						
						<div className="col-sm-6 col-md-6 col-lg-6">
							<div className="row">
								<div className="col-sm-6 col-md-6 col-lg-6">
									<h4>Where you spend time on the internet</h4>
									{personalChart}
								</div>
								<div className="col-sm-6 col-md-6 col-lg-6">
									<h4>Where the average person spends time on the internet</h4>
									{publicChart}
								</div>
							</div>
						</div>
						<div className="col-sm-6 col-md-6 col-lg-6">
							<Website_Table id="displayedTable" updateCategory={this.props.updateCategory} totalNumDays={this.props.main.totalNumDays} totalTime={this.props.main.totalTime} userid={this.props.main.userid} websites={this.props.main.websites.filter(this.returnNotExluded)} />
						</div>
					</div>
				</div>
			</div>
		);
	}
}
