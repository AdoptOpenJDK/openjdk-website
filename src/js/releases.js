var RELEASEDATA;

// When releases page loads, run:
/* eslint-disable no-unused-vars */
function onLatestLoad() {
  /* eslint-enable no-unused-vars */

  RELEASEDATA = new Object();
  populateLatest(); // populate the Latest page
}

// LATEST PAGE FUNCTIONS

function populateLatest() {
  loadPlatformsThenData(function() {

    // TODO - the repoName variable should be passed into loadJSON below as the first argument, replacing openjdk-releases.
    // This can only be done after the repository name is updated from 'openjdk-releases' to 'openjdk8-releases'.
    //var repoName = (variant + '-releases');

    loadJSON('openjdk-releases', 'latest_release', function(response) {
      var releasesJson = JSON.parse(response);
      if (typeof releasesJson !== 'undefined') { // if there are releases...
        buildLatestHTML(releasesJson);
      }
      else {
        // report an error
        errorContainer.innerHTML = '<p>Error... no releases have been found!</p>';
        loading.innerHTML = ''; // remove the loading dots
      }
    });
  });
}

function buildLatestHTML(releasesJson) {
  // populate the page with the release's information
  var publishedAt = (releasesJson.published_at);
  document.getElementById('latest-build-name').innerHTML = '<var release-name>' + releasesJson.name + '</var>';
  document.getElementById('latest-build-name').href = ('https://github.com/AdoptOpenJDK/openjdk-releases/releases/tag/' + releasesJson.name);
  document.getElementById('latest-date').innerHTML = ('<var>' + moment(publishedAt).format('D') + '</var> ' + moment(publishedAt).format('MMMM') + ' <var>' + moment(publishedAt).format('YYYY') + '</var>');
  document.getElementById('latest-timestamp').innerHTML = (publishedAt.slice(0, 4) + publishedAt.slice(8, 10) + publishedAt.slice(5, 7) + publishedAt.slice(11, 13) + publishedAt.slice(14, 16));

  // create an array of the details for each asset that is attached to a release
  var assetArray = [];
  releasesJson.assets.forEach(function(each) {
    assetArray.push(each);
  });

  var ASSETARRAY = [];

  // for each asset attached to this release, check if it's a valid binary, then add a download block for it...
  assetArray.forEach(function(eachAsset) {
    var ASSETOBJECT = new Object();
    var nameOfFile = (eachAsset.name);
    var uppercaseFilename = nameOfFile.toUpperCase(); // make the name of the asset uppercase
    ASSETOBJECT.thisPlatform = getSearchableName(uppercaseFilename); // get the searchableName, e.g. MAC or X64_LINUX.

    // check if the platform name is recognised...
    if(ASSETOBJECT.thisPlatform) {

      ASSETOBJECT.thisLogo = getLogo(ASSETOBJECT.thisPlatform);
      ASSETOBJECT.thisPlatformOrder = getPlatformOrder(ASSETOBJECT.thisPlatform);
      ASSETOBJECT.thisOfficialName = getOfficialName(ASSETOBJECT.thisPlatform);
      ASSETOBJECT.thisVerified = false;

      // if the filename contains both the platform name and the matching INSTALLER extension, add the relevant info to the asset object
      ASSETOBJECT.thisInstallerExtension = getInstallerExt(ASSETOBJECT.thisPlatform);
      if(uppercaseFilename.indexOf(ASSETOBJECT.thisInstallerExtension.toUpperCase()) >= 0) {
        ASSETOBJECT.thisPlatformExists = true;
        ASSETOBJECT.thisInstallerExists = true;
        ASSETOBJECT.thisInstallerLink = (eachAsset.browser_download_url);
        ASSETOBJECT.thisInstallerSize = Math.floor((eachAsset.size)/1024/1024);
      }

      // if the filename contains both the platform name and the matching BINARY extension, add the relevant info to the asset object
      ASSETOBJECT.thisBinaryExtension = getBinaryExt(ASSETOBJECT.thisPlatform);
      if(uppercaseFilename.indexOf(ASSETOBJECT.thisBinaryExtension.toUpperCase()) >= 0) {
        ASSETOBJECT.thisPlatformExists = true;
        ASSETOBJECT.thisBinaryExists = true;
        ASSETOBJECT.thisBinaryLink = (eachAsset.browser_download_url);
        ASSETOBJECT.thisBinarySize = Math.floor((eachAsset.size)/1024/1024);
        ASSETOBJECT.thisChecksumLink = (eachAsset.browser_download_url).replace(ASSETOBJECT.thisBinaryExtension, '.sha256.txt');
      }

      if(ASSETOBJECT.thisPlatformExists === true){
        ASSETARRAY.push(ASSETOBJECT);
      }

    }
  });

  ASSETARRAY = orderPlatforms(ASSETARRAY);

  RELEASEDATA.htmlTemplate = ASSETARRAY;

  var templateSelector = Handlebars.compile(document.getElementById('template-selector').innerHTML);
  var templateInfo = Handlebars.compile(document.getElementById('template-info').innerHTML);
  document.getElementById('latest-selector').innerHTML = templateSelector(RELEASEDATA);
  document.getElementById('latest-info').innerHTML = templateInfo(RELEASEDATA);

  setTickLink();

  loading.innerHTML = ''; // remove the loading dots

  const latestContainer = document.getElementById('latest-container');
  latestContainer.className = latestContainer.className.replace( /(?:^|\s)invisible(?!\S)/g , ' animated fadeIn ' ); // make this section visible (invisible by default), with animated fade-in
}

/* eslint-disable no-unused-vars */
function selectLatestPlatform(thisPlatform) {
/* eslint-enable no-unused-vars */
  var thisPlatformInfo = document.getElementById('latest-info-' + thisPlatform);

  unselectLatestPlatform();

  document.getElementById('latest-selector').classList.add('hide');
  thisPlatformInfo.classList.remove('hide');
}

function unselectLatestPlatform() {
  var platformButtons = document.getElementById('latest-selector').getElementsByClassName('latest-asset');
  var platformInfoBoxes = document.getElementById('latest-info').getElementsByClassName('latest-info-container');

  for (i = 0; i < platformButtons.length; i++) {
    platformInfoBoxes[i].classList.add('hide');
  }

  document.getElementById('latest-selector').classList.remove('hide');
}
