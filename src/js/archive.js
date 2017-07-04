var ARCHIVEDATA;

// When releases page loads, run:
/* eslint-disable no-unused-vars */
function onArchiveLoad() {
  /* eslint-enable no-unused-vars */
  ARCHIVEDATA = new Object();
  populateArchive(); // populate the Archive page
}

// ARCHIVE PAGE FUNCTIONS

function populateArchive() {
  loadPlatformsThenData(function() {

    // TODO - the repoName variable should be passed into loadJSON below as the first argument, replacing openjdk-releases.
    // This can only be done after the repository name is updated from 'openjdk-releases' to 'openjdk8-releases'.
    //var repoName = (variant + '-releases');

    loadJSON('openjdk-releases', 'releases', function(response) {
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
        loading.innerHTML = '';
        errorContainer.innerHTML = '<p>There are no archived releases yet! See the <a href=\'./releases.html\'>Latest build</a> page.</p>';
      }
    });
  });

}

function buildArchiveHTML(releasesJson) {
  var RELEASEARRAY = [];

  // for each release...
  releasesJson.forEach(function(eachRelease) {
    var RELEASEOBJECT = new Object();
    var ASSETARRAY = [];

    // set values for this release, ready to inject into HTML
    var publishedAt = eachRelease.published_at;
    RELEASEOBJECT.thisReleaseName = eachRelease.name;
    RELEASEOBJECT.thisReleaseDay = moment(publishedAt).format('D');
    RELEASEOBJECT.thisReleaseMonth = moment(publishedAt).format('MMMM');
    RELEASEOBJECT.thisReleaseYear = moment(publishedAt).format('YYYY');
    RELEASEOBJECT.thisGitLink = ('https://github.com/AdoptOpenJDK/openjdk-releases/releases/tag/' + RELEASEOBJECT.thisReleaseName);

    // create an array of the details for each asset that is attached to this release
    var assetArray = [];
    eachRelease.assets.forEach(function(each) {
      assetArray.push(each);
    });

    // populate 'platformTableRows' with one row per binary for this release...
    assetArray.forEach(function(eachAsset) {
      var ASSETOBJECT = new Object();
      var nameOfFile = (eachAsset.name);
      var uppercaseFilename = nameOfFile.toUpperCase(); // make the name of the asset uppercase
      ASSETOBJECT.thisPlatform = getSearchableName(uppercaseFilename); // get the searchableName, e.g. MAC or X64_LINUX.

      // firstly, check if the platform name is recognised...
      if(ASSETOBJECT.thisPlatform) {

        // secondly, check if the file has the expected file extension for that platform...
        // (this filters out all non-binary attachments, e.g. SHA checksums - these contain the platform name, but are not binaries)
        ASSETOBJECT.thisBinaryExtension = getBinaryExt(ASSETOBJECT.thisPlatform); // get the file extension associated with this platform
        if(uppercaseFilename.indexOf(ASSETOBJECT.thisBinaryExtension.toUpperCase()) >= 0) {
          // set values ready to be injected into the HTML
          ASSETOBJECT.thisOfficialName = getOfficialName(ASSETOBJECT.thisPlatform);
          ASSETOBJECT.thisBinaryLink = (eachAsset.browser_download_url);
          ASSETOBJECT.thisBinarySize = Math.floor((eachAsset.size)/1024/1024);
          ASSETOBJECT.thisChecksumLink = (eachAsset.browser_download_url).replace(ASSETOBJECT.thisBinaryExtension, '.sha256.txt');
          ASSETOBJECT.thisPlatformOrder = getPlatformOrder(ASSETOBJECT.thisPlatform);
          ASSETOBJECT.thisVerified = false;

          ASSETARRAY.push(ASSETOBJECT);
        }
      }
    });

    ASSETARRAY = orderPlatforms(ASSETARRAY);

    RELEASEOBJECT.thisPlatformAssets = ASSETARRAY;
    RELEASEARRAY.push(RELEASEOBJECT);
  });

  ARCHIVEDATA.htmlTemplate = RELEASEARRAY;
  var template = Handlebars.compile(document.getElementById('template').innerHTML);
  document.getElementById('archive-table-body').innerHTML = template(ARCHIVEDATA);

  setPagination();
  setTickLink();

  loading.innerHTML = ''; // remove the loading dots

  // show the archive list and filter box, with fade-in animation
  var archiveList = document.getElementById('archive-list');
  archiveList.className = archiveList.className.replace( /(?:^|\s)hide(?!\S)/g , ' animated fadeIn ' );
}

function setPagination() {
  var container = $('#pagination-container');
  var archiveRows = document.getElementById('archive-table-body').getElementsByClassName('release-row');
  var paginationArrayHTML = [];
  for (i = 0; i < archiveRows.length; i++) {
    paginationArrayHTML.push(archiveRows[i].outerHTML);
  }

  var options = {
    dataSource: paginationArrayHTML,
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

  if(document.getElementById('pagination-container').getElementsByTagName('li').length <= 3){
    document.getElementById('pagination-container').classList.add('hide');
  }

  return container;
}
