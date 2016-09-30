import parseUrl from '../components/parseUrl_helper';

console.log("Background.js Started");
var currentURL = "";

//Opens a new tab and shows index.html
function openBehaviorViewer(e)	{
	chrome.tabs.create({
		url: "http://productivityapp-dev.us-west-2.elasticbeanstalk.com/index.html"
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
		recordTimeSegment("IDLE");
	}
}

//Called when a tab is closed
function tabRemoved(tabId, removeInfo) {
	chrome.tabs.query({}, (tabs) => { if(tabs.length === 0) {recordTimeSegment("IDLE")} });
}

//Sends ajax request to the server to add a timesegment to the database
function recordTimeSegment(url) {
	url = parseUrl(url);
	if (url !== currentURL)
	{
		var currentTime = Date.now() - 1471344028132;
		//Hit server with a get request and pass the url and datetime to add to the db
		var xhttp = new XMLHttpRequest(); 
		xhttp.onreadystatechange = function() {
	    if (xhttp.readyState == 4 && xhttp.status == 200) {
				console.log("Database Updated");
	    }
	  }; 
	  xhttp.open("GET", "http://productivityapp-dev.us-west-2.elasticbeanstalk.com/addTimeSegment?url=" + encodeURIComponent(url) + "&datetime=" + currentTime);
	  xhttp.send();
	  console.log("Recorded URL: ", url, ", DATETIME: ", currentTime); 	  
	  currentURL = url;
	}
}

//Add our event listeners
chrome.browserAction.onClicked.addListener(openBehaviorViewer);
chrome.tabs.onActivated.addListener(activeTabChanged);
chrome.tabs.onUpdated.addListener(tabUpdated);
chrome.idle.onStateChanged.addListener(idleStateChanged);
chrome.tabs.onRemoved.addListener(tabRemoved);

