console.log("Background.js Started");

//Opens a new tab and shows index.html
function openBehaviorViewer(e)	{
	chrome.tabs.create({
		url: "http://localhost:3000/index.html"
	});
}

function recordTimeSegment(url) {
	var currentTime = Date.now() - 1470393262896;
	console.log(currentTime);
	//Hit server with a get request and pass the url and datetime to add to the db
	var xhttp = new XMLHttpRequest();  
  xhttp.open("GET", "http://localhost:3000/addTimeSegment?url=" + encodeURIComponent(url) + "&datetime=" + currentTime);
  xhttp.send();
  console.log("Recorded URL: ", url, ", DATETIME: ", currentTime); 	  
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
