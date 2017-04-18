var assetCounter2 = 0;
// When releases page loads, run:
/* eslint-disable no-unused-vars */
function onLatestLoad() {
  /* eslint-enable no-unused-vars */
    populateLatest(); // populate the Latest page
}

// LATEST PAGE FUNCTIONS

function populateLatest() {

  var loading = document.getElementById("latest-loading"); // set variable for the loading dots

  // call the XmlHttpRequest function in global.js, passing in 'releases' as the repo, and a long function as the callback.
  loadReleasesJSON("releases", "latest_release", loading, function(response) {
    var releasesJson = JSON.parse(response);

    // if there are releases...
    if (typeof releasesJson !== 'undefined') {
      // remove the loading dots
      document.getElementById("latest-loading").innerHTML = "";

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
      var assetCounter = 0;
      releasesJson.assets.forEach(function() {
        assetArray.push(releasesJson.assets[assetCounter]);
        assetCounter++;
      });

      // for each asset attached to this release, check if it's a valid binary, then add a download block for it...
      assetCounter2 = 0;
      assetArray.forEach(function() {
        var nameOfFile = (assetArray[assetCounter2].name);
        var uppercaseFilename = nameOfFile.toUpperCase(); // make the name of the asset uppercase
        var thisPlatform = getSearchableName(uppercaseFilename); // get the searchableName, e.g. MAC or X64_LINUX.

        // firstly, check if the platform name is recognised...
        if(thisPlatform != false) {

          // secondly, check if the file has the expected file extension for that platform...
          // (this filters out all non-binary attachments, e.g. SHA checksums - these contain the platform name, but are not binaries)
          var thisFileExtension = getFileExt(thisPlatform); // get the file extension associated with this platform
          if(uppercaseFilename.indexOf((thisFileExtension.toUpperCase())) >= 0) {

            // set values ready to be injected into the HTML
            var thisLogo = getLogo(thisPlatform);
            var thisOfficialName = getOfficialName(thisPlatform);
            var thisBinaryLink = (assetArray[assetCounter2].browser_download_url);
            var thisBinarySize = Math.floor((assetArray[assetCounter2].size)/1024/1024);
            var thisChecksumLink = (assetArray[assetCounter2].browser_download_url).replace(thisFileExtension, ".sha256.txt");
            var thisRequirements = getRequirements(thisPlatform);

            // get the current content of the latest downloads container div
            var latestContainer = document.getElementById("latest-downloads-container");
            var currentLatestContent = latestContainer.innerHTML;

            // prepare a fully-populated HTML block for this platform
            var newLatestContent = currentLatestContent += ("<div id='latest-"+ thisPlatform +"' class='latest-block'><div class='latest-platform'><img src='"+ thisLogo +"'><div>"+ thisOfficialName +"</div></div><a href='"+ thisBinaryLink +"' class='latest-download-button a-button' id='linux-dl-button'><div>Download <div class='small-dl-text'>("+ thisFileExtension +" - "+ thisBinarySize +" MB)</div></div></a><div class='latest-details'><p><a href='"+ thisChecksumLink +"' class='dark-link' id='latest-checksum-"+ thisPlatform +"' target='_blank'>Checksum</a></p><p><strong>Requirements:</strong><br>"+ thisRequirements +"</p></ul></div></div>");

            // update the latest downloads container with this new platform block
            latestContainer.innerHTML = newLatestContent;
          }
        }

        assetCounter2++;
      });

      const latestContainer = document.getElementById("latest-container");
      latestContainer.className += " animated fadeIn"; // animate a fade-in of the entire 'latest page' section
      latestContainer.className = latestContainer.className.replace( /(?:^|\s)invisible(?!\S)/g , '' ); // make this section visible (invisible by default)

    } else {
      // report an error
      errorContainer.innerHTML = "<p>Error... no releases have been found!</p>";
      document.getElementById("latest-loading").innerHTML = ""; // remove the loading dots
    }
  });
}
