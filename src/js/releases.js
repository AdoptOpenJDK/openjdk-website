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

  // create an array of the details for each asset that is attached to a release
  var assetArray = [];
  releasesJson.assets.forEach(function(each) {
    assetArray.push(each);
  });

  // create an array containing one object for each platform, ready to be populated with HTML blocks.
  var htmlArray = [];
  platforms.forEach(function(eachPlatform) {
    var obj = new Object();
    obj.searchableName = eachPlatform.searchableName;
    obj.installerBlock = "";
    obj.binaryBlock = "";
    htmlArray.push(obj);
  });

  // create empty variables ready for the generated HTML
  var latestSelectorHTML = "";
  var latestInfoHTML = "";

  // for each asset attached to this release, check if it's a valid binary, then add a download block for it...
  assetArray.forEach(function(eachAsset) {
    var nameOfFile = (eachAsset.name);
    var uppercaseFilename = nameOfFile.toUpperCase(); // make the name of the asset uppercase
    var thisPlatform = getSearchableName(uppercaseFilename); // get the searchableName, e.g. MAC or X64_LINUX.

    // check if the platform name is recognised...
    if(thisPlatform) {

      // get the index of the platform object inside htmlArray that matches the platform of this asset
      var objIndex = htmlArray.findIndex(function(obj) { return obj.searchableName == thisPlatform; });

      // if the filename contains both the platform name and the matching INSTALLER extension, add an HTML block to htmlArray
      var thisInstallerExtension = getInstallerExt(thisPlatform);
      if(uppercaseFilename.indexOf(thisInstallerExtension.toUpperCase()) >= 0) {
        var thisInstallerLink = (eachAsset.browser_download_url);
        var thisInstallerSize = Math.floor((eachAsset.size)/1024/1024);
        htmlArray[objIndex].installerBlock = ("<div class='latest-block'><span>Installer</span><a href='" +thisInstallerLink+ "' class='latest-download-button a-button installer-dl'><div class='large-dl-text'>Download<div class='small-dl-text'>" +thisInstallerExtension+ " - " +thisInstallerSize+ " MB</div></div></a></div>");
      }

      // if the filename contains both the platform name and the matching BINARY extension, add an HTML block to htmlArray
      var thisBinaryExtension = getBinaryExt(thisPlatform);
      if(uppercaseFilename.indexOf(thisBinaryExtension.toUpperCase()) >= 0) {
        var thisBinaryLink = (eachAsset.browser_download_url);
        var thisBinarySize = Math.floor((eachAsset.size)/1024/1024);
        var thisChecksumLink = (eachAsset.browser_download_url).replace(thisBinaryExtension, ".sha256.txt");
        htmlArray[objIndex].binaryBlock = ("<div class='latest-block'><span>Binary</span><a href='" +thisBinaryLink+ "' class='latest-download-button a-button'><div class='large-dl-text'>Download<div class='small-dl-text'>" +thisBinaryExtension+ " - " +thisBinarySize+ " MB</div></div></a><div class='latest-details'><p><a href='" +thisChecksumLink+ "' class='dark-link' target='_blank'>Checksum</a></p></div></div>");
      }

    }
  });

  // iterate through htmlArray, creating HTML for each platform
  htmlArray.forEach(function(eachPlatform) {
    var thisPlatform = eachPlatform.searchableName;
    var thisLogo = getLogo(thisPlatform);
    var thisOfficialName = getOfficialName(thisPlatform);
    var thisInstallerBlock = eachPlatform.installerBlock;
    // if an installer is present, wrap the binary block HTML in a div that gives it grey button styling
    var thisBinaryBlock = "";
    if(thisInstallerBlock != "") {
      thisBinaryBlock = ("<div class='inline-block binary-grey'>" + eachPlatform.binaryBlock + "</div>");
    } else {
      thisBinaryBlock = (eachPlatform.binaryBlock);
    }

    // prepare fully-populated selector and info sections for this platform, append them to the HTML block variables
    latestSelectorHTML += ("<td id='latest-selector-" +thisPlatform+ "' onclick='selectLatestPlatform(\"" +thisPlatform+ "\")'><img alt='" +thisOfficialName+ " logo' src='" +thisLogo+ "'><span>" +thisOfficialName+ "</span></td>");
    latestInfoHTML += ("<td id='latest-info-" +thisPlatform+ "' class='hide'><div class='platform-section'><img alt='" +thisOfficialName+ " logo' src='" +thisLogo+ "'><h2>" +thisOfficialName+ "</h2></div><div class='content-section'>" + thisInstallerBlock + thisBinaryBlock + "</div></td>");
  });

  // add all of the generated HTML to the latest downloads container
  document.getElementById("latest-selector").innerHTML = latestSelectorHTML;
  document.getElementById("latest-info").innerHTML = latestInfoHTML;

  var latestTable = document.getElementById('latest-table');
  var latestSelector = document.getElementById('latest-selector');
  var tableScrollWidth = latestSelector.scrollWidth;
  latestTable.style.display = "block";
  latestTable.style.maxWidth = (tableScrollWidth + "px");

  // if the table has a scroll bar, show text describing how to horizontally scroll
  var scrollText = document.getElementById('latest-scroll-text');
  var tableDisplayWidth = latestSelector.clientWidth;
  if (tableDisplayWidth != tableScrollWidth) {
    scrollText.className = scrollText.className.replace( /(?:^|\s)hide(?!\S)/g , '' );
  }

  loading.innerHTML = ""; // remove the loading dots

  const latestContainer = document.getElementById("latest-container");
  latestContainer.className = latestContainer.className.replace( /(?:^|\s)invisible(?!\S)/g , ' animated fadeIn ' ); // make this section visible (invisible by default), with animated fade-in
}

/* eslint-disable no-unused-vars */
function selectLatestPlatform(thisPlatform) {
/* eslint-enable no-unused-vars */
  var platformButtons = document.getElementById("latest-selector").getElementsByTagName("TD");
  var platformInfoBoxes = document.getElementById("latest-info").getElementsByTagName("TD");

  var thisPlatformSelector = document.getElementById("latest-selector-" + thisPlatform);
  var thisPlatformInfo = document.getElementById("latest-info-" + thisPlatform);

  var alreadySelected = false;
  if(thisPlatformSelector.classList.contains("latest-highlight")) {
    alreadySelected = true;
  }

  for (i = 0; i < platformButtons.length; i++) {
    platformButtons[i].classList.remove("latest-highlight");
    platformInfoBoxes[i].classList.add("hide");
  }

  if(alreadySelected === false) {
    thisPlatformSelector.classList.add("latest-highlight");
    thisPlatformInfo.classList.remove("hide");
  }
}
