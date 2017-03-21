// When index page loads, run:
/* eslint-disable no-unused-vars */
function onIndexLoad() {
  setDownloadSection();
}
/* eslint-enable no-unused-vars */

// INDEX PAGE FUNCTIONS

function setDownloadSection() {
  const dlText = document.getElementById('dl-text');
  const dlLatest = document.getElementById('dl-latest');
  const dlArchive = document.getElementById('dl-archive');
  const dlOther = document.getElementById('dl-other');
  const dlVersionText = document.getElementById('dl-version-text');
  const loadingSpan = document.getElementById('loading-index');

  var OS = detectOS();

  var latestLink = "";
  var loading = loadingSpan;

  loadReleasesJSON("openjdk-releases", loading, function(response) {
    function checkIfProduction(x) {
      return x.prerelease === false && x.assets[0];
    }

    var releasesJson = JSON.parse(response).filter(checkIfProduction);

    if (releasesJson && typeof releasesJson[0] !== 'undefined') {
      var newHTML = "";

      // set the download button's version number to the latest release
      newHTML = (releasesJson[0].tag_name);
      dlVersionText.innerHTML = newHTML;

      // create an array of the details for each binary that is attached to a release
      var assetArray = [];
      var assetCounter = 0;
      releasesJson[0].assets.forEach(function() {
        assetArray.push(releasesJson[0].assets[assetCounter]);
        assetCounter++;
      });

      // set the 'latestLink' variable to be the download URL of the latest release for the user's OS
      var assetCounter2 = 0;
      assetArray.forEach(function() {     // iterate through the binaries attached to this release
        var nameOfFile = (assetArray[assetCounter2].name);
        var a = nameOfFile.toUpperCase();
        var b = OS.toUpperCase();
        //console.log("Your OS: " + b + ". Checking for a match with this file: " + a);
        if(a.indexOf(b) >= 0) { // check if the user's OS string matches part of this binary's name (e.g. ...LINUX...)
          latestLink = (assetArray[assetCounter2].browser_download_url);
        }
        assetCounter2++;
      });

      if(latestLink == "") {
        dlOther.className += " hide";
        dlText.innerHTML = ("Downloads");
        latestLink = "./releases.html";
      } else {
        var fullOSName = OS;
        if(OS == "Win") {
          fullOSName = "Windows";
        } else if (OS == "Mac") {
          fullOSName = "macOS";
        }
        dlText.innerHTML = ("Download for " + fullOSName);
      }

    } else {
      errorContainer.innerHTML = "<p>Error... no releases have been found!</p>";
      //dlVersionText.innerHTML = "";
    }

    // set the download button to use the 'latestLink' variable
    dlLatest.href = latestLink;

    // remove the loading dots, make the buttons visible, with animated fade-in
    loadingSpan.innerHTML = "";
    dlLatest.className += " animated";
    dlOther.className += " animated";
    dlArchive.className += " animated";
    dlLatest.className = dlLatest.className.replace( /(?:^|\s)invisible(?!\S)/g , '' );
    dlOther.className = dlOther.className.replace( /(?:^|\s)invisible(?!\S)/g , '' );
    dlArchive.className = dlArchive.className.replace( /(?:^|\s)invisible(?!\S)/g , '' );

    // animate the main download button
    setTimeout(function(){
      dlLatest.className = "dl-button a-button animated pulse";
    }, 1000);

 });

}
