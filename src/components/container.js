//Import Libraries
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

//Import Actions
import Actions from '../actions/actions.js';

//Import Components
import Nav from './nav.js';

class Container extends Component {

	constructor(props) {
		super(props);
		this.pullData();		
	}

	//Pulls the users data from the AWS Server and loads the websites array in state
	pullData() {
	  let rawData = [];
	  let props = this.props;

	  var xhttp = new XMLHttpRequest();
	  xhttp.onreadystatechange = function() {
	    if (xhttp.readyState == 4 && xhttp.status == 200) {
	      rawData = JSON.parse(xhttp.responseText);
	      props.addDataFromServer(rawData);   
	    }
	  };
	  xhttp.open("GET", "/data?userid=" + this.props.main.userid, true);
	  xhttp.send();
	}

	render() {
		return (
			<div>
				<Nav activeNav={this.props.main.activeNav} changeView={this.props.changeView} />
				{React.cloneElement(this.props.children, this.props)}
			</div>
		);
	}
}

function mapStateToProps(state) {
	return state;
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(Actions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Container);  