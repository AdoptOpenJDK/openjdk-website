// set platforms array - CHANGE THIS TO UPDATE WEBSITE PLATFORMS
// GUIDE TO THE PLATFORMS ARRAY:
// officialName: The 'legal name' or official name for the OS. This is displayed on most pages.
// searchableName: a string that appears in the name of the binaries and checksums, that can be used to identify the platform.
// logo: examplefilename.png. The path to the logo folder is set below (the 'logoPath' var).
// fileExtension: should include the dot at the beginning of the extension, e.g .tar.gz or .zip
// requirements: currently just displayed on the 'latest release' page. Should be a short string identifying the most important min. requirement of a machine to run the latest release.
// architecture: 64 or 32. May be required for differentiation between future builds.
// osDetectionString: this string is searched by the OS detection library platform.js to find a match. Include as many words as you like, separated by spaces.
var platforms = [
  {
    officialName: "Linux x86-64",
    searchableName: "X64_LINUX",
    logo: "linux.png",
    fileExtension: ".tar.gz",
    requirements: "GLIBC 2.5 and above",
    architecture: "64",
    osDetectionString: "Linux Mint Debian Fedora FreeBSD Gentoo Haiku Kubuntu OpenBSD Red Hat RHEL SuSE Ubuntu Xubuntu hpwOS webOS Tizen"
  },
  {
    officialName: "Linux s390x",
    searchableName: "S390X_LINUX",
    logo: "s390x.png",
    fileExtension: ".tar.gz",
    requirements: "GLIBC 2.5 and above",
    architecture: "64",
    osDetectionString: "not-to-be-detected"
  },
  {
    officialName: "Linux ppc64le",
    searchableName: "PPC64LE_LINUX",
    logo: "ppc64le.png",
    fileExtension: ".tar.gz",
    requirements: "GLIBC 2.5 and above",
    architecture: "64",
    osDetectionString: "not-to-be-detected"
  },
  /*{
    officialName: "Linux arm",
    searchableName: "ARM_LINUX",
    logo: "linux.png",
    fileExtension: ".tar.gz",
    requirements: "GLIBC 2.5 and above",
    architecture: "64",
    osDetectionString: "not-to-be-detected"
  },*/
  /*{
    officialName: "Windows x86-64",
    searchableName: "WIN",
    logo: "windows.png",
    fileExtension: ".zip",
    requirements: "VS 2010 and above",
    architecture: "64",
    osDetectionString: "Windows Win Cygwin"
  }*/
  {
    officialName: "macOS x86-64",
    searchableName: "X64_MAC",
    logo: "mac.png",
    fileExtension: ".tar.gz",
    requirements: "macOS 10.8 and above",
    architecture: "64",
    osDetectionString: "Mac OS X OSX macOS Macintosh"
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
  var platform = null;
  platforms.forEach(function(eachPlatform) {
    if(filename.indexOf(eachPlatform.searchableName) >= 0) {
      platform = eachPlatform.searchableName;
    }
  });
  if(platform) {
    return (lookup[platform].searchableName);
  }
  else {
    return null;
  }
}

// set path to logos
var logoPath = "./dist/assets/";

// gets the OFFICIAL NAME when you pass in 'searchableName'
function getOfficialName(searchableName) {
  return (lookup[searchableName].officialName);
}

// gets the FILE EXTENSION when you pass in 'searchableName'
function getFileExt(searchableName) {
  return (lookup[searchableName].fileExtension);
}

// gets the LOGO WITH PATH when you pass in 'searchableName'
function getLogo(searchableName) {
  return (logoPath + (lookup[searchableName].logo));
}

// gets the PLATFORM REQUIREMENTS when you pass in 'searchableName'
function getRequirements(searchableName) {
  return (lookup[searchableName].requirements);
}

// set value for loading dots on every page
var loading = document.getElementById("loading");

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
function loadReleasesJSON(repo, filename, callback) {
  if(msieversion() == true) { // if the browser is IE, display an error with advice, because important website features do not work in IE.
    loading.innerHTML = "";
    document.getElementById("error-container").innerHTML = "<p>Internet Explorer is not supported. Please use another browser, or see the <a href='https://github.com/AdoptOpenJDK/openjdk-releases/releases' target='blank'>releases list on GitHub</a>.</p>";
  }
  else {
    var url = ("https://raw.githubusercontent.com/AdoptOpenJDK/openjdk-" + repo + "/master/" + filename + ".json"); // the URL of the JSON built in the website back-end
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

// set variables for HTML elements
var platformDropDown = document.getElementById("platform-dropdown");
var archiveTableBody = document.getElementById("archive-table-body");

// When releases page loads, run:
/* eslint-disable no-unused-vars */
function onArchiveLoad() {
  /* eslint-enable no-unused-vars */
  populateArchive(); // populate the Archive page
}

// ARCHIVE PAGE FUNCTIONS

function populateArchive() {

  // call the XmlHttpRequest function in global.js, passing in 'releases' as the repo, and a long function as the callback.
  loadReleasesJSON("releases", "releases", function(response) {
    function checkIfProduction(x) { // used by the array filter method below.
      return x.prerelease === false && x.assets[0];
    }

    // Step 1: create a JSON from the XmlHttpRequest response
    // Step 2: filter out all releases from this JSON that are marked as 'pre-release' in GitHub.
    var releasesJson = JSON.parse(response).filter(checkIfProduction);

    // if there are releases prior to the 'latest' one (i.e. archived releases)...
    if (typeof releasesJson[0] !== 'undefined') {
      buildArchiveHTML(releasesJson);
    } else { // if there are no releases (beyond the latest one)...
      // report an error, remove the loading dots
      loading.innerHTML = "";
      errorContainer.innerHTML = "<p>There are no archived releases yet! See the <a href='./releases.html'>Latest release</a> page.</p>";
    }
  });
}

function buildArchiveHTML(releasesJson) {
  // for each release...
  releasesJson.forEach(function(eachRelease) {

    // set values for this release, ready to inject into HTML
    var publishedAt = eachRelease.published_at;
    var thisReleaseName = eachRelease.name;
    var thisReleaseDate = moment(publishedAt).format('Do MMMM YYYY');
    var thisGitLink = ("https://github.com/AdoptOpenJDK/openjdk-releases/releases/tag/" + thisReleaseName);
    var thisTimestamp = (publishedAt.slice(0, 4) + publishedAt.slice(8, 10) + publishedAt.slice(5, 7) + publishedAt.slice(11, 13) + publishedAt.slice(14, 16));
    var platformTableRows = ""; // an empty var where new table rows can be added for each platform

    // create an array of the details for each asset that is attached to this release
    var assetArray = [];
    eachRelease.assets.forEach(function(each) {
      assetArray.push(each);
    });

    // populate 'platformTableRows' with one row per binary for this release...
    assetArray.forEach(function(eachAsset) {
      var nameOfFile = (eachAsset.name);
      var uppercaseFilename = nameOfFile.toUpperCase(); // make the name of the asset uppercase
      var thisPlatform = getSearchableName(uppercaseFilename); // get the searchableName, e.g. MAC or X64_LINUX.

      // firstly, check if the platform name is recognised...
      if(thisPlatform) {

        // secondly, check if the file has the expected file extension for that platform...
        // (this filters out all non-binary attachments, e.g. SHA checksums - these contain the platform name, but are not binaries)
        var thisFileExtension = getFileExt(thisPlatform); // get the file extension associated with this platform
        if(uppercaseFilename.indexOf((thisFileExtension.toUpperCase())) >= 0) {

          // set values ready to be injected into the HTML
          var thisOfficialName = getOfficialName(thisPlatform);
          var thisBinaryLink = (eachAsset.browser_download_url);
          var thisBinarySize = Math.floor((eachAsset.size)/1024/1024);
          var thisChecksumLink = (eachAsset.browser_download_url).replace(thisFileExtension, ".sha256.txt");

          // prepare a fully-populated table row for this platform
          platformTableRows += ("<tr class='platform-row "+ thisPlatform +"'><td>"+ thisOfficialName +"</td><td><a class='grey-button no-underline' href='"+ thisBinaryLink +"'>"+ thisFileExtension +" ("+ thisBinarySize +" MB)</a></td><td><a href='"+ thisChecksumLink +"' class='dark-link'>Checksum</a></td></tr>");
        }
      }
    });

    // create a new table row containing all release information, and the completed platform/binary table
    var newArchiveContent = ("<tr class='release-row'><td class='blue-bg'><div><h1><a href='"+ thisGitLink +"' class='light-link' target='_blank'>"+ thisReleaseName +"</a></h1><h4>"+ thisReleaseDate +"</h4></div></td><td><table class='archive-platforms'>"+ platformTableRows +"</table></td><td class='archive-details'><!--<div><strong><a href='' class='dark-link'>Changelog</a></strong></div>--><div><strong>Timestamp: </strong>"+ thisTimestamp +"</div><!--<div><strong>Build number: </strong></div>--><!--<div><strong>Commit: </strong><a href='' class='dark-link'></a></div>--></td></tr>");

    archiveTableBody.innerHTML += newArchiveContent;

  });

  loading.innerHTML = ""; // remove the loading dots

  // show the archive list and filter box, with fade-in animation
  var archiveList = document.getElementById('archive-list');
  var filterContainer = document.getElementById('filter-container');
  archiveList.className = archiveList.className.replace( /(?:^|\s)hide(?!\S)/g , ' animated fadeIn ' );
  filterContainer.className = filterContainer.className.replace( /(?:^|\s)hide(?!\S)/g , ' animated fadeIn ' );

  // add a new entry to the platform filter drop-down list for each entry in the global 'platforms' array.
  platforms.forEach(function(each) {
    var op = new Option();
    op.value = each.searchableName;
    op.text = each.officialName;
    platformDropDown.options.add(op);
  });

  // when the user selects a new platform filter, run the filterByPlatform function, passing in the value of the selection.
  platformDropDown.onchange = function(){
    filterByPlatform(this.value);
  };
}

// create an array that contains all of the drop-down list options, including 'ALL'.
function buildDropdownArray() {
  var dropdownArray = [];
  for (i = 0; i < platformDropDown.options.length; i++) {
    dropdownArray.push(platformDropDown.options[i].value);
  }
  return dropdownArray;
}

// filters the platform rows and release rows based on a selected platform.
// pass in the 'searchableName' value of an object in the 'platforms' array, e.g. X64_LINUX
function filterByPlatform(selection) {
  var dropdownArray = buildDropdownArray(); // get an array of the items in the dropdown platform selector
  var index = dropdownArray.indexOf(selection); // find the index number of the selected platform in this array
  dropdownArray.splice(index, 1); // remove this selected platform from the array
  var notSelectedArray = dropdownArray; // create a new 'not selected' array (for clarity only)

  // if the first, default entry ('All', or equivalent) is selected...
  if(index == 0){
    var thisPlatformRowArray = document.getElementsByClassName("platform-row"); // create an array containing all of the platform rows
    for (i = 0; i < thisPlatformRowArray.length; i++) {
      thisPlatformRowArray[i].className = thisPlatformRowArray[i].className.replace( /(?:^|\s)hide(?!\S)/g , '' ); // un-hide all of these rows
    }

    var releaseRows = archiveTableBody.getElementsByClassName("release-row"); // create an array containing all of the release rows
    for (i = 0; i < releaseRows.length; i++) {
      releaseRows[i].className = releaseRows[i].className.replace( /(?:^|\s)hide(?!\S)/g , '' ); // un-hide all of these rows
    }
  }
  // else, if a specific platform is selected...
  else {
    /* eslint-disable */
    var thisPlatformRowArray = document.getElementsByClassName(selection); // create an array containing all of the selected platform's rows
    /* eslint-enable */
    for (i = 0; i < thisPlatformRowArray.length; i++) {
      thisPlatformRowArray[i].className = thisPlatformRowArray[i].className.replace( /(?:^|\s)hide(?!\S)/g , '' ); // make sure that these rows are not hidden
    }

    notSelectedArray.splice(0, 1); // remove the first, default entry ('All', or equivalent) to leave just the platforms that have not been selected

     // for each of the non-selected platforms...
    notSelectedArray.forEach(function(thisPlatform) {
      /* eslint-disable */
      var thisPlatformRowArray = document.getElementsByClassName(thisPlatform); // create an array containing all of this platform's rows
      /* eslint-enable */

      for (i = 0; i < thisPlatformRowArray.length; i++) {
        thisPlatformRowArray[i].className += " hide"; // hide all of the rows for this platform
      }
    });

    /* eslint-disable */
    var releaseRows = archiveTableBody.getElementsByClassName("release-row"); // create an array containing all of the release rows
    /* eslint-enable */

    // for each of the release rows...
    for (i = 0; i < releaseRows.length; i++) {
      var platformBox = releaseRows[i].getElementsByTagName("TD")[1]; // get the second <td> element in this row (the one that contains the platforms)
      var numberOfPlatformRows = platformBox.getElementsByTagName("TR").length; // get the number of platform rows
      var numberOfHiddenPlatformRows = platformBox.getElementsByClassName(" hide").length; // get the number of hidden platform rows
      if(numberOfPlatformRows == numberOfHiddenPlatformRows) { // if ALL of the platform rows are hidden...
        if(releaseRows[i].className.indexOf("hide") == -1){ // and if this release row isn't ALREADY hidden...
          releaseRows[i].className += " hide"; // hide this release row
        }
      }
      else { // else, if there is at least one visible platform row...
        releaseRows[i].className = releaseRows[i].className.replace( /(?:^|\s)hide(?!\S)/g , '' ); // make sure that this release row isn't hidden
      }
    }


  }
}

// set variables for all index page HTML elements that will be used by the JS
const dlText = document.getElementById('dl-text');
const dlLatest = document.getElementById('dl-latest');
const dlArchive = document.getElementById('dl-archive');
const dlOther = document.getElementById('dl-other');
const dlIcon = document.getElementById('dl-icon');
const dlIcon2 = document.getElementById('dl-icon-2');
const dlVersionText = document.getElementById('dl-version-text');

// When index page loads, run:
/* eslint-disable no-unused-vars */
function onIndexLoad() {
  setDownloadSection(); // on page load, populate the central download section.
}
/* eslint-enable no-unused-vars */

// INDEX PAGE FUNCTIONS

function setDownloadSection() {
  // call the XmlHttpRequest function in global.js, passing in 'releases' as the repo, and a long function as the callback.
  loadReleasesJSON("releases", "latest_release", function(response) {
    var releasesJson = JSON.parse(response);

    if (typeof releasesJson !== 'undefined') { // if there are releases...
      buildHomepageHTML(releasesJson);
    }
    else {
      // report an error
      errorContainer.innerHTML = "<p>Error... no releases have been found!</p>";
      loading.innerHTML = ""; // remove the loading dots
    }
  });
}

function buildHomepageHTML(releasesJson) {
  // set the download button's version number to the latest release
  dlVersionText.innerHTML = releasesJson.tag_name;

  // create an array of the details for each binary that is attached to a release
  var assetArray = [];
  // create a new array that contains each 'asset' (binary) from the latest release:
  releasesJson.assets.forEach(function(each) {
    assetArray.push(each);
  });

  var OS = detectOS(); // set a variable as an object containing all information about the user's OS (from the global.js 'platforms' array)
  var matchingBinary = null;

  // if the OS has been detected...
  if(OS) {
    assetArray.forEach(function(eachAsset) {  // iterate through the assets attached to this release
      var nameOfFile = eachAsset.name;
      var uppercaseFilename = nameOfFile.toUpperCase();
      var thisPlatform = getSearchableName(uppercaseFilename); // get the searchableName, e.g. X64_MAC or X64_LINUX.

      // firstly, check if a valid searchableName has been returned (i.e. the platform is recognised)...
      if(thisPlatform) {

        // secondly, check if the file has the expected file extension for that platform...
        // (this filters out all non-binary attachments, e.g. SHA checksums - these contain the platform name, but are not binaries)
        var thisFileExtension = getFileExt(thisPlatform); // get the file extension associated with this platform
        if(uppercaseFilename.indexOf((thisFileExtension.toUpperCase())) >= 0) {
          var uppercaseOSname = OS.searchableName.toUpperCase();

          // thirdly, check if the user's OS searchableName string matches part of this binary's name (e.g. ...X64_LINUX...)
          if(uppercaseFilename.indexOf(uppercaseOSname) >= 0) {
            matchingBinary = eachAsset; // set the matchingBinary variable to the object containing this binary
          }
        }
      }
    });
  }

  // if there IS a matching binary for the user's OS...
  if(matchingBinary) {
    dlLatest.href = matchingBinary.browser_download_url; // set the main download button's link to be the binary's download url
    dlText.innerHTML = ("Download for " + OS.officialName); // set the text to be OS-specific, using the full OS name.
    var thisBinarySize = Math.floor((matchingBinary.size)/1024/1024);
    dlVersionText.innerHTML += (" - " + thisBinarySize + " MB");
  }
  // if there is NOT a matching binary for the user's OS...
  else {
    dlOther.className += " hide"; // hide the 'Other platforms' button
    dlIcon.className += " hide"; // hide the download icon on the main button, to make it look less like you're going to get a download immediately
    dlIcon2.className = dlIcon2.className.replace( /(?:^|\s)hide(?!\S)/g , '' ); // un-hide an arrow-right icon to show instead
    dlText.innerHTML = ("Downloads"); // change the text to be generic: 'Downloads'.
    dlLatest.href = "./releases.html"; // set the main download button's link to the latest releases page for all platforms.
  }

  // remove the loading dots, and make all buttons visible, with animated fade-in
  loading.innerHTML = "";
  dlLatest.className = dlLatest.className.replace( /(?:^|\s)invisible(?!\S)/g , ' animated ' );
  dlOther.className = dlOther.className.replace( /(?:^|\s)invisible(?!\S)/g , ' animated ' );
  dlArchive.className = dlArchive.className.replace( /(?:^|\s)invisible(?!\S)/g , ' animated ' );

  dlLatest.onclick = function() {
    document.getElementById('installation-link').className += " animated pulse infinite transition-bright";
  };

  // animate the main download button shortly after the initial animation has finished.
  setTimeout(function(){
    dlLatest.className = "dl-button a-button animated pulse";
  }, 1000);
}

// set variables for HTML elements
var tableHead = document.getElementById("table-head");
var tableContainer = document.getElementById("nightly-list");
var nightlyList = document.getElementById("nightly-table");
var searchError = document.getElementById("search-error");

// When nightly page loads, run:
/* eslint-disable no-unused-vars */
function onNightlyLoad() {
  /* eslint-enable no-unused-vars */

  populateNightly(); // run the function to populate the table on the Nightly page.

}


// NIGHTLY PAGE FUNCTIONS

function populateNightly() {
  // call the XmlHttpRequest function in global.js, passing in 'nightly' as the repo, and a long function as the callback.
  loadReleasesJSON("nightly", "nightly", function(response) {
    function checkIfProduction(x) { // used by the array filter method below.
      return x.prerelease === false && x.assets[0];
    }

    // Step 1: create a JSON from the XmlHttpRequest response
    // Step 2: filter out all releases from this JSON that are marked as 'pre-release' in GitHub.
    var releasesJson = JSON.parse(response).filter(checkIfProduction);

    // if there are releases...
    if (typeof releasesJson[0] !== 'undefined') {
      buildNightlyHTML(releasesJson);
    } else { // if there are no releases...
      // report an error
      errorContainer.innerHTML = "<p>Error... no releases have been found!</p>";
      loading.innerHTML = ""; // remove the loading dots
    }

    setSearchLogic();

  });
}

function buildNightlyHTML(releasesJson) {
  loading.innerHTML = ""; // remove the loading dots

  // for each release...
  var tableRowCounter = 0;

  tableHead.innerHTML = ("<tr id='table-header'><th>Release</th><th>Platform</th><th>Downloads</th><th>Release details</th></tr>");

  releasesJson.forEach(function(eachRelease) {

    // create an array of the details for each binary that is attached to a release
    var assetArray = [];
    eachRelease.assets.forEach(function(each) {
      assetArray.push(each);
    });

    // build rows with the array of binaries...
    assetArray.forEach(function(eachAsset) {  // for each file attached to this release...

      var nameOfFile = (eachAsset.name);
      var uppercaseFilename = nameOfFile.toUpperCase(); // make the name of the file uppercase
      var thisPlatform = getSearchableName(uppercaseFilename); // get the searchableName, e.g. MAC or X64_LINUX.

      // firstly, check if the platform name is recognised...
      if(thisPlatform) {

        // secondly, check if the file has the expected file extension for that platform...
        // (this filters out all non-binary attachments, e.g. SHA checksums - these contain the platform name, but are not binaries)
        var thisFileExtension = getFileExt(thisPlatform); // get the file extension associated with this platform
        if(uppercaseFilename.indexOf((thisFileExtension.toUpperCase())) >= 0) {

          // get the current content of the nightly list div
          var currentNightlyContent = nightlyList.innerHTML;

          // add an empty, hidden HTML template entry to the current nightly list, with the tableRowCounter suffixed to every ID
          // to change the HTML of the nightly table rows/cells, you must change this template.
          var newNightlyContent = currentNightlyContent += ("<tr class='nightly-container hide' id='"+tableRowCounter+"'> <td class='nightly-header'> <div><strong><a href='' id='nightly-release"+tableRowCounter+"' class='dark-link' target='_blank'></a></strong></div> <div class='divider'> | </div> <div id='nightly-date"+tableRowCounter+"'></div> </td> <td id='platform-block"+tableRowCounter+"' class='nightly-platform-block'></td> <td id='downloads-block"+tableRowCounter+"' class='nightly-downloads-block'><div id='nightly-dl-content"+tableRowCounter+"'><a class='dark-link' href='' id='nightly-dl"+tableRowCounter+"'></a> <div class='divider'> | </div> <a href='' class='dark-link' id='nightly-checksum"+tableRowCounter+"'>Checksum</a> </div></td> <td class='nightly-details'> <!--<div><strong><a href='' class='dark-link' id='nightly-changelog"+tableRowCounter+"'>Changelog</a></strong></div> <div class='divider'> | </div>--> <div><strong>Timestamp: </strong><span id='nightly-timestamp"+tableRowCounter+"'></span></div> <!--<div class='divider'> | </div> <div><strong>Build number: </strong><span id='nightly-buildnumber"+tableRowCounter+"'></span></div>--> <!--<div class='divider'> | </div> <div><strong>Commit: </strong><a href='' class='dark-link' id='nightly-commitref"+tableRowCounter+"'></a></div>--> </td> </tr>");

          // update the HTML container element with this new, blank, template row (hidden at this stage)
          nightlyList.innerHTML = newNightlyContent;

          // set variables for HTML elements.
          var dlButton = document.getElementById("nightly-dl"+tableRowCounter);
          //var dlContent = document.getElementById("nightly-dl-content"+tableRowCounter);

          // populate this new row with the release information
          var publishedAt = (eachRelease.published_at);
          document.getElementById("nightly-release"+tableRowCounter).innerHTML = (eachRelease.name).slice(0, 12); // the release name, minus the timestamp
          document.getElementById("nightly-release"+tableRowCounter).href = ("https://github.com/AdoptOpenJDK/openjdk-nightly/releases/tag/" + eachRelease.name) // the link to that release on GitHub
          document.getElementById("nightly-date"+tableRowCounter).innerHTML = moment(publishedAt).format('Do MMMM YYYY'); // the timestamp converted into a readable date
          //document.getElementById("nightly-changelog"+tableRowCounter).href = eachRelease.name; // TODO: WAITING FOR THE LINKS TO BE AVAILABLE. the link to the release changelog
          document.getElementById("nightly-timestamp"+tableRowCounter).innerHTML = (eachRelease.name).slice(13, 25); // the timestamp section of the build name
          //document.getElementById("nightly-buildnumber"+tableRowCounter).innerHTML = eachRelease.id; // TODO: currently this is the release ID
          //document.getElementById("nightly-commitref"+tableRowCounter).innerHTML = eachRelease.name; // TODO: WAITING FOR THE INFO TO BE AVAILABLE.
          //document.getElementById("nightly-commitref"+tableRowCounter).href = eachRelease.name; // TODO: WAITING FOR THE LINKS TO BE AVAILABLE.

          // get the official name, e.g. Linux x86-64, and display it in this new row
          var officialName = getOfficialName(thisPlatform);
          document.getElementById("platform-block"+tableRowCounter).innerHTML = officialName;

          // set the download section for this new row
          dlButton.innerHTML = (thisFileExtension + " (" + (Math.floor((eachAsset.size)/1024/1024)) + " MB)"); // display the file type and the file size
          document.getElementById("nightly-checksum"+tableRowCounter).href = (eachAsset.browser_download_url).replace(thisFileExtension, ".sha256.txt"); // set the checksum link (relies on the checksum having the same name as the binary, but .sha256.txt extension)
          var link = (eachAsset.browser_download_url);
          dlButton.href = link; // set the download link

          // show the new row, with animated fade-in
          var trElement = document.getElementById(tableRowCounter);
          trElement.className = trElement.className.replace( /(?:^|\s)hide(?!\S)/g , ' animated fadeIn ' );

          tableRowCounter++;
        }
      }
    });
  });

  // if the table has a scroll bar, show text describing how to horizontally scroll
  var scrollText = document.getElementById('scroll-text');
  var tableDisplayWidth = document.getElementById('nightly-list').clientWidth;
  var tableScrollWidth = document.getElementById('nightly-list').scrollWidth;
  if (tableDisplayWidth != tableScrollWidth) {
    scrollText.className = scrollText.className.replace( /(?:^|\s)hide(?!\S)/g , '' );
  }
}

function setSearchLogic() {
  // logic for the realtime search box...
  /* eslint-disable */
  var $rows = $('#nightly-table tr');
  $('#search').keyup(function() {
    var val = '^(?=.*' + $.trim($(this).val()).split(/\s+/).join(')(?=.*') + ').*$',
        reg = RegExp(val, 'i'),
        text;

    $rows.show().filter(function() {
        text = $(this).text().replace(/\s+/g, ' ');
        return !reg.test(text);
    }).hide();

    if(document.getElementById('table-parent').offsetHeight < 45) {
      tableContainer.style.visibility = "hidden";
      searchError.className = "";
    } else {
      tableContainer.style.visibility = "";
      searchError.className = "hide";
    }
  });
  /* eslint-enable */
}

// When releases page loads, run:
/* eslint-disable no-unused-vars */
function onLatestLoad() {
  /* eslint-enable no-unused-vars */
    populateLatest(); // populate the Latest page
}

// LATEST PAGE FUNCTIONS

function populateLatest() {

  // call the XmlHttpRequest function in global.js, passing in 'releases' as the repo, and a long function as the callback.
  loadReleasesJSON("releases", "latest_release", function(response) {
    var releasesJson = JSON.parse(response);

    if (typeof releasesJson !== 'undefined') { // if there are releases...
      buildLatestHTML(releasesJson);
    }
    else {
      // report an error
      errorContainer.innerHTML = "<p>Error... no releases have been found!</p>";
      loading.innerHTML = ""; // remove the loading dots
    }
  });
}

function buildLatestHTML(releasesJson) {
  // populate the page with the release's information
  var publishedAt = (releasesJson.published_at);
  document.getElementById("latest-build-name").innerHTML = releasesJson.name;
  document.getElementById("latest-build-name").href = ("https://github.com/AdoptOpenJDK/openjdk-releases/releases/tag/" + releasesJson.name);
  document.getElementById("latest-date").innerHTML = moment(publishedAt).format('Do MMMM YYYY');
  //document.getElementById("latest-changelog").href = releasesJson.name;
  document.getElementById("latest-timestamp").innerHTML = (publishedAt.slice(0, 4) + publishedAt.slice(8, 10) + publishedAt.slice(5, 7) + publishedAt.slice(11, 13) + publishedAt.slice(14, 16));
  //document.getElementById("latest-buildnumber").innerHTML = releasesJson.id;
  //document.getElementById("latest-commitref").innerHTML = releasesJson.name;
  //document.getElementById("latest-commitref").href = releasesJson.name;

  // create an array of the details for each asset that is attached to a release
  var assetArray = [];
  releasesJson.assets.forEach(function(each) {
    assetArray.push(each);
  });

  // for each asset attached to this release, check if it's a valid binary, then add a download block for it...
  assetArray.forEach(function(eachAsset) {
    var nameOfFile = (eachAsset.name);
    var uppercaseFilename = nameOfFile.toUpperCase(); // make the name of the asset uppercase
    var thisPlatform = getSearchableName(uppercaseFilename); // get the searchableName, e.g. MAC or X64_LINUX.

    // firstly, check if the platform name is recognised...
    if(thisPlatform) {

      // secondly, check if the file has the expected file extension for that platform...
      // (this filters out all non-binary attachments, e.g. SHA checksums - these contain the platform name, but are not binaries)
      var thisFileExtension = getFileExt(thisPlatform); // get the file extension associated with this platform
      if(uppercaseFilename.indexOf((thisFileExtension.toUpperCase())) >= 0) {

        // set values ready to be injected into the HTML
        var thisLogo = getLogo(thisPlatform);
        var thisOfficialName = getOfficialName(thisPlatform);
        var thisBinaryLink = (eachAsset.browser_download_url);
        var thisBinarySize = Math.floor((eachAsset.size)/1024/1024);
        var thisChecksumLink = (eachAsset.browser_download_url).replace(thisFileExtension, ".sha256.txt");
        var thisRequirements = getRequirements(thisPlatform);

        // get the current content of the latest downloads container div
        var latestContainer = document.getElementById("latest-downloads-container");
        var currentLatestContent = latestContainer.innerHTML;

        // prepare a fully-populated HTML block for this platform
        var newLatestContent = currentLatestContent += ("<div id='latest-"+ thisPlatform +"' class='latest-block'><div class='latest-platform'><img src='"+ thisLogo +"'><div>"+ thisOfficialName +"</div></div><a href='"+ thisBinaryLink +"' class='latest-download-button a-button' id='linux-dl-button'><div>Download <div class='small-dl-text'>"+ thisFileExtension +" - "+ thisBinarySize +" MB</div></div></a><div class='latest-details'><p><a href='"+ thisChecksumLink +"' class='dark-link' id='latest-checksum-"+ thisPlatform +"' target='_blank'>Checksum</a></p><p><strong>Requirements:</strong><br>"+ thisRequirements +"</p></ul></div></div>");

        // update the latest downloads container with this new platform block
        latestContainer.innerHTML = newLatestContent;
      }
    }
  });

  loading.innerHTML = ""; // remove the loading dots

  const latestContainer = document.getElementById("latest-container");
  latestContainer.className = latestContainer.className.replace( /(?:^|\s)invisible(?!\S)/g , ' animated fadeIn ' ); // make this section visible (invisible by default), with animated fade-in
}
