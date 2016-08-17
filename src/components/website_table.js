import React, { Component } from 'react';
import Website_Row from './website_row.js';

export default class Website_Table extends Component {

	constructor(props) {
		super(props);
	}

	render() {
		const Rows = this.props.websites.map(function(website, index) {
			return <Website_Row key={index} index={index} website={website} />;
		});

		return (
			<section id="tableView">
					<table className="table table-striped">
					    <thead>
						    <tr>
						      <th>Website</th>
						      <th>Time Spent</th>
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
