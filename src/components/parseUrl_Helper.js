// Takes a raw url and returns the full domain
// (e.g. "https://mail.google.com/mail/u/0/#inbox" --> "mail.google.com")
export default function parseUrl(url) {
	//In the special case that a url is an IDLE entry we don't want to parse it
	if (url === "IDLE") {return url;}

	var fullSite;

	// mainSite is the second-level domain (i.e. "https://mail.google.com/mail/u/0/#inbox" --> "mail.google.com")
	// This is set up if needed for future use
	var mainSite;

	// domain is the top-level domain (i.e. "https://mail.google.com/mail/u/0/#inbox" --> ".com")
	var domain;
	var valid = false;
	var domains = ['.com', '.edu', '.org', '.net', '.gov', '.int', '.mil'];

	//Remove data after top-level domain
	for(let i = 0; i < domains.length; i++) {
		let index = url.indexOf(domains[i]);
		if(index !== -1) {
			domain = domains[i];
			valid = true;
			fullSite = url.slice(0, index);
			break;
		}
	}

	if (!valid) { return url; }

	//Remove 'http' or 'https' if there
	if(fullSite.indexOf('://') !== -1) {
		fullSite = fullSite.split('://')[1];
	}
	
	
	//Remove 'www.' if there
	if(fullSite.slice(0,4) === "www." || fullSite.slice(0,4) === "WWW.") {
		fullSite = fullSite.slice(4);
	}

	//If fullsite contains periods, find mainSite
	if(fullSite.indexOf('.') !== -1) {
		mainSite = fullSite.slice(fullSite.indexOf('.'));
	} else {
		mainSite = fullSite;
	}

	return fullSite;
}
