//Import Libraries
import React, { Component } from 'react';

//Import Components
import Website_Row from './website_row.js';

export default class Website_Table extends Component {

	constructor(props) {
		super(props);
	}	

	render() {
		let props = this.props;

		const Rows = this.props.websites.slice(0).sort((a,b) => {return b.timeElapsed - a.timeElapsed;}).map(function(website, index) {
			return <Website_Row key={index} index={index} website={website} updateCategory={props.updateCategory} totalTime={props.totalTime} totalNumDays={props.totalNumDays} userid={props.userid} />;
		});

		return (
			<section id="tableView" className="col-sm-6 col-md-6 col-lg-6">
					<table className="table table-striped">
					    <thead>
						    <tr>
						      <th>Website</th>
						      <th>% of Time Spent</th>
						      <th>Min Per Day</th>
						      <th>Category</th>
						    </tr>
						  </thead>
						  <tbody>
						    {Rows}
						  </tbody>
						</table>
			</section>
		);
	}
}
