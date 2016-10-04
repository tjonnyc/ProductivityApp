import React, { Component } from 'react';

export default class Website_Row extends Component {

	constructor(props) {
		super(props);

		this.state = {
			category:	props.website.category
		}
	}

	changeHandler(event) {
		this.setState({category: event.target.text});

		var xhttp = new XMLHttpRequest();
	  xhttp.open("GET", "/updateCategory?url=" + this.props.website.url + "&category=" + event.target.text + "&userid=" + this.props.userid);
	  xhttp.send();
	}

	render() {
		return (
			<tr>
	      <td>{this.props.website.url}</td>
	      <td>{this.props.website.timeElapsed}</td>
	    	<td>
		    	<div className="dropdown">
					  <button className="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
					    {this.state.category}
					    <span className="caret"></span>
					  </button>
					  <ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
					    <li><a href="#" onClick={this.changeHandler.bind(this)}>Social</a></li>
					    <li><a href="#" onClick={this.changeHandler.bind(this)}>Programming</a></li>
					    <li><a href="#" onClick={this.changeHandler.bind(this)}>Other</a></li>
					  </ul>
					</div>
				</td>
    	</tr>
		);
	}
}
