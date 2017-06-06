// set variables for HTML elements
var archiveContentArray = [];

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
      errorContainer.innerHTML = "<p>There are no archived releases yet! See the <a href='./releases.html'>Latest build</a> page.</p>";
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
        var thisBinaryExtension = getBinaryExt(thisPlatform); // get the file extension associated with this platform
        if(uppercaseFilename.indexOf(thisBinaryExtension.toUpperCase()) >= 0) {

          // set values ready to be injected into the HTML
          var thisOfficialName = getOfficialName(thisPlatform);
          var thisBinaryLink = (eachAsset.browser_download_url);
          var thisBinarySize = Math.floor((eachAsset.size)/1024/1024);
          var thisChecksumLink = (eachAsset.browser_download_url).replace(thisBinaryExtension, ".sha256.txt");

          // prepare a fully-populated table row for this platform
          platformTableRows += ("<tr class='platform-row "+ thisPlatform +"'><td>"+ thisOfficialName +"</td><td class='download-td'><a class='grey-button no-underline' href='"+ thisBinaryLink +"'>"+ thisBinaryExtension +" ("+ thisBinarySize +" MB)</a></td><td><a href='"+ thisChecksumLink +"' class='dark-link'>Checksum</a></td></tr>");
        }
      }
    });

    // create a new table row containing all release information, and the completed platform/binary table
    var newArchiveContent = ("<tr class='release-row'><td class='blue-bg'><div><h1><a href='"+ thisGitLink +"' class='light-link' target='_blank'>"+ thisReleaseName +"</a></h1><h4>"+ thisReleaseDate +"</h4></div></td><td><table class='archive-platforms'>"+ platformTableRows +"</table></td></tr>");
    archiveContentArray.push(newArchiveContent);
  });

  setPagination();

  loading.innerHTML = ""; // remove the loading dots

  // show the archive list and filter box, with fade-in animation
  var archiveList = document.getElementById('archive-list');
  archiveList.className = archiveList.className.replace( /(?:^|\s)hide(?!\S)/g , ' animated fadeIn ' );
}

function setPagination() {
  var container = $('#pagination-container');
  var options = {
    dataSource: archiveContentArray,
    pageSize: 5,
    callback: function (response) {

      var dataHtml = '';

      $.each(response, function (index, item) {
        dataHtml += item;
      });

      $('#archive-table-body').html(dataHtml);
    }
  };

  container.pagination(options);

  if(document.getElementById("pagination-container").getElementsByTagName("li").length <= 3){
    document.getElementById("pagination-container").classList.add("hide");
  }

  return container;
}
