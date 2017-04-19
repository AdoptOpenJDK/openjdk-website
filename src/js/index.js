// When index page loads, run:
/* eslint-disable no-unused-vars */
function onIndexLoad() {
  setDownloadSection(); // on page load, populate the central download section.
}
/* eslint-enable no-unused-vars */

// INDEX PAGE FUNCTIONS

//
function setDownloadSection() {
  // set variables for all index page HTML elements that will be used by the JS
  const dlText = document.getElementById('dl-text');
  const dlLatest = document.getElementById('dl-latest');
  const dlArchive = document.getElementById('dl-archive');
  const dlOther = document.getElementById('dl-other');
  const dlVersionText = document.getElementById('dl-version-text');
  const loadingSpan = document.getElementById('loading-index');

  var OS = detectOS(); // set a variable as the user's OS

  var latestLink = ""; // reset the variable for the latest download button link to be empty.

  // call the XmlHttpRequest function in global.js, passing in 'releases' as the repo, and a long function as the callback.
  loadReleasesJSON("releases", "latest_release", loadingSpan, function(response) {
    var releasesJson = JSON.parse(response);

    // if there are releases...
    if (typeof releasesJson !== 'undefined') {
      var newHTML = ""; // set the variable to be an empty string.

      // set the download button's version number to the latest release
      newHTML = (releasesJson.tag_name);
      dlVersionText.innerHTML = newHTML;

      // create an array of the details for each binary that is attached to a release
      var assetArray = [];
      var assetCounter = 0;
      // create a new array that contains each 'asset' (binary) from the latest release:
      releasesJson.assets.forEach(function() {
        assetArray.push(releasesJson.assets[assetCounter]);
        assetCounter++;
      });

      // set the 'latestLink' variable to be the download URL of the latest release for the user's OS
      var assetCounter2 = 0;
      assetArray.forEach(function() {     // iterate through the binaries attached to this release
        var nameOfFile = (assetArray[assetCounter2].name);
        // convert the name of the binary file, and the user's OS, to be uppercase:
        var uppercaseFilename = nameOfFile.toUpperCase();
        var uppercaseOSname = OS.toUpperCase();
        if(uppercaseFilename.indexOf(uppercaseOSname) >= 0) { // check if the user's OS string matches part of this binary's name (e.g. ...LINUX...)
          latestLink = (assetArray[assetCounter2].browser_download_url); // set the link variable to be the download URL that matches the user's OS
        }
        assetCounter2++;
      });

      if(latestLink == "") { // if there is no matching binary for the user's OS:
        dlOther.className += " hide"; // hide the 'Other platforms' button
        dlText.innerHTML = ("Downloads"); // change the text to be generic: 'Downloads'.
        latestLink = "./releases.html"; // change the main download button's link, now takes the user to the latest releases page for all platforms.
      }
      else { // if there IS a matching binary for the user's OS:
        var fullOSName = OS; // defaults this variable to be the detected OS name
        if(OS == "Linux") {
          fullOSName = "Linux x86-64"; // add 'x86-64'
        } else if(OS == "Win") {
          fullOSName = "Windows x86-64"; // 'Win' is not user friendly - make it 'Windows'.
        } else if (OS == "Mac") {
          fullOSName = "macOS x86-64"; // 'macOS' is the official OS name.
        }
        dlText.innerHTML = ("Download for " + fullOSName); // set the text to be OS-specific, using the full OS name.
      }

    } else { // if there are no releases:
      errorContainer.innerHTML = "<p>Error... no releases have been found!</p>";
      //dlVersionText.innerHTML = "";
    }

    // set the download button to use the 'latestLink' variable
    dlLatest.href = latestLink;

    // remove the loading dots, and make all buttons visible, with animated fade-in
    loadingSpan.innerHTML = "";
    dlLatest.className += " animated";
    dlOther.className += " animated";
    dlArchive.className += " animated";
    dlLatest.className = dlLatest.className.replace( /(?:^|\s)invisible(?!\S)/g , '' );
    dlOther.className = dlOther.className.replace( /(?:^|\s)invisible(?!\S)/g , '' );
    dlArchive.className = dlArchive.className.replace( /(?:^|\s)invisible(?!\S)/g , '' );

    dlLatest.onclick = function() {
      document.getElementById('installation-link').className += " animated pulse infinite transition-bright";
    };

    // animate the main download button shortly after the initial animation has finished.
    setTimeout(function(){
      dlLatest.className = "dl-button a-button animated pulse";
    }, 1000);

 });

}
