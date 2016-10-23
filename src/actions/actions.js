let actions = {
	
	addDataFromServer(data) {
		return {
			type: 'ADD_DATA_FROM_SERVER',
			data
		}
	},

	updateCategory(url, value) {
		return {
			type: 'UPDATE_CATEGORY',
			url,
			value
		}
	},

	updateCategoryInDatabase() {
		console.log("Action Called");
		return {
			type: 'UPDATE_CATEGORY_IN_DATABASE'
		}
	},

}

export default actions