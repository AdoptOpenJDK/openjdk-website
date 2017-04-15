var assetCounter2 = 0;
// When releases page loads, run:
/* eslint-disable no-unused-vars */
function onReleasesLoad() {
  /* eslint-enable no-unused-vars */

  // set variables for the two page sections contained within releases.html
  const archive = document.getElementById('archives-page');
  const latest = document.getElementById('latest-page');

  // on load, check if it's the archive page, and run showArchive(); or hideArchive(); accordingly
  if(window.location.hash == "#archive") {
    showArchive();
  } else {
    hideArchive();
  }

  function showArchive() {
    latest.className += " hide"; // hide the 'Latest' page
    archive.className = archive.className.replace( /(?:^|\s)hide(?!\S)/g , '' ); // show the 'Archive' page
    errorContainer.style.color = "black";
    populateArchive(); // populate the Archive page
  }

  function hideArchive() {
    archive.className += " hide"; // hide the 'Archive' page
    latest.className = latest.className.replace( /(?:^|\s)hide(?!\S)/g , '' ); // show the 'Latest' page
    errorContainer.style.color = "red";
    populateLatest(); // populate the Latest page
  }

  // If the hash changes in the URL while on the page, switch to the correct page accordingly.
  window.onhashchange = function(){
    if(window.location.hash == "#archive") {
      errorContainer.innerHTML = ""; // reset the error message
      showArchive();
    } else {
      errorContainer.innerHTML = ""; // reset the error message
      hideArchive();
    }
  }
}

// LATEST PAGE FUNCTIONS

function populateLatest() {

  var loading = document.getElementById("latest-loading"); // set variable for the loading dots

  // call the XmlHttpRequest function in global.js, passing in 'releases' as the repo, and a long function as the callback.
  loadReleasesJSON("releases", loading, function(response) {
    function checkIfProduction(x) {
      return x.prerelease === false && x.assets[0]; // used by the array filter method below.
    }

    // Step 1: create a JSON from the XmlHttpRequest response
    // Step 2: filter out all releases from this JSON that are marked as 'pre-release' in GitHub.
    var releasesJson = JSON.parse(response).filter(checkIfProduction);

    // if there are releases...
    if (typeof releasesJson[0] !== 'undefined') {
      // remove the loading dots
      document.getElementById("latest-loading").innerHTML = "";

      // populate the page with the release's information
      var publishedAt = (releasesJson[0].published_at);
      document.getElementById("latest-build-name").innerHTML = releasesJson[0].name;
      document.getElementById("latest-build-name").href = ("https://github.com/AdoptOpenJDK/openjdk-releases/releases/tag/" + releasesJson[0].name);
      document.getElementById("latest-date").innerHTML = moment(publishedAt).format('Do MMMM YYYY');
      //document.getElementById("latest-changelog").href = releasesJson[0].name;
      document.getElementById("latest-timestamp").innerHTML = (publishedAt.slice(0, 4) + publishedAt.slice(8, 10) + publishedAt.slice(5, 7) + publishedAt.slice(11, 13) + publishedAt.slice(14, 16));
      //document.getElementById("latest-buildnumber").innerHTML = releasesJson[0].id;
      //document.getElementById("latest-commitref").innerHTML = releasesJson[0].name;
      //document.getElementById("latest-commitref").href = releasesJson[0].name;

      // create an array of the details for each asset that is attached to a release
      var assetArray = [];
      var assetCounter = 0;
      releasesJson[0].assets.forEach(function() {
        assetArray.push(releasesJson[0].assets[assetCounter]);
        assetCounter++;
      });

      // for each asset attached to this release, check if it's a valid binary, then add a download block for it...
      assetCounter2 = 0;
      assetArray.forEach(function() {
        var nameOfFile = (assetArray[assetCounter2].name);
        var a = nameOfFile.toUpperCase(); // make the name of the asset uppercase
        var thisPlatform = getSearchableName(a); // get the searchableName, e.g. MAC or X64_LINUX.

        // firstly, check if the platform name is recognised...
        if(thisPlatform != false) {

          // secondly, check if the file has the expected file extension for that platform...
          // (this filters out all non-binary attachments, e.g. SHA checksums - these contain the platform name, but are not binaries)
          var thisFileExtension = getFileExt(thisPlatform); // get the file extension associated with this platform
          if(a.indexOf((thisFileExtension.toUpperCase())) >= 0) {

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
// END OF LATEST PAGE FUNCTIONS



// ARCHIVE PAGE FUNCTIONS

function populateArchive() {
  // set variables for HTML elements
  var loading = document.getElementById("archive-loading");

  // call the XmlHttpRequest function in global.js, passing in 'releases' as the repo, and a long function as the callback.
  loadReleasesJSON("releases", loading, function(response) {
    function checkIfProduction(x) { // used by the array filter method below.
      return x.prerelease === false && x.assets[0];
    }

    // Step 1: create a JSON from the XmlHttpRequest response
    // Step 2: filter out all releases from this JSON that are marked as 'pre-release' in GitHub.
    var releasesJson = JSON.parse(response).filter(checkIfProduction);

    // if there are releases prior to the 'latest' one (i.e. archived releases)...
    if (typeof releasesJson[0] !== 'undefined') {
      // remove the loading dots
      document.getElementById("archive-loading").innerHTML = "";

      var archiveTableBody = document.getElementById("archive-table-body");

      // for each release...
      var archiveCounter = 0;
      releasesJson.forEach(function() {

        // set values for this release, ready to inject into HTML
        var publishedAt = releasesJson[archiveCounter].published_at;
        var thisReleaseName = releasesJson[archiveCounter].name;
        var thisReleaseDate = moment(publishedAt).format('Do MMMM YYYY');
        var thisGitLink = ("https://github.com/AdoptOpenJDK/openjdk-releases/releases/tag/" + thisReleaseName);
        var thisTimestamp = (publishedAt.slice(0, 4) + publishedAt.slice(8, 10) + publishedAt.slice(5, 7) + publishedAt.slice(11, 13) + publishedAt.slice(14, 16));
        var platformTableRows = ""; // an empty var where new table rows can be added for each platform

        // create an array of the details for each asset that is attached to this release
        var assetArray = [];
        var assetCounter = 0;
        releasesJson[archiveCounter].assets.forEach(function() {
          assetArray.push(releasesJson[archiveCounter].assets[assetCounter]);
          assetCounter++;
        });

        // populate 'platformTableRows' with one row per binary for this release...
        assetCounter2 = 0;
        assetArray.forEach(function() {
          var nameOfFile = (assetArray[assetCounter2].name);
          var a = nameOfFile.toUpperCase(); // make the name of the asset uppercase
          var thisPlatform = getSearchableName(a); // get the searchableName, e.g. MAC or X64_LINUX.

          // firstly, check if the platform name is recognised...
          if(thisPlatform != false) {

            // secondly, check if the file has the expected file extension for that platform...
            // (this filters out all non-binary attachments, e.g. SHA checksums - these contain the platform name, but are not binaries)
            var thisFileExtension = getFileExt(thisPlatform); // get the file extension associated with this platform
            if(a.indexOf((thisFileExtension.toUpperCase())) >= 0) {

              // set values ready to be injected into the HTML
              var thisOfficialName = getOfficialName(thisPlatform);
              var thisBinaryLink = (assetArray[assetCounter2].browser_download_url);
              var thisBinarySize = Math.floor((assetArray[assetCounter2].size)/1024/1024);
              var thisChecksumLink = (assetArray[assetCounter2].browser_download_url).replace(thisFileExtension, ".sha256.txt");

              // prepare a fully-populated table row for this platform
              platformTableRows += ("<tr class='"+ thisPlatform +"'><td class='bold'>"+ thisOfficialName +"</td><td><a class='grey-button no-underline' href='"+ thisBinaryLink +"'>"+ thisFileExtension +" ("+ thisBinarySize +" MB)</a></td><td><a href='"+ thisChecksumLink +"' class='dark-link'>Checksum</a></td></tr>");
            }
          }

          assetCounter2++;
        });

        // create a new table row containing all release information, and the completed platform/binary table
        var newArchiveContent = ("<tr><td class='blue-bg'><div><h1><a href='"+ thisGitLink +"' class='light-link' target='_blank'>"+ thisReleaseName +"</a></h1><h4>"+ thisReleaseDate +"</h4></div></td><td><table class='archive-platforms'>"+ platformTableRows +"</table></td><td class='archive-details'><!--<div><strong><a href='' class='dark-link'>Changelog</a></strong></div>--><div><strong>Timestamp: </strong>"+ thisTimestamp +"</div><!--<div><strong>Build number: </strong></div>--><!--<div><strong>Commit: </strong><a href='' class='dark-link'></a></div>--></td></tr>");

        archiveTableBody.innerHTML += newArchiveContent;

        // iterate to the next archived release
        archiveCounter++;

      });
    } else { // if there are no releases (beyond the latest one)...
      // report an error
      errorContainer.innerHTML = "<p>There are no archived releases yet! See the <a href='./releases.html'>Latest release</a> page.</p>";
      document.getElementById("archive-loading").innerHTML = "";
    }
  });
}
