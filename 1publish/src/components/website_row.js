import React, { Component } from 'react';
import Autocomplete from 'react-autocomplete';

export default class Website_Row extends Component {

	constructor(props) {
		super(props);
	}

	shouldItemRender(category, searchTerm) {
		return (category.name.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1);
	}

	sortItems(a, b, searchTerm) {
		return (
    	a.name.toLowerCase().indexOf(searchTerm.toLowerCase()) >
    	b.name.toLowerCase().indexOf(searchTerm.toLowerCase()) ? 1 : -1
  	)
	}

	updateCategory(category) {
		if (category !== this.props.website.category) {
		  this.props.updateCategory(this.props.website.url, category);
		}
	}

	render() {

		let styles = {
		  item: {
		    padding: '2px 6px',
		    cursor: 'default'
		  },

		  highlightedItem: {
		    color: 'white',
		    background: 'hsl(200, 50%, 50%)',
		    padding: '2px 6px',
		    cursor: 'default'
		  },

		  menu: {
		    border: 'solid 1px #ccc'
		  }
		}

		return (
			<tr>
	      <td>{this.props.website.url}</td>
	      <td>{Math.floor((this.props.website.timeElapsed/this.props.totalTime) * 100) + "%"}</td>
	      <td>{Math.floor(this.props.website.timeElapsed/this.props.totalNumDays/(1000 * 60))}</td>
	    	<td>
		    	<Autocomplete
	          value={this.props.website.category}          	
	          items={[
	          	{name: "Entertainment: TV/Video"},
	          	{name: "Entertainment: Social Network"},
	          	{name: "Entertainment: Reading"},
	          	{name: "News"},
	          	{name: "Shopping"},
	          	{name: "Search Engine"},
	          	{name: "Research"},
	          	{name: "Email"},
	          	{name: "Entertainment: Games"},
	          	{name: "Programming"},
	          	{name: "Work"},
	          	{name: "Banking"},
	          	{name: "Pornography"},
	          	{name: "Messaging"},
	          	{name: "Online Dating"},
	          	{name: "Entertainment: Sports"},
	          	{name: "Fantasy Football"},
	          	{name: "Music"},
	          	{name: "School"},
	          	{name: "Productivity"},
	          	{name: "Errands"},
	        	]}
	          getItemValue={(item) => item.name}
	          shouldItemRender={this.shouldItemRender.bind(this)}
	          sortItems={this.sortItems.bind(this)}
	          onChange={(event, value) => this.updateCategory(value)}
	          onSelect={value => this.updateCategory(value)}
	          renderItem={(item, isHighlighted) => (
	            <div
	              style={isHighlighted ? styles.highlightedItem : styles.item}
	              key={item.name}
	            >{item.name}</div>
	          )}
        	/>
				</td>
    	</tr>
		);
	}
}
