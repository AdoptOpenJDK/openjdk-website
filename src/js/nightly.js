// set variables for HTML elements
var tableHead = document.getElementById("table-head");
var tableContainer = document.getElementById("nightly-list");
var nightlyList = document.getElementById("nightly-table");
var searchError = document.getElementById("search-error");
var numberpicker = document.getElementById("numberpicker");
var datepicker = document.getElementById("datepicker");

// When nightly page loads, run:
/* eslint-disable no-unused-vars */
function onNightlyLoad() {
  /* eslint-enable no-unused-vars */
  setDatePicker();
  populateNightly(); // run the function to populate the table on the Nightly page.

  numberpicker.onchange = function(){
    setTableRange();
  };
  datepicker.onchange = function(){
    setTableRange();
  };
}


// NIGHTLY PAGE FUNCTIONS

function setDatePicker() {
  $(datepicker).datepicker();
  var today = moment().format('MM/DD/YYYY');
  datepicker.value = today;
}

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
  });
}

function buildNightlyHTML(releasesJson) {
  tableHead.innerHTML = ("<tr id='table-header'><th>Release</th><th>Platform</th><th>Downloads</th><th>Release details</th></tr>");

  // for each release...
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
        var thisBinaryExtension = getFileExt(thisPlatform); // get the file extension associated with this platform
        if(uppercaseFilename.indexOf(thisBinaryExtension.toUpperCase()) >= 0) {

          // set values ready to be injected into the HTML
          var publishedAt = eachRelease.published_at;
          var thisReleaseName = eachRelease.name.slice(0, 12);
          var thisReleaseDate = moment(publishedAt).format('Do MMMM YYYY');
          var thisGitLink = ("https://github.com/AdoptOpenJDK/openjdk-nightly/releases/tag/" + eachRelease.name);
          var thisOfficialName = getOfficialName(thisPlatform);
          var thisBinaryLink = (eachAsset.browser_download_url);
          var thisBinarySize = Math.floor((eachAsset.size)/1024/1024);
          var thisChecksumLink = (eachAsset.browser_download_url).replace(thisBinaryExtension, ".sha256.txt");
          var thisTimestamp = (publishedAt.slice(0, 4) + publishedAt.slice(8, 10) + publishedAt.slice(5, 7) + publishedAt.slice(11, 13) + publishedAt.slice(14, 16));

          var currentNightlyContent = nightlyList.innerHTML;

          // prepare a fully-populated HTML block for this release
          // to change the HTML of the nightly table rows/cells, you must change this template.
          var newNightlyContent = currentNightlyContent += ("<tr class='nightly-container'><td class='nightly-header'><div><strong><a href='"+thisGitLink+"' class='dark-link' target='_blank'>"+thisReleaseName+"</a></strong></div><div class='divider'> | </div><div class='nightly-release-date'>"+thisReleaseDate+"</div></td><td class='nightly-platform-block'>"+thisOfficialName+"</td><td class='nightly-downloads-block'><div><a class='dark-link' href='"+thisBinaryLink+"'>"+thisBinaryExtension+" ("+thisBinarySize+" MB)</a><div class='divider'> | </div><a href='"+thisChecksumLink+"' class='dark-link'>Checksum</a></div></td><td class='nightly-details'><!--<div><strong><a href='put-changelog-link-here' class='dark-link'>Changelog</a></strong></div> <div class='divider'> | </div>--><div><strong>Timestamp: </strong>"+thisTimestamp+"</div><!--<div class='divider'> | </div> <div><strong>Commit: </strong><a href='put-commit-ref-link-here' class='dark-link'>put-commit-ref-here</a></div>--></td></tr>");

          // update the HTML container element with this new, blank, template row (hidden at this stage)
          nightlyList.innerHTML = newNightlyContent;
        }
      }
    });
  });

  setSearchLogic();
  loading.innerHTML = ""; // remove the loading dots

  // show the table, with animated fade-in
  nightlyList.className = nightlyList.className.replace( /(?:^|\s)hide(?!\S)/g , ' animated fadeIn ' );
  setTableRange();

  // if the table has a scroll bar, show text describing how to horizontally scroll
  var scrollText = document.getElementById('scroll-text');
  var tableDisplayWidth = document.getElementById('nightly-list').clientWidth;
  var tableScrollWidth = document.getElementById('nightly-list').scrollWidth;
  if (tableDisplayWidth != tableScrollWidth) {
    scrollText.className = scrollText.className.replace( /(?:^|\s)hide(?!\S)/g , '' );
  }
}

function setTableRange() {
  var rows = $('#nightly-table tr');
  var selectedDate = moment(datepicker.value, "MM-DD-YYYY").format();
  var visibleRows = 0;

  for (i = 0; i < rows.length; i++) {
    var thisDate = rows[i].getElementsByClassName("nightly-release-date")[0].innerHTML;
    var thisDateMoment = moment(thisDate, "Do MMMM YYYY").format();
    var isAfter = moment(thisDateMoment).isAfter(selectedDate);
    if(isAfter === true || visibleRows >= numberpicker.value) {
      rows[i].classList.add("hide");
    }
    else {
      rows[i].classList.remove("hide");
      visibleRows++;
    }
  }

  checkSearchResultsExist();
}

function setSearchLogic() {
  // logic for the realtime search box...
  var $rows = $('#nightly-table tr');
  $('#search').keyup(function() {
    var val = '^(?=.*' + $.trim($(this).val()).split(/\s+/).join(')(?=.*') + ').*$',
        reg = RegExp(val, 'i'),
        text;

    $rows.show().filter(function() {
        text = $(this).text().replace(/\s+/g, ' ');
        return !reg.test(text);
    }).hide();

    checkSearchResultsExist();
  });
}

function checkSearchResultsExist() {
  var numOfVisibleRows = $("#nightly-table").find("tr:visible").length;
  if(numOfVisibleRows == 0){
    tableContainer.style.visibility = "hidden";
    searchError.className = "";
  }
  else {
    tableContainer.style.visibility = "";
    searchError.className = "hide";
  }
}
