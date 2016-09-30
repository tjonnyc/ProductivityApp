export default function getUserID(functionToRun) {

  var user_id = 0;

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
      functionToRun(user_info.id);
    } else {
      console.log("Error in onUserInfoFetched" + error + status);
    }
  }


}