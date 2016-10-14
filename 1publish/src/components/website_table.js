import React, { Component } from 'react';
import Website_Row from './website_row.js';

export default class Website_Table extends Component {

	constructor(props) {
		super(props);
	}

	render() {

		let props = this.props;

		const Rows = this.props.websites.map(function(website, index) {
			return <Website_Row key={index} index={index} userid={props.userid} website={website} updateCategory={props.updateCategory.bind(this)} />;
		});

		return (
			<section id="tableView" className="col-sm-6 col-md-6 col-lg-6">
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
