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
var currentTime = Date.now();

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
			var time = Date.now();			

		  if (currentURL !== "") {

		  	//Add a 'private' time segment by sending the url and datetime and userid to add to the db
				var xhttp = new XMLHttpRequest(); 
				console.log(server + "/addPrivateTimeSegment?url=" + currentURL + "&datetime=" + time + "&userid=" + user_id + "&timespent=" + (time - currentTime));
			  xhttp.open("GET", server + "/addPrivateTimeSegment?url=" + currentURL + "&datetime=" + time + "&userid=" + user_id + "&timespent=" + (time - currentTime));
			  xhttp.send();  

		  	//Increment the 'public' time spent on the current (e.g. prior) url by sending the time spent since the last url was clicked
			  var xhttp2 = new XMLHttpRequest(); 
				console.log(server + "/incrementPublicURL?url=" + currentURL + "&timespent=" + (time - currentTime));
			  xhttp2.open("GET", server + "/incrementPublicURL?url=" + currentURL + "&timespent=" + (time - currentTime));
			  xhttp2.send();
			}

		  currentTime = time;
		  currentURL = url;
		}
	}

	//Add our event listeners
	chrome.browserAction.onClicked.addListener(openBehaviorViewer); //Handles opening the display page

	//We also need to add a script which calls updateURL each minute
	window.setInterval(updateURL, 5000);  
}
