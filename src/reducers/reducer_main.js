//Import Libraries
import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

//Pulls the users data from the AWS Server and loads the websites array in state
function pullData(privateData, publicData) {
  //private data
  let totalNumDays = calculateTotalNumDays(privateData);
  let websites = consolidateTimeSegments(privateData);
  let totalTime = calculateTotalTime(websites);
  let categories = consolidateCategories(websites);
  
  //public data
  let publicWebsites = consolidateTimeSegments(publicData);
  let totalPublicTime = calculateTotalTime(publicWebsites);
  let publicCategories = consolidateCategories(publicWebsites);
  return {totalNumDays, totalTime, websites, categories, publicWebsites, publicCategories, totalPublicTime};   

}

function calculateTotalNumDays(timeSegments) {
  if (timeSegments.length > 0) {
    var timeDiff = Math.abs(Date.now() - Number(timeSegments[0].datetime));     
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));      
    return diffDays;
  }
}

function calculateTotalTime(websites) {
  return websites.reduce(function(prev, curr, index, array) {
    return prev + curr.timeElapsed;
  }, 0);
}

function consolidateCategories(websites) {

  return  websites.reduce(function(prev, curr, index, array) {

    if (!(curr.exclude === "true")) {
    
      let existingCategoryIndex = prev.findIndex((item) => {return item.category === curr.category});

      if(existingCategoryIndex === -1) {
        prev.push({url: curr.category, timeElapsed: curr.timeElapsed, category: curr.category});
      } else {
        prev[existingCategoryIndex].timeElapsed += curr.timeElapsed;
      }      

    }

    return prev;

  }, []);
}

function consolidateTimeSegments(timeSegments) {

  return timeSegments.reduce(function(prev, curr, index, array) {
  
    if (curr.url !== "IDLE") {
      let existingURLIndex = prev.findIndex((item) => {return item.url === curr.url});

      if (curr.up_votes && curr.down_votes && curr.up_votes > curr.down_votes) {
        curr.exclude = "true";
      }

      if(existingURLIndex === -1) {
        prev.push({ url: curr.url, timeElapsed: Number(curr.timespent), category: curr.category || "Uncategorized", exclude: curr.exclude || "false" });
      } else {
        prev[existingURLIndex].timeElapsed += Number(curr.timespent);
      }
    }
    
    return prev;
  }, []);
}

function updateDatabase(state) {   

  if (state.recentChange) {
    return { recentChange: false }
  }
  else {
    if (state.categoriesChanged.length > 0) {
      let categoriesChanged = state.categoriesChanged;
      setTimeout(sendCategoryUpdates(categoriesChanged, state.userid), 0);
    }
    if (state.urlsExcluded.length > 0) {
      let urlsExcluded = state.urlsExcluded;
      setTimeout(sendExcludeUpdates(urlsExcluded, state.userid), 0);
    }
    if (state.urlsRemoved.length > 0) {
      let urlsRemoved = state.urlsRemoved;
      setTimeout(sendRemoveUpdates(urlsRemoved, state.userid), 0);
    }
    return { categoriesChanged: [], urlsExcluded: [], urlsRemoved: [] }
  }  
}

function sendCategoryUpdates(categoriesChanged, userid) {
  while (categoriesChanged.length > 0) {      
      let change = categoriesChanged.pop();

      var xhttp = new XMLHttpRequest();
      console.log("GET", "/updateCategory?url=" + encodeURIComponent(change.url) + "&newCategory=" + encodeURIComponent(change.category) + "&userid=" + encodeURIComponent(userid) + "&oldCategory=" + encodeURIComponent(change.oldCategory));
      xhttp.open("GET", "/updateCategory?url=" + encodeURIComponent(change.url) + "&newCategory=" + encodeURIComponent(change.category) + "&userid=" + encodeURIComponent(userid) + "&oldCategory=" + encodeURIComponent(change.oldCategory));
      xhttp.send();     
  }
}

function sendExcludeUpdates(urlsExcluded, userid) {
  while (urlsExcluded.length > 0) {      
      let change = urlsExcluded.pop();

      var xhttp = new XMLHttpRequest();
      console.log("GET", "/excludeUrl?url=" + encodeURIComponent(change.url) + "&userid=" + encodeURIComponent(userid) + "&exclude=" + encodeURIComponent(change.exclude));
      xhttp.open("GET", "/excludeUrl?url=" + encodeURIComponent(change.url) + "&userid=" + encodeURIComponent(userid) + "&exclude=" + encodeURIComponent(change.exclude));;
      xhttp.send();     
  }
}

function sendRemoveUpdates(urlsRemoved, userid) {
  while (urlsRemoved.length > 0) {      
      let change = urlsRemoved.pop();

      var xhttp = new XMLHttpRequest();
      console.log("GET", "/removeURL?url=" + encodeURIComponent(change.url) + "&userid=" + encodeURIComponent(userid));
      xhttp.open("GET", "/removeURL?url=" + encodeURIComponent(change.url) + "&userid=" + encodeURIComponent(userid));
      xhttp.send();     
  }
}

function updateCategory(state, url, category) {
  
  let index = state.websites.findIndex(function(element, index, array) {
    return element.url === url;
  })

  let websites = state.websites;
  let oldCategory = websites[index].category;
  websites[index].category = category;
  let categories = consolidateCategories(websites);

  let categoriesChanged = state.categoriesChanged;

  index = categoriesChanged.findIndex(function(element, index, array) {
    return element.url === url;
  })
  
  if (index === -1) {
    categoriesChanged.push({ url, category, oldCategory });
  }
  else {
    categoriesChanged[index].category = category;
  }

  return { websites, categories, categoriesChanged, recentChange: true };
}

function excludeUrl(state, url, exclude) {
  
  let index = state.websites.findIndex(function(element, index, array) {
    return element.url === url;
  });

  let websites = state.websites;
  websites[index].exclude = exclude;
  let categories = consolidateCategories(websites);

  let urlsExcluded = state.urlsExcluded;

  index = urlsExcluded.findIndex(function(element, index, array) {
    return element.url === url;
  })
  
  if (index === -1) {
    urlsExcluded.push({ url, exclude });
  }
  else {
    urlsExcluded[index].exclude = exclude;
  }

  return { websites, categories, urlsExcluded, recentChange: true };
}

function removeUrl(state, url) {
  
  let index = state.websites.findIndex(function(element, index, array) {
    return element.url === url;
  })

  let websites = state.websites;
  websites.splice(index, 1);
  let categories = consolidateCategories(websites);

  let urlsRemoved = state.urlsRemoved;
  urlsRemoved.push({ url });

  return { websites, categories, urlsRemoved, recentChange: true };
}

function main(state = {}, action) {
  console.log(state, action);
  switch (action.type) {
    case 'PULL_DATA_FROM_SERVER':
      return Object.assign({}, state, pullData(action.privateData, action.publicData));
      break;
    case 'UPDATE_DATABASE':
      return  Object.assign({}, state, updateDatabase(state));
      break;
    case 'UPDATE_CATEGORY':
      return Object.assign({}, state, updateCategory(state, action.url, action.value));
      break;
    case 'EXCLUDE_URL':
      return Object.assign({}, state, excludeUrl(state, action.url, action.exclude));
      break;
    case 'REMOVE_URL':
      return Object.assign({}, state, removeUrl(state, action.url));
      break;
    default:
      return state;
  }
}

export default combineReducers({main, routing: routerReducer });
