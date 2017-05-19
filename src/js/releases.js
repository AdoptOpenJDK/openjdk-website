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
  document.getElementById("latest-timestamp").innerHTML = (publishedAt.slice(0, 4) + publishedAt.slice(8, 10) + publishedAt.slice(5, 7) + publishedAt.slice(11, 13) + publishedAt.slice(14, 16));
  //document.getElementById("latest-changelog").href = releasesJson.name;
  //document.getElementById("latest-commitref").innerHTML = releasesJson.name;
  //document.getElementById("latest-commitref").href = releasesJson.name;

  // create an array of the details for each asset that is attached to a release
  var assetArray = [];
  releasesJson.assets.forEach(function(each) {
    assetArray.push(each);
  });

  var latestSelectorHTML = "";
  var latestInfoHTML = "";

  buildInstallerArray(assetArray);

  // for each asset attached to this release, check if it's a valid binary, then add a download block for it...
  assetArray.forEach(function(eachAsset) {
    var nameOfFile = (eachAsset.name);
    var uppercaseFilename = nameOfFile.toUpperCase(); // make the name of the asset uppercase
    var thisPlatform = getSearchableName(uppercaseFilename); // get the searchableName, e.g. MAC or X64_LINUX.

    // firstly, check if the platform name is recognised...
    if(thisPlatform) {

      // secondly, check if this file is a binary by testing for the expected binary extension for that platform...
      // (this filters out all non-binary attachments, e.g. SHA checksums - these contain the platform name, but are not binaries)
      var thisFileExtension = getFileExt(thisPlatform); // get the file extension associated with this platform
      if(uppercaseFilename.indexOf((thisFileExtension.toUpperCase())) >= 0) {

        // set values ready to be injected into the HTML
        var thisLogo = getLogo(thisPlatform);
        var thisOfficialName = getOfficialName(thisPlatform);
        var thisBinaryLink = (eachAsset.browser_download_url);
        var thisBinarySize = Math.floor((eachAsset.size)/1024/1024);
        var thisChecksumLink = (eachAsset.browser_download_url).replace(thisFileExtension, ".sha256.txt");
        var thisInstallerBlock = getInstallerHTML(thisPlatform);
        if(!thisInstallerBlock) {
          thisInstallerBlock = "";
        }

        // prepare a fully-populated HTML block for this platform
        latestSelectorHTML += ("<td id='latest-selector-" +thisPlatform+ "' onclick='selectLatestPlatform(\"" +thisPlatform+ "\")'><img src='" +thisLogo+ "'><span>" +thisOfficialName+ "</span></td>");
        latestInfoHTML += ("<td id='latest-info-" +thisPlatform+ "' class='hide'><img src='" +thisLogo+ "'><h2>" +thisOfficialName+ "</h2>" +thisInstallerBlock+ "<div class='latest-block'><span>Binary</span><a href='" +thisBinaryLink+ "' class='latest-download-button a-button'><div>Download<div class='small-dl-text'>" +thisFileExtension+ " - " +thisBinarySize+ " MB</div></div></a><a href='" +thisChecksumLink+ "' class='latest-checksum-button a-button grey-button'>Checksum</a></div></td>");

        // update the latest downloads container with this new platform block
      }
    }
  });

  console.log(installerArray);

  document.getElementById("latest-selector").innerHTML = latestSelectorHTML;
  document.getElementById("latest-info").innerHTML = latestInfoHTML;

  loading.innerHTML = ""; // remove the loading dots

  const latestContainer = document.getElementById("latest-container");
  latestContainer.className = latestContainer.className.replace( /(?:^|\s)invisible(?!\S)/g , ' animated fadeIn ' ); // make this section visible (invisible by default), with animated fade-in

  // if the table has a scroll bar, show text describing how to horizontally scroll
  var scrollText = document.getElementById('latest-scroll-text');
  var tableDisplayWidth = document.getElementById('latest-selector').clientWidth;
  var tableScrollWidth = document.getElementById('latest-selector').scrollWidth;
  if (tableDisplayWidth != tableScrollWidth) {
    scrollText.className = scrollText.className.replace( /(?:^|\s)hide(?!\S)/g , '' );
  }
}

/* eslint-disable no-unused-vars */
function selectLatestPlatform(thisPlatform) {
/* eslint-enable no-unused-vars */
  var platformButtons = document.getElementById("latest-selector").getElementsByTagName("TD");
  var platformInfoBoxes = document.getElementById("latest-info").getElementsByTagName("TD");

  for (i = 0; i < platformButtons.length; i++) {
    platformButtons[i].classList.remove("latest-highlight");
    platformInfoBoxes[i].classList.add("hide");
  }

  var thisPlatformSelector = document.getElementById("latest-selector-" + thisPlatform);
  var thisPlatformInfo = document.getElementById("latest-info-" + thisPlatform);

  thisPlatformSelector.classList.add("latest-highlight");
  thisPlatformInfo.classList.remove("hide");
}

var installerArray = [];
function buildInstallerArray(assetArray) {
  // for each asset attached to this release, check if it is a valid installer, and add it to installerArray.
  assetArray.forEach(function(eachAsset) {
    var nameOfFile = (eachAsset.name);
    var uppercaseFilename = nameOfFile.toUpperCase(); // make the name of the asset uppercase
    var thisPlatform = getSearchableName(uppercaseFilename); // get the searchableName, e.g. MAC or X64_LINUX.

    // firstly, check if the platform name is recognised...
    if(thisPlatform) {
      // secondly, check if this file is an installer by testing for the expected installer file extension (e.g. .exe)
      // If it does, prepare an HTML 'installer' block and add it to an array of installers.
      var thisInstallerExtension = getInstallerExt(thisPlatform); // get the file extension associated with this platform
      if(uppercaseFilename.indexOf((thisInstallerExtension.toUpperCase())) >= 0) {
        // create an object containing 1) the platform searchableName and 2) a pre-populated HTML block
        var thisInstallerLink = (eachAsset.browser_download_url);
        var thisInstallerSize = Math.floor((eachAsset.size)/1024/1024);
        var thisInstallerBlock = ("<div class='latest-block'><span>Installer</span><a href='" +thisInstallerLink+ "' class='latest-download-button a-button'><div>Download<div class='small-dl-text'>" +thisInstallerExtension+ " - " +thisInstallerSize+ " MB</div></div></a></div>");

        var installerObject = new Object();
        installerObject.searchableName = thisPlatform;
        installerObject.html = thisInstallerBlock;

        // add this new object to installerArray
        installerArray.push(installerObject);
      }
    }
  });
}

// gets the INSTALLER HTML when you pass in 'searchableName'
function getInstallerHTML(searchableName) {
  var lookupInstaller = {};
  for (var i = 0, len = installerArray.length; i < len; i++) {
      lookupInstaller[installerArray[i].searchableName] = installerArray[i];
  }
  return (lookupInstaller[searchableName].html);
}
