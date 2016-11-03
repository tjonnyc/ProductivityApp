let actions = {
	
	pullDataFromServer(privateData, publicData) {
		return {
			type: 'PULL_DATA_FROM_SERVER',
			privateData,
			publicData
		}
	},

	updateDatabase() {
		console.log("Action Called");
		return {
			type: 'UPDATE_DATABASE'
		}
	},

	updateCategory(url, value) {
		return {
			type: 'UPDATE_CATEGORY',
			url,
			value
		}
	},

	excludeURL(url, exclude) {
		return {
			type: 'EXCLUDE_URL',
			url,
			exclude
		}
	},

	removeURL(url) {
		return {
			type: 'REMOVE_URL',
			url
		}
	},

	updateDefaultCategories() {
		return {
			type: 'UPDATE_DEFAULT_CATEGORIES',
		}
	},

}

export default actions