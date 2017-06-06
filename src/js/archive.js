// set variables for HTML elements
// SEE COMMENTED-OUT FUNCTIONS BELOW
// var platformDropDown = document.getElementById("platform-dropdown");
//var archiveTableBody = document.getElementById("archive-table-body");
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

  /*
  // SEE COMMENTED-OUT FUNCTIONS BELOW
  //var filterContainer = document.getElementById('filter-container');
  //filterContainer.className = filterContainer.className.replace( /(?:^|\s)hide(?!\S)/g , ' animated fadeIn ' );

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
  */
}

/*
// FUNCTIONS COMMENTED OUT IN THE EVENT THAT WE NEED A FILTER IN FUTURE.
// create an array that contains all of the drop-down list options, including 'ALL'.
function buildDropdownArray() {
  var dropdownArray = [];
  for (i = 0; i < platformDropDown.options.length; i++) {
    dropdownArray.push(platformDropDown.options[i].value);
  }
  return dropdownArray;
}
*/

// filters the platform rows and release rows based on a selected platform.
// pass in the 'searchableName' value of an object in the 'platforms' array, e.g. X64_LINUX
/*
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
    var thisPlatformRowArray = document.getElementsByClassName(selection); // create an array containing all of the selected platform's rows
    for (i = 0; i < thisPlatformRowArray.length; i++) {
      thisPlatformRowArray[i].className = thisPlatformRowArray[i].className.replace( /(?:^|\s)hide(?!\S)/g , '' ); // make sure that these rows are not hidden
    }

    notSelectedArray.splice(0, 1); // remove the first, default entry ('All', or equivalent) to leave just the platforms that have not been selected

     // for each of the non-selected platforms...
    notSelectedArray.forEach(function(thisPlatform) {
      var thisPlatformRowArray = document.getElementsByClassName(thisPlatform); // create an array containing all of this platform's rows

      for (i = 0; i < thisPlatformRowArray.length; i++) {
        thisPlatformRowArray[i].className += " hide"; // hide all of the rows for this platform
      }
    });

    var releaseRows = archiveTableBody.getElementsByClassName("release-row"); // create an array containing all of the release rows

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
*/

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
