console.log("Background.js Started");

let timeSegments = [];

//Opens a new tab and shows index.html
function openBehaviorViewer(e)	{
	chrome.tabs.create({
		url: "./index.html"
	});
}

function recordTimeSegment(url) {
	timeSegments.push({
		url,
		dateTime: Date.now()
	});

	console.log("Time Segments: ", timeSegments);

	chrome.storage.sync.set({timeSegments});
}

//Function called by onUpdated event (from chrome) - passes in the three arguments
function tabUpdated(tabID, changeInfo, tab) {
	recordTimeSegment(tab.url);
}

//Function called by onActivated event (from chrome) - passes in the argument
function activeTabChanged(activeInfo) {
	chrome.tabs.query({ active: true}, (tabs) => recordTimeSegment(tabs[0].url))
}

//Add our event listeners
chrome.tabs.onActivated.addListener(activeTabChanged);
chrome.tabs.onUpdated.addListener(tabUpdated);
chrome.browserAction.onClicked.addListener(openBehaviorViewer);
