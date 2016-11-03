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
			return <Website_Row key={index} index={index} website={website} updateCategory={props.updateCategory} totalTime={props.totalTime} totalNumDays={props.totalNumDays} userid={props.userid} type={props.type} excludeURL={props.excludeURL} removeURL={props.removeURL} />;
		});

		let header;
		if (this.props.type === "Exclude") {
			header = (
				<tr>
					<th>Website</th>
		      <th>% of Time Spent</th>
		      <th>Min Per Day</th>
		      <th>Category</th>
					<th>Exclude</th>
				</tr>
			)
		} else if (this.props.type === "Remove") {
			header = (
				<tr>
					<th>Website</th>
		      <th>% of Time Spent</th>
		      <th>Min Per Day</th>
		      <th>Category</th>
					<th>Include</th>
					<th>Permanently Remove</th>
				</tr>
			)

		} else {
			header = (
				<tr>
					<th>Website</th>
		      <th>% of Time Spent</th>
		      <th>Min Per Day</th>
		      <th>Category</th>
	      </tr>
			)
		}

		return (
			<section id="tableView" className="col-sm-6 col-md-6 col-lg-6">
					<table className="table table-striped">
					    <thead>						    
					      {header}						    
						  </thead>
						  <tbody>
						    {Rows}
						  </tbody>
						</table>
			</section>
		);
	}
}
