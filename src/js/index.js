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
  // set the download button's version number to the latest build
  dlVersionText.innerHTML = releasesJson.tag_name;

  // create an array of the details for each binary that is attached to a release
  var assetArray = [];
  // create a new array that contains each 'asset' (binary) from the latest build:
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
        var thisBinaryExtension = getFileExt(thisPlatform); // get the file extension associated with this platform
        if(uppercaseFilename.indexOf(thisBinaryExtension.toUpperCase()) >= 0) {
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
    dlLatest.href = "./releases.html"; // set the main download button's link to the latest builds page for all platforms.
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
