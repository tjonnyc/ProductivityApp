//Import Libraries
import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

//Pulls the users data from the AWS Server and loads the websites array in state
function addData(rawData) {
  console.log("Add Data Called")
  let totalNumDays = calculateTotalNumDays(rawData);
  let websites = consolidateTimeSegments(rawData);
  let totalTime = calculateTotalTime(websites);
  let categories = consolidateCategories(websites);
  return {totalNumDays, totalTime, websites, categories};   
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
    let existingCategoryIndex = prev.findIndex((item) => {return item.category === curr.category});

    if(existingCategoryIndex === -1) {
      prev.push({url: curr.category, timeElapsed: curr.timeElapsed, category: curr.category});
    } else {
      prev[existingCategoryIndex].timeElapsed += curr.timeElapsed;
    }

    return prev;

  }, []);
}

function consolidateTimeSegments(timeSegments) {

  return timeSegments.reduce(function(prev, curr, index, array) {
  
    if (curr.url !== "IDLE") {
      let timeElapsed = 0;
      if (index !== array.length-1) {
        timeElapsed = array[index+1].datetime - curr.datetime;
      }

      let existingURLIndex = prev.findIndex((item) => {return item.url === curr.url});

      if(existingURLIndex === -1) {
        prev.push({url: curr.url, timeElapsed, category: curr.category});
      } else {
        prev[existingURLIndex].timeElapsed += timeElapsed;
      }
    }
    
    return prev;
  }, []);
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

function sendCategoryUpdates(categoriesChanged) {
  while (categoriesChanged.length > 0) {      
      let change = categoriesChanged.pop();

      var xhttp = new XMLHttpRequest();
      console.log("GET", "/updateCategory?url=" + encodeURIComponent(change.url) + "&newCategory=" + encodeURIComponent(change.category) + "&userid=" + encodeURIComponent(state.userid) + "&oldCategory=" + encodeURIComponent(change.oldCategory));
      xhttp.open("GET", "/updateCategory?url=" + encodeURIComponent(change.url) + "&newCategory=" + encodeURIComponent(change.category) + "&userid=" + encodeURIComponent(state.userid) + "&oldCategory=" + encodeURIComponent(change.oldCategory));
      xhttp.send();     
  }
}

function updateCategoryInDatabase(state) {   
  console.log("inner function called");
  if (state.recentChange) {
    console.log("recent change true");
    return { recentChange: false }
  }
  else {
    console.log("recent change is false");
    let categoriesChanged = state.categoriesChanged;
    setTimeout(sendCategoryUpdates(categoriesChanged), 0);
    return { categoriesChanged: [] }
  }  
}

function changeView(newView) {
  if (newView === "URL View") {
    return {activeNav: {urlView: "active", categoryView: "", settingsView: ""}};
  } else if (newView === "Category View") {
    return {activeNav: {urlView: "", categoryView: "active", settingsView: ""}};
  } else if (newView === "Settings") {
    return {activeNav: {urlView: "", categoryView: "", settingsView: "active"}};
  } else {
    console.log("Error in Change View in Main Reducer");
  }
}

function main(state = {}, action) {
  console.log(state, action);
  switch (action.type) {
    case 'ADD_DATA_FROM_SERVER':
      return Object.assign({}, state, addData(action.data));
      break;
    case 'UPDATE_CATEGORY':
      return Object.assign({}, state, updateCategory(state, action.url, action.value));
      break;
    case 'UPDATE_CATEGORY_IN_DATABASE':
      console.log("reducer function called");
      return  Object.assign({}, state, updateCategoryInDatabase(state));
      break;
    case 'CHANGE_VIEW':
      return Object.assign({}, state, changeView(action.newView));
      break;
    default:
      return state;
  }
}

export default combineReducers({main, routing: routerReducer });
