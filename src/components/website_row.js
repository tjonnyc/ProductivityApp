import React, { Component } from 'react';

export default class Website_Row extends Component {

	render() {
		return (
			<tr>
	      <td>{this.props.website.url}</td>
	      <td>{this.props.website.timeElapsed}</td>
	      <td>{this.props.website.category}</td>
	    </tr>
		);
	}
}
