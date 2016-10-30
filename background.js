/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _parseUrl_helper = __webpack_require__(1);

	var _parseUrl_helper2 = _interopRequireDefault(_parseUrl_helper);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	console.log("Background.js Started");

	var devServer = "http://localhost:8081";
	var productionServer = "http://productivityapp-dev.us-west-2.elasticbeanstalk.com";

	var server = devServer;

	var user_id = 0;

	//Gets our AuthToken from Google Account and calls request complete
	chrome.identity.getAuthToken({ 'interactive': true }, function (token) {
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
		function openBehaviorViewer(e) {
			chrome.tabs.create({
				url: server + "/index.html?userid=" + user_id
			});
		}

		//Identifies the currently active URL (or IDLE)
		function updateURL() {
			console.log("Update Called");

			//First check if any tabs are open
			chrome.tabs.query({}, function (anyTabs) {
				if (anyTabs.length !== 0) {
					//Then check if the chrome window is focused
					chrome.windows.getLastFocused({}, function (theWindow) {
						//If a window is is focused...
						if (theWindow.focused) {
							//Then we get the information about the active tab in the open window
							chrome.tabs.query({ active: true, windowId: theWindow.id }, function (tabs) {
								//We also check to see if the computer is idle
								chrome.idle.queryState(60, function (newState) {
									//If the computer is not idle OR if the active tab is both audible and not muted send the current URL
									if (newState === "active" || tabs[0].audible && !tabs[0].mutedInfo.muted) {
										recordTimeSegment(tabs[0].url);
									}
									//If the computer is idle AND the active tab is either not playing music or the music is muted then record an idle
									else {
											recordTimeSegment("IDLE");
										}
								});
							});
						}
						//If there is no foused window then we send an idle
						else {
								recordTimeSegment("IDLE");
							}
					});
				}
				//If there is no open tab then we send an idle
				else {
						recordTimeSegment("IDLE");
					}
			});
		}

		//Sends ajax request to the server to add a timesegment to the database
		function recordTimeSegment(url) {
			url = (0, _parseUrl_helper2.default)(url);
			if (url !== currentURL) {
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

/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = parseUrl;
	// Takes a raw url and returns the full domain
	// (e.g. "https://mail.google.com/mail/u/0/#inbox" --> "mail.google.com")
	function parseUrl(url) {
		//In the special case that a url is an IDLE entry we don't want to parse it
		if (url === "IDLE") {
			return url;
		}

		var fullSite = url;

		//Remove 'http://', 'https://', 'chrome://', etc if there
		if (fullSite.indexOf('://') !== -1) {
			fullSite = fullSite.split('://')[1];
		}

		//Remove 'www.' if there
		if (fullSite.slice(0, 4) === "www." || fullSite.slice(0, 4) === "WWW.") {
			fullSite = fullSite.slice(4);
		}

		//Remove everything after the next '/' if it exists
		if (fullSite.indexOf('/') !== -1) {
			fullSite = fullSite.slice(0, fullSite.indexOf('/'));
		}

		var domains = ['.com', '.edu', '.org', '.net', '.gov', '.int', '.mil', '.info', '.io'];

		//Remove the domain if it exists
		for (var i = 0; i < domains.length; i++) {

			var domain = domains[i];
			var endOfFullSite = fullSite.slice(fullSite.length - domain.length, fullSite.length);

			if (endOfFullSite === domain) {
				fullSite = fullSite.slice(0, fullSite.length - domain.length);
				break;
			}
		}

		return fullSite;

		/*
	 // mainSite is the second-level domain (i.e. "https://mail.google.com/mail/u/0/#inbox" --> "mail.google.com")
	 // This is set up if needed for future use
	 var mainSite;	
	 
	 //If fullsite contains periods, find mainSite
	 if(fullSite.indexOf('.') !== -1) {
	 	mainSite = fullSite.slice(fullSite.indexOf('.'));
	 } else {
	 	mainSite = fullSite;
	 }
	 
	 */
	}

/***/ }
/******/ ]);