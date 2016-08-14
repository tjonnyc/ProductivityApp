console.log("Background.js Started");

//Opens a new tab and shows index.html
function openBehaviorViewer(e)	{
	chrome.tabs.create({
		url: "http://localhost:3000/index.html"
	});
}

//Called when a tab is made active (i.e. switched to by the user)
function activeTabChanged(activeInfo) {
	chrome.tabs.query({ active: true}, (tabs) => recordTimeSegment(tabs[0].url))
}

//Called when a tab is updated (i.e. when a user types in a new url)
function tabUpdated(tabID, changeInfo, tab) {
	recordTimeSegment(tab.url);
}

//Called when the browser goes idle or becomes active
function idleStateChanged(newState) {
	if (newState === "active") {
		chrome.tabs.query({ active: true}, (tabs) => recordTimeSegment(tabs[0].url))	
	} else { //only other options are idle or locked
		console.log("Idle from idle");
		recordTimeSegment("IDLE");
	}
}

//Called when a tab is closed
function tabRemoved(tabId, removeInfo) {
	chrome.tabs.query({}, (tabs) => { if(tabs.length === 0) {recordTimeSegment("IDLE")} });
}

//Sends ajax request to the server to add a timesegment to the database
function recordTimeSegment(url) {
	var currentTime = Date.now() - 1470393262896;
	//Hit server with a get request and pass the url and datetime to add to the db
	var xhttp = new XMLHttpRequest();  
  xhttp.open("GET", "http://localhost:3000/addTimeSegment?url=" + encodeURIComponent(url) + "&datetime=" + currentTime);
  xhttp.send();
  console.log("Recorded URL: ", url, ", DATETIME: ", currentTime); 	  
}

//Add our event listeners
chrome.browserAction.onClicked.addListener(openBehaviorViewer);
chrome.tabs.onActivated.addListener(activeTabChanged);
chrome.tabs.onUpdated.addListener(tabUpdated);
chrome.idle.onStateChanged.addListener(idleStateChanged);
chrome.tabs.onRemoved.addListener(tabRemoved);

