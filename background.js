console.log("background.js Started");

function openBehaviorViewer(e)	{
	console.log("Fired");
	chrome.tabs.create({
		url: "./index.html"
	});
}

chrome.browserAction.onClicked.addListener(openBehaviorViewer);