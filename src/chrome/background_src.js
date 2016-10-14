import parseUrl from '../components/parseUrl_helper';

console.log("Background.js Started");

var devServer = "http://localhost:8081";
var productionServer = "http://productivityapp-dev.us-west-2.elasticbeanstalk.com";

var server = devServer;

var user_id = 0;

//Gets our AuthToken from Google Account and calls request complete
chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
  if (chrome.runtime.lastError) {
    console.log(chrome.runtime.lastError);
    return;
  }

  console.log(token);

  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://www.googleapis.com/plus/v1/people/me');
  xhr.setRequestHeader('Authorization', 'Bearer ' + token);
  xhr.onload = requestComplete;
  xhr.send();
});

//Check for errors and calls onUserInfoFetched
function requestComplete() {
  if (this.status == 401) {
    console.log("Error in requestComplete" + this.status);
  } else {
  	console.log(this.response);
    onUserInfoFetched(null, this.status, this.response);
  }
}

//Sets the user_id and calls continuePostUserID
function onUserInfoFetched(error, status, response) {
  if (!error && status == 200) {
    var user_info = JSON.parse(response);
    user_id = user_info.id;
    continuePostUserID();
  } else {
    console.log("Error in onUserInfoFetched" + error + status);
  }
}

var currentURL = "";

function continuePostUserID() {

	//Opens a new tab and shows index.html on click of extension icon
	function openBehaviorViewer(e)	{
		chrome.tabs.create({
			url: server + "/index.html?userid=" + user_id
		});
	}

	//Identifies the currently active URL (or IDLE)
	function updateURL() {
		console.log("Update Called");
		
		//First check if any tabs are open
		chrome.tabs.query({}, (anyTabs) => {
			if (anyTabs.length !== 0) {			
				//Then check if the chrome window is focused
				chrome.windows.getLastFocused({}, (theWindow) => {					
					//If a window is is focused...
					if (theWindow.focused) {
						//Then we get the information about the active tab in the open window
						chrome.tabs.query({ active: true, windowId: theWindow.id}, (tabs) => {							
							//We also check to see if the computer is idle
							chrome.idle.queryState(60, (newState) => {
								//If the computer is not idle OR if the active tab is both audible and not muted send the current URL
								if (newState === "active" || (tabs[0].audible && !tabs[0].mutedInfo.muted)) {
									recordTimeSegment(tabs[0].url);
								}
								//If the computer is idle AND the active tab is either not playing music or the music is muted then record an idle
								else {
									recordTimeSegment("IDLE");
								}
							})
						})
					}
					//If there is no foused window then we send an idle
					else {
						recordTimeSegment("IDLE");	
					}					
				})
			}
			//If there is no open tab then we send an idle
			else {
				recordTimeSegment("IDLE");
			}
		})
	}
	
	//Sends ajax request to the server to add a timesegment to the database
	function recordTimeSegment(url) {
		url = parseUrl(url);
		if (url !== currentURL)
		{
			var currentTime = Date.now();

			//Hit server with a get request and pass the url and datetime and hashed userid to add to the db
			var xhttp = new XMLHttpRequest(); 
			console.log(server + "/addTimeSegment?url=" + url + "&datetime=" + currentTime + "&userid=" + user_id);
		  xhttp.open("GET", server + "/addTimeSegment?url=" + url + "&datetime=" + currentTime + "&userid=" + user_id);
		  xhttp.send();  
		  currentURL = url;
		}
	}

	//Add our event listeners
	chrome.browserAction.onClicked.addListener(openBehaviorViewer); //Handles opening the display page

	//We also need to add a script which calls updateURL each minute
	window.setInterval(updateURL, 5000);  
}
/*
//Gets tabs which are 

	
	//Add listeners which run a check on the logging state as events occur
	chrome.tabs.onActivated.addListener(updateURL); 
	chrome.tabs.onUpdated.addListener(updateURL); 
	chrome.idle.onStateChanged.addListener(updateURL); 
	chrome.tabs.onRemoved.addListener(updateURL);


	//Called when a tab is made active (i.e. switched to by the user)
	function activeTabChanged(activeInfo) {
		chrome.tabs.query({ active: true}, (tabs) => {
			if (tabs.length > 0) {
				recordTimeSegment(tabs[0].url);
			}
		});
	}

	//Called when a tab is updated (i.e. when a user types in a new url)
	function tabUpdated(tabID, changeInfo, tab) {
		recordTimeSegment(tab.url);
	}


	//Called when a tab is closed
	function tabRemoved(tabId, removeInfo) {
		chrome.tabs.query({}, (tabs) => { if(tabs.length === 0) { recordTimeSegment("IDLE") });
	}


	//Called when the browser goes idle or becomes active
	function idleStateChanged(newState) {
		if (newState === "active") {
			
			//check for focus

			chrome.tabs.query({ active: true}, (tabs) => recordTimeSegment(tabs[0].url));	
		} else { //only other options are idle or locked
			
			//check for focus and sound

			recordTimeSegment("IDLE");
		}
	}
*/