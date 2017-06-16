var RELEASEDATA;

// When releases page loads, run:
/* eslint-disable no-unused-vars */
function onLatestLoad() {
  /* eslint-enable no-unused-vars */
  RELEASEDATA = new Object();
  populateLatest(); // populate the Latest page

  var scrollSelector = $("#latest-selector"), x;
  $("#latest-selector-left-scroll").click(function() {
    x = ((scrollSelector.width() / 2)) - scrollSelector.scrollLeft();
    scrollSelector.animate({
      scrollLeft: -x,
    })
  });
  $("#latest-selector-right-scroll").click(function() {
    x = ((scrollSelector.width() / 2)) + scrollSelector.scrollLeft();
    scrollSelector.animate({
      scrollLeft: x,
    })
  });
}

// LATEST PAGE FUNCTIONS

function populateLatest() {

  // call the XmlHttpRequest function in global.js, passing in 'releases' as the repo, and a long function as the callback.
  loadReleasesJSON('releases', 'latest_release', function(response) {
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
}

function buildLatestHTML(releasesJson) {
  // populate the page with the release's information
  var publishedAt = (releasesJson.published_at);
  document.getElementById('latest-build-name').innerHTML = releasesJson.name;
  document.getElementById('latest-build-name').href = ('https://github.com/AdoptOpenJDK/openjdk-releases/releases/tag/' + releasesJson.name);
  document.getElementById('latest-date').innerHTML = moment(publishedAt).format('Do MMMM YYYY');
  document.getElementById('latest-timestamp').innerHTML = (publishedAt.slice(0, 4) + publishedAt.slice(8, 10) + publishedAt.slice(5, 7) + publishedAt.slice(11, 13) + publishedAt.slice(14, 16));

  // create an array of the details for each asset that is attached to a release
  var assetArray = [];
  releasesJson.assets.forEach(function(each) {
    assetArray.push(each);
  });

  // create empty variables ready for the generated HTML
  var latestSelectorHTML = '';
  var latestInfoHTML = '';

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

  RELEASEDATA.htmlTemplate = ASSETARRAY;
  var templateSelector = Handlebars.compile(document.getElementById('template-selector').innerHTML);
  var templateInfo = Handlebars.compile(document.getElementById('template-info').innerHTML);
  document.getElementById('latest-selector').innerHTML = templateSelector(RELEASEDATA);
  document.getElementById('latest-info').innerHTML = templateInfo(RELEASEDATA);

  var latestTable = document.getElementById('latest-table');
  var latestSelector = document.getElementById('latest-selector');
  var tableScrollWidth = latestSelector.scrollWidth;
  latestTable.style.display = 'block';
  latestTable.style.maxWidth = (tableScrollWidth + 'px');

  // if the table has a scroll bar, show text describing how to horizontally scroll
  var tableDisplayWidth = latestSelector.clientWidth;
  if (tableDisplayWidth != tableScrollWidth) {
    document.getElementById('latest-scroll-text').classList.remove('hide');
    document.getElementById('latest-scroll-arrows').classList.remove('hide');
    document.getElementById('latest-select-text').classList.add('hide');
  }

  loading.innerHTML = ''; // remove the loading dots

  const latestContainer = document.getElementById('latest-container');
  latestContainer.className = latestContainer.className.replace( /(?:^|\s)invisible(?!\S)/g , ' animated fadeIn ' ); // make this section visible (invisible by default), with animated fade-in
}

/* eslint-disable no-unused-vars */
function selectLatestPlatform(thisPlatform) {
/* eslint-enable no-unused-vars */
  var platformButtons = document.getElementById('latest-selector').getElementsByTagName('TD');
  var platformInfoBoxes = document.getElementById('latest-info').getElementsByTagName('TD');

  var thisPlatformSelector = document.getElementById('latest-selector-' + thisPlatform);
  var thisPlatformInfo = document.getElementById('latest-info-' + thisPlatform);

  var alreadySelected = false;
  if(thisPlatformSelector.classList.contains('latest-highlight')) {
    alreadySelected = true;
  }

  for (i = 0; i < platformButtons.length; i++) {
    platformButtons[i].classList.remove('latest-highlight');
    platformInfoBoxes[i].classList.add('hide');
  }

  if(alreadySelected === false) {
    thisPlatformSelector.classList.add('latest-highlight');
    thisPlatformInfo.classList.remove('hide');
  }
}
