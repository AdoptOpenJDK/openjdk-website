/* eslint-disable no-unused-vars */
var platforms = [];
var lookup = {};
var i = 0;

function setLookup() {
  // FUNCTIONS FOR GETTING PLATFORM DATA
  // allows us to use, for example, 'lookup["MAC"];'
  for (i = 0; i < platforms.length; i++) {
    lookup[platforms[i].searchableName] = platforms[i];
  }
}

// gets the 'searchableName' when you pass in the full filename.
// If the filename does not match a known platform, returns false. (E.g. if a new or incorrect file appears in a repo)
function getSearchableName(filename) {
  var platform = null;
  platforms.forEach(function(eachPlatform) {
    if(filename.indexOf(eachPlatform.searchableName) >= 0) {
      platform = eachPlatform.searchableName;
    }
  });
  if(platform) {
    return platform;
  }
  else {
    return null;
  }
}

// set path to logos
var logoPath = './dist/assets/';

// gets the OFFICIAL NAME when you pass in 'searchableName'
function getOfficialName(searchableName) {
  return (lookup[searchableName].officialName);
}

function getPlatformOrder(searchableName) {
  var index = platforms.findIndex(function(platform) {
    return platform.searchableName == searchableName;
  });
  return index;
}

function orderPlatforms(inputArray) {
  function compareOrder(thisAsset,nextAsset) {
    if (thisAsset.thisPlatformOrder < nextAsset.thisPlatformOrder)
      return -1;
    if (thisAsset.thisPlatformOrder > nextAsset.thisPlatformOrder)
      return 1;
    return 0;
  }
  var orderedArray = inputArray.sort(compareOrder);
  return orderedArray;
}

// gets the BINARY EXTENSION when you pass in 'searchableName'
function getBinaryExt(searchableName) {
  return (lookup[searchableName].binaryExtension);
}

// gets the INSTALLER EXTENSION when you pass in 'searchableName'
function getInstallerExt(searchableName) {
  return (lookup[searchableName].installerExtension);
}

// gets the LOGO WITH PATH when you pass in 'searchableName'
function getLogo(searchableName) {
  return (logoPath + (lookup[searchableName].logo));
}

// set value for loading dots on every page
var loading = document.getElementById('loading');

// set value for error container on every page
var errorContainer = document.getElementById('error-container');

// set variable names for menu elements
const menuOpen = document.getElementById('menu-button');
const menuClose = document.getElementById('menu-close');
const menu = document.getElementById('menu-container');

menuOpen.onclick = function() {
  menu.className = menu.className.replace( /(?:^|\s)slideOutLeft(?!\S)/g , ' slideInLeft' ); // slide in animation
  menu.className = menu.className.replace( /(?:^|\s)hide(?!\S)/g , ' animated' ); // removes initial hidden property, activates animations
}

menuClose.onclick = function() {
  menu.className = menu.className.replace( /(?:^|\s)slideInLeft(?!\S)/g , ' slideOutLeft' ); // slide out animation
}

// this function returns an object containing all information about the user's OS (from the 'platforms' array)
function detectOS() {
  // if the platform detection library's output matches the 'osDetectionString' of any platform object in the 'platforms' array...
  // ...set the variable 'matchedOS' as the whole object. Else, 'matchedOS' will be null.
  var matchedOS = null;
  platforms.forEach(function(eachPlatform) {
    var thisPlatformMatchingString = eachPlatform.osDetectionString.toUpperCase();
    /* eslint-disable */
    var platformFamily = platform.os.family.toUpperCase(); // platform.os.family is dependent on 'platform.js', loaded by index.html (injected in index.handlebars)
    /* eslint-enable */
    if(thisPlatformMatchingString.indexOf(platformFamily) >= 0) { // if the detected 'platform family' string appears in the osDetectionString value of a platform...
      matchedOS = eachPlatform;
    }
  });

  if(matchedOS){ return matchedOS; } else { return null; }
}

// when using this function, pass in the name of the repo (options: releases, nightly)
function loadJSON(repo, filename, callback) {
  var url = ('https://raw.githubusercontent.com/AdoptOpenJDK/openjdk-' + repo + '/master/' + filename + '.json'); // the URL of the JSON built in the website back-end

  if(repo === 'adoptopenjdk.net') {
    url = (filename);
  }

  var xobj = new XMLHttpRequest();
  xobj.open('GET', url, true);
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == '200') { // if the status is 'ok', run the callback function that has been passed in.
      callback(xobj.responseText);
    } else if (
      xobj.status != '200' && // if the status is NOT 'ok', remove the loading dots, and display an error:
      xobj.status != '0') { // for IE a cross domain request has status 0, we're going to execute this block fist, than the above as well.
      loading.innerHTML = '';
      document.getElementById('error-container').innerHTML = '<p>Error... there\'s a problem fetching the releases. Please see the <a href=\'https://github.com/AdoptOpenJDK/openjdk-releases/releases\' target=\'blank\'>releases list on GitHub</a>.</p>';
    }
  };
  xobj.send(null);
}

function loadPlatformsThenData(callback) {
  loadJSON('adoptopenjdk.net', './dist/json/config.json', function(response) {
    var platformsJson = JSON.parse(response);

    if (typeof platformsJson !== 'undefined') { // if there are releases...
      platforms = platformsJson.platforms;
      setLookup();
      callback();
    }
    else {
      // report an error
      errorContainer.innerHTML = '<p>Error... there\'s a problem fetching the releases. Please see the <a href=\'https://github.com/AdoptOpenJDK/openjdk-releases/releases\' target=\'blank\'>releases list on GitHub</a>.</p>';
      loading.innerHTML = ''; // remove the loading dots
    }
  });
}

// build the menu twisties
var submenus = document.getElementById('menu-content').getElementsByClassName('submenu');

for (i = 0; i < submenus.length; i++) {
  var twisty = document.createElement('span');
  var twistyContent = document.createTextNode('>');
  twisty.appendChild(twistyContent);
  twisty.className = 'twisty';

  var thisLine = submenus[i].getElementsByTagName('a')[0];
  thisLine.appendChild(twisty);

  thisLine.onclick = function(){
    this.parentNode.classList.toggle('open');
  }
}

function setTickLink() {
  var ticks = document.getElementsByClassName('tick');
  for (i = 0; i < ticks.length; i++) {
    ticks[i].addEventListener('click', function(event) {
      var win = window.open('https://en.wikipedia.org/wiki/Technology_Compatibility_Kit', '_blank');
      if (win) {
          win.focus();
      } else {
          alert('New tab blocked - please allow popups.');
      }
      event.preventDefault();
    });
  }
}
