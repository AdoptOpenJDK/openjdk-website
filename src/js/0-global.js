// set platforms array - CHANGE THIS TO UPDATE WEBSITE PLATFORMS
var platforms = [
  {
    officialName: "Linux x86-64",
    searchableName: "X64_LINUX",
    logo: "linux.png",
    fileExtension: ".tar.gz",
    requirements: "GLIBC 2.5 and above"
  },
  {
    officialName: "Linux s390x",
    searchableName: "S390X_LINUX",
    logo: "linux.png",
    fileExtension: ".tar.gz",
    requirements: "GLIBC 2.5 and above"
  },
  {
    officialName: "Linux ppc64le",
    searchableName: "PPC64LE_LINUX",
    logo: "linux.png",
    fileExtension: ".tar.gz",
    requirements: "GLIBC 2.5 and above"
  },
  {
    officialName: "Linux arm",
    searchableName: "ARM_LINUX",
    logo: "linux.png",
    fileExtension: ".tar.gz",
    requirements: "GLIBC 2.5 and above"
  },
  {
    officialName: "macOS x86-64",
    searchableName: "MAC",
    logo: "mac.png",
    fileExtension: ".tar.gz",
    requirements: "macOS 10.8 and above"
  },
  {
    officialName: "Windows x86-64",
    searchableName: "WIN",
    logo: "windows.png",
    fileExtension: ".zip",
    requirements: "VS 2010 and above"
  }
];

// FUNCTIONS FOR GETTING PLATFORM DATA
// allows us to use, for example, 'lookup["MAC"];'
var lookup = {};
for (var i = 0, len = platforms.length; i < len; i++) {
    lookup[platforms[i].searchableName] = platforms[i];
}

// gets the 'searchableName' when you pass in the full filename.
// If the filename does not match a known platform, returns false. (E.g. if a new or incorrect file appears in a repo)
function getSearchableName(filename) {
  var platformCounter = 0;
  var platform = "UNKNOWN";
  platforms.forEach(function() {
    if(filename.indexOf(platforms[platformCounter].searchableName) >= 0) {
      platform = platforms[platformCounter].searchableName;
    }
    platformCounter++;
  });
  if(platform == "UNKNOWN") {
    return false;
  }
  else {
    return (lookup[platform].searchableName);
  }
}

// gets the OFFICIAL NAME when you pass in 'searchableName'
function getOfficialName(searchableName) {
  return (lookup[searchableName].officialName);
}

// gets the FILE EXTENSION when you pass in 'searchableName'
function getFileExt(searchableName) {
  return (lookup[searchableName].fileExtension);
}

// set path to logos
var logoPath = "/dist/assets/";
console.log(logoPath); // TODO - REMOVE THIS LINE ONCE LOGOPATH IS USED

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

// this function returns the name of the user's OS.
// modify this list to change how other functions search for downloads that match an OS.
function detectOS() {
  var OSName="UnknownOS";
  if (navigator.userAgent.indexOf("Win")!=-1) OSName="Win";
  if (navigator.userAgent.indexOf("Mac")!=-1) OSName="Mac";
  if (navigator.userAgent.indexOf("X11")!=-1) OSName="Linux";
  if (navigator.userAgent.indexOf("Linux")!=-1) OSName="Linux";
  if (navigator.userAgent.indexOf("obile")!=-1) OSName="UnknownOS";
  return OSName;
}

// when using this function, pass in the name of the repo (options: releases, nightly)
function loadReleasesJSON(repo, loading, callback) {
  if(msieversion() == true) { // if the browser is IE, display an error with advice, because important website features do not work in IE.
    loading.innerHTML = "";
    document.getElementById("error-container").innerHTML = "<p>Internet Explorer is not supported. Please use another browser, or see the <a href='https://github.com/AdoptOpenJDK/openjdk-releases/releases' target='blank'>releases list on GitHub</a>.</p>";
  }
  else {
    var url = ("https://raw.githubusercontent.com/AdoptOpenJDK/openjdk-" + repo + "/master/" + repo + ".json"); // the URL of the JSON built in the website back-end
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', url, true);
    xobj.onreadystatechange = function() {
      if (xobj.readyState == 4 && xobj.status == "200") { // if the status is 'ok', run the callback function that has been passed in.
        callback(xobj.responseText);
      } else if(xobj.status != "200") { // if the status is NOT 'ok', remove the loading dots, and display an error:
          loading.innerHTML = "";
          document.getElementById("error-container").innerHTML = "<p>Error... there's a problem fetching the releases. Please see the <a href='https://github.com/AdoptOpenJDK/openjdk-releases/releases' target='blank'>releases list on GitHub</a>.</p>";
      }
    };
    xobj.send(null);
  }
}

// check for IE browser
function msieversion() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");
    if (msie >= 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
      return true;
    }
    else { return false; }
}
