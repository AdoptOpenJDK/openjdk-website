// set variables for HTML elements
var NIGHTLYDATA;

var tableHead = document.getElementById('table-head');
var tableContainer = document.getElementById('nightly-list');
var nightlyList = document.getElementById('nightly-table');
var searchError = document.getElementById('search-error');
var numberpicker = document.getElementById('numberpicker');
var datepicker = document.getElementById('datepicker');

// When nightly page loads, run:
/* eslint-disable no-unused-vars */
function onNightlyLoad() {
  /* eslint-enable no-unused-vars */
  NIGHTLYDATA = new Object();

  setDatePicker();
  populateNightly(); // run the function to populate the table on the Nightly page.

  numberpicker.onchange = function () {
    setTableRange();
  };
  datepicker.onchange = function () {
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
  loadPlatformsThenData(function () {

    var handleResponse = function (response, oldRepo) {

      if (response == null) {
        return false;
      }

      // Step 1: create a JSON from the XmlHttpRequest response
      var releasesJson = response;


      // if there are releases...
      if (typeof releasesJson[0] !== 'undefined') {
        var files = getFiles(releasesJson, oldRepo);

        if (files.length === 0) {
          return false;
        }
        buildNightlyHTML(files, oldRepo);
      } else { // if there are no releases...
        // report an error
        errorContainer.innerHTML = '<p>Error... no releases have been found!</p>';
        loading.innerHTML = ''; // remove the loading dots
      }

      return true;
    };

    loadAssetInfo(variant, "nightly", "nightly", handleResponse);
  });
}

function getFiles(releasesJson, oldRepo) {
  var assets = [];

  // for each release...
  releasesJson.forEach(function (eachRelease) {

    // create an array of the details for each binary that is attached to a release
    var assetArray = [];
    eachRelease.assets.forEach(function (each) {
      assetArray.push(each);
    });

    assetArray.forEach(function (eachAsset) {
      var NIGHTLYOBJECT = new Object();
      var nameOfFile = (eachAsset.name);
      var uppercaseFilename = nameOfFile.toUpperCase(); // make the name of the file uppercase
      NIGHTLYOBJECT.thisPlatform = getSearchableName(uppercaseFilename); // get the searchableName, e.g. MAC or X64_LINUX.
      var isArchive = new RegExp("(.tar.gz|.zip)$").test(nameOfFile);
      var variantMatches = new RegExp(jvmVariant).test(eachAsset.name);

      var correctFile = oldRepo || variantMatches && isArchive;

      // firstly, check if the platform name is recognised...
      if (correctFile && NIGHTLYOBJECT.thisPlatform) {
        assets.push({
          release: eachRelease,
          asset: eachAsset
        })
      }
    });
  });

  return assets;
}

function buildNightlyHTML(files, oldRepo) {
  tableHead.innerHTML = ('<tr id=\'table-header\'><th>Platform</th><th>Type</th></th><th>Date</th><th>Binary</th><th>Checksum</th></tr>');
  var NIGHTLYARRAY = [];

  // for each release...
  files.forEach(function (file) {  // for each file attached to this release...

    var eachAsset = file.asset;
    var eachRelease = file.release;

    var NIGHTLYOBJECT = new Object();
    var nameOfFile = (eachAsset.name);
    var uppercaseFilename = nameOfFile.toUpperCase(); // make the name of the file uppercase
    NIGHTLYOBJECT.thisPlatform = getSearchableName(uppercaseFilename); // get the searchableName, e.g. MAC or X64_LINUX.
    var type = nameOfFile.includes("-jre") ? "jre" : "jdk";

    // secondly, check if the file has the expected file extension for that platform...
    // (this filters out all non-binary attachments, e.g. SHA checksums - these contain the platform name, but are not binaries)
    NIGHTLYOBJECT.thisBinaryExtension = getBinaryExt(NIGHTLYOBJECT.thisPlatform); // get the file extension associated with this platform
    if (uppercaseFilename.indexOf(NIGHTLYOBJECT.thisBinaryExtension.toUpperCase()) >= 0) {

      // set values ready to be injected into the HTML
      var publishedAt = eachRelease.published_at;
      NIGHTLYOBJECT.thisReleaseName = eachRelease.name.slice(0, 12);
      NIGHTLYOBJECT.thisType = type;
      NIGHTLYOBJECT.thisReleaseDay = moment(publishedAt).format('D');
      NIGHTLYOBJECT.thisReleaseMonth = moment(publishedAt).format('MMMM');
      NIGHTLYOBJECT.thisReleaseYear = moment(publishedAt).format('YYYY');
      NIGHTLYOBJECT.thisGitLink = ('https://github.com/AdoptOpenJDK/' + variant + '-nightly/releases/tag/' + eachRelease.name);
      NIGHTLYOBJECT.thisOfficialName = getOfficialName(NIGHTLYOBJECT.thisPlatform);
      NIGHTLYOBJECT.thisBinaryLink = (eachAsset.browser_download_url);
      NIGHTLYOBJECT.thisBinarySize = Math.floor((eachAsset.size) / 1024 / 1024);
      if(oldRepo) {
        NIGHTLYOBJECT.thisChecksumLink = (eachAsset.browser_download_url).replace(NIGHTLYOBJECT.thisBinaryExtension, '.sha256.txt');
      } else {
        NIGHTLYOBJECT.thisChecksumLink = eachAsset.browser_download_url + '.sha256.txt';
      }

      NIGHTLYARRAY.push(NIGHTLYOBJECT);
    }
  });

  NIGHTLYDATA.htmlTemplate = NIGHTLYARRAY;
  var template = Handlebars.compile(document.getElementById('template').innerHTML);
  nightlyList.innerHTML = template(NIGHTLYDATA);

  setSearchLogic();

  loading.innerHTML = ''; // remove the loading dots

  // show the table, with animated fade-in
  nightlyList.className = nightlyList.className.replace(/(?:^|\s)hide(?!\S)/g, ' animated fadeIn ');
  setTableRange();

  // if the table has a scroll bar, show text describing how to horizontally scroll
  var scrollText = document.getElementById('scroll-text');
  var tableDisplayWidth = document.getElementById('nightly-list').clientWidth;
  var tableScrollWidth = document.getElementById('nightly-list').scrollWidth;
  if (tableDisplayWidth != tableScrollWidth) {
    scrollText.className = scrollText.className.replace(/(?:^|\s)hide(?!\S)/g, '');
  }
}

function setTableRange() {
  var rows = $('#nightly-table tr');
  var selectedDate = moment(datepicker.value, 'MM-DD-YYYY').format();
  var visibleRows = 0;

  for (i = 0; i < rows.length; i++) {
    var thisDate = rows[i].getElementsByClassName('nightly-release-date')[0].innerHTML;
    var thisDateMoment = moment(thisDate, 'D MMMM YYYY').format();
    var isAfter = moment(thisDateMoment).isAfter(selectedDate);
    if (isAfter === true || visibleRows >= numberpicker.value) {
      rows[i].classList.add('hide');
    }
    else {
      rows[i].classList.remove('hide');
      visibleRows++;
    }
  }

  checkSearchResultsExist();
}

function setSearchLogic() {
  // logic for the realtime search box...
  var $rows = $('#nightly-table tr');
  $('#search').keyup(function () {
    var val = '^(?=.*' + $.trim($(this).val()).split(/\s+/).join(')(?=.*') + ').*$',
      reg = RegExp(val, 'i'),
      text;

    $rows.show().filter(function () {
      text = $(this).text().replace(/\s+/g, ' ');
      return !reg.test(text);
    }).hide();

    checkSearchResultsExist();
  });
}

function checkSearchResultsExist() {
  var numOfVisibleRows = $('#nightly-table').find('tr:visible').length;
  if (numOfVisibleRows == 0) {
    tableContainer.style.visibility = 'hidden';
    searchError.className = '';
  }
  else {
    tableContainer.style.visibility = '';
    searchError.className = 'hide';
  }
}
