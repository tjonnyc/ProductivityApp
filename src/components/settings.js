//import libraries
import React, { Component } from 'react';

//import components
import Website_Table from './website_table.js';

export default class Settings extends Component {

	constructor(props) {
		super(props);
	}	

	returnNotExluded(website) {
		return !(website.exclude === "true");
	}

	returnExluded(website) {
		return website.exclude === "true";
	}

	render() {

		return (			
			<div className="row">
				<div className="row">						
					
					<div className="col-lg-12">
						Normal Settings
					</div>

				</div>

				<div className="row">

					<div className="col-lg-6">
						<h3>Exclude Items?</h3>
						<Website_Table id="displayedTable" totalNumDays={this.props.main.totalNumDays} totalTime={this.props.main.totalTime} userid={this.props.main.userid} websites={this.props.main.websites.filter(this.returnNotExluded)} excludeURL={this.props.excludeURL} removeURL={this.props.removeURL} type={"Exclude"} />
					</div>

					<div className="col-lg-6">
						<h3>Excluded Items: Permanently Remove Items?</h3>
						<Website_Table id="displayedTable" updateCategory={this.props.updateCategory} totalNumDays={this.props.main.totalNumDays} totalTime={this.props.main.totalTime} userid={this.props.main.userid} websites={this.props.main.websites.filter(this.returnExluded)} excludeURL={this.props.excludeURL} removeURL={this.props.removeURL} type={"Remove"} />
					</div>

				</div>
			</div>
		);
	}
}
