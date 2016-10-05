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

	var server = productionServer;

	var user_id = 0;

	chrome.identity.getAuthToken({ 'interactive': true }, function (token) {
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

	function requestComplete() {
		if (this.status == 401) {
			console.log("Error in requestComplete" + this.status);
		} else {
			console.log(this.response);
			onUserInfoFetched(null, this.status, this.response);
		}
	}

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

		//Opens a new tab and shows index.html
		function openBehaviorViewer(e) {
			chrome.tabs.create({
				url: server + "/index.html?userid=" + user_id
			});
		}

		//Called when a tab is made active (i.e. switched to by the user)
		function activeTabChanged(activeInfo) {
			chrome.tabs.query({ active: true }, function (tabs) {
				if (tabs.length > 0) {
					recordTimeSegment(tabs[0].url);
				}
			});
		}

		//Called when a tab is updated (i.e. when a user types in a new url)
		function tabUpdated(tabID, changeInfo, tab) {
			recordTimeSegment(tab.url);
		}

		//Called when the browser goes idle or becomes active
		function idleStateChanged(newState) {
			if (newState === "active") {
				chrome.tabs.query({ active: true }, function (tabs) {
					return recordTimeSegment(tabs[0].url);
				});
			} else {
				//only other options are idle or locked
				recordTimeSegment("IDLE");
			}
		}

		//Called when a tab is closed
		function tabRemoved(tabId, removeInfo) {
			chrome.tabs.query({}, function (tabs) {
				if (tabs.length === 0) {
					recordTimeSegment("IDLE");
				}
			});
		}

		//Sends ajax request to the server to add a timesegment to the database
		function recordTimeSegment(url) {
			url = (0, _parseUrl_helper2.default)(url);
			if (url !== currentURL) {
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
		chrome.browserAction.onClicked.addListener(openBehaviorViewer);
		chrome.tabs.onActivated.addListener(activeTabChanged);
		chrome.tabs.onUpdated.addListener(tabUpdated);
		chrome.idle.onStateChanged.addListener(idleStateChanged);
		chrome.tabs.onRemoved.addListener(tabRemoved);
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