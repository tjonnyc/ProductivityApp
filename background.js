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
	var currentURL = "";

	//Opens a new tab and shows index.html
	function openBehaviorViewer(e) {
		chrome.tabs.create({
			url: "http://localhost:3000/index.html"
		});
	}

	//Called when a tab is made active (i.e. switched to by the user)
	function activeTabChanged(activeInfo) {
		chrome.tabs.query({ active: true }, function (tabs) {
			return recordTimeSegment(tabs[0].url);
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
			var currentTime = Date.now() - 1471344028132;
			//Hit server with a get request and pass the url and datetime to add to the db
			var xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function () {
				if (xhttp.readyState == 4 && xhttp.status == 200) {
					console.log("Database Updated");
				}
			};
			xhttp.open("GET", "http://localhost:3000/addTimeSegment?url=" + encodeURIComponent(url) + "&datetime=" + currentTime);
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

		var fullSite;

		// mainSite is the second-level domain (i.e. "https://mail.google.com/mail/u/0/#inbox" --> "mail.google.com")
		// This is set up if needed for future use
		var mainSite;

		// domain is the top-level domain (i.e. "https://mail.google.com/mail/u/0/#inbox" --> ".com")
		var domain;
		var validUrl = false;
		var domains = ['.com', '.edu', '.org', '.net', '.gov', '.int', '.mil'];

		//Remove data after top-level domain
		for (var i = 0; i < domains.length; i++) {
			var index = url.indexOf(domains[i]);
			if (index !== -1) {
				domain = domains[i];
				fullSite = url.slice(0, index) + domain;
				validUrl = true;
				break;
			}
		}

		//If url didn't have a recognized top-leve domain, returns unknown
		if (!validUrl) {
			return 'Unknown';
		}

		//Remove 'http' or 'https' if there
		if (fullSite.indexOf('://') !== -1) {
			fullSite = fullSite.split('://')[1];
		}

		//Remove 'www.' if there
		if (fullSite.slice(0, 4) === "www." || fullSite.slice(0, 4) === "WWW.") {
			fullSite = fullSite.slice(4);
		}

		//If contains 2 periods, find mainSite
		if (fullSite.indexOf('.') !== fullSite.lastIndexOf('.')) {
			var reverseFullSite = fullSite.split('').reverse().join('');
			var startIndex = fullSite.length - reverseFullSite.indexOf('.', domain.length);
			mainSite = fullSite.slice(startIndex);
		} else {
			mainSite = fullSite;
		}

		return fullSite;
	}

/***/ }
/******/ ]);