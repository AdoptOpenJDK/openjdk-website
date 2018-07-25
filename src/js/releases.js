var RELEASEDATA;

// When releases page loads, run:
/* eslint-disable no-unused-vars */
function onLatestLoad() {
  /* eslint-enable no-unused-vars */

  RELEASEDATA = new Object();
  populateLatest(); // populate the Latest page
}

// LATEST PAGE FUNCTIONS
/* eslint-disable no-undef */
function populateLatest() {
  loadPlatformsThenData(function () {

    var handleResponse = function (response) {

      // create an array of the details for each asset that is attached to a release
      var assetArray = response.binaries;

      if (assetArray.length === 0) {
        return false
      }

      var repoName = getRepoName(true, 'releases');

      loadJSON(repoName, 'jck', function (response_jck) {

        var jckJSON = {}
        if (response_jck !== null) {
          jckJSON = JSON.parse(response_jck)
        }

        buildLatestHTML(response, jckJSON, assetArray);
      });

      return true;
    };

    loadAssetInfo(variant, jvmVariant, 'releases', 'latest', handleResponse, function () {
      errorContainer.innerHTML = '<p>There are no releases available for ' + variant + '. Please check our <a href=nightly.html?variant=' + variant + ' target=\'blank\'>Nightly Builds</a>.</p>';
      loading.innerHTML = ''; // remove the loading dots
    });
  });
}

function buildLatestHTML(releasesJson, jckJSON, assetArray) {

  // populate with description
  var variantObject = getVariantObject(variant + '-' + jvmVariant);
  if (variantObject.descriptionLink) {
    document.getElementById('description_header').innerHTML = 'What is ' + variantObject.description + '?';
    document.getElementById('description_link').innerHTML = 'Find out here';
    document.getElementById('description_link').href = variantObject.descriptionLink;
  }
  // populate the page with the release's information
  var publishedAt = (releasesJson.timestamp);
  document.getElementById('latest-build-name').innerHTML = '<var release-name>' + releasesJson.release_name + '</var>';
  document.getElementById('latest-build-name').href = ('https://github.com/AdoptOpenJDK/' + getRepoName(true, 'releases') + '/releases/tag/' + releasesJson.release_name);
  document.getElementById('latest-date').innerHTML = ('<var>' + moment(publishedAt).format('D') + '</var> ' + moment(publishedAt).format('MMMM') + ' <var>' + moment(publishedAt).format('YYYY') + '</var>');
  document.getElementById('latest-timestamp').innerHTML = (publishedAt.slice(0, 4) + publishedAt.slice(8, 10) + publishedAt.slice(5, 7) + publishedAt.slice(11, 13) + publishedAt.slice(14, 16));


  var ASSETARRAY = [];
  // for each asset attached to this release, check if it's a valid binary, then add a download block for it...
  assetArray.forEach(function (eachAsset) {
    var ASSETOBJECT = new Object();
    var nameOfFile = (eachAsset.binary_name);
    var uppercaseFilename = nameOfFile.toUpperCase(); // make the name of the asset uppercase
    ASSETOBJECT.thisPlatform = getSearchableName(uppercaseFilename); // get the searchableName, e.g. MAC or X64_LINUX.

    // check if the platform name is recognised...
    if (ASSETOBJECT.thisPlatform) {
      ASSETOBJECT.thisLogo = getLogo(ASSETOBJECT.thisPlatform);
      ASSETOBJECT.thisPlatformOrder = getPlatformOrder(ASSETOBJECT.thisPlatform);
      ASSETOBJECT.thisOfficialName = getOfficialName(ASSETOBJECT.thisPlatform);

      if (jckJSON == null || Object.keys(jckJSON).length == 0) {
        ASSETOBJECT.thisVerified = false;
      } else {
        if (jckJSON[releasesJson.release_name] && jckJSON[releasesJson.release_name].hasOwnProperty(ASSETOBJECT.thisPlatform)) {
          ASSETOBJECT.thisVerified = true;
        } else {
          ASSETOBJECT.thisVerified = false;
        }
      }

      // if the filename contains both the platform name and the matching INSTALLER extension, add the relevant info to the asset object
      ASSETOBJECT.thisInstallerExtension = getInstallerExt(ASSETOBJECT.thisPlatform);
      ASSETOBJECT.thisBinaryExtension = getBinaryExt(ASSETOBJECT.thisPlatform);
      if (uppercaseFilename.indexOf(ASSETOBJECT.thisInstallerExtension.toUpperCase()) >= 0) {
        if (ASSETARRAY.length > 0) {
          ASSETARRAY.forEach(function (asset) {
            if (asset.thisPlatform === ASSETOBJECT.thisPlatform) {
              ASSETARRAY.pop();
            }
          });
        }
        ASSETOBJECT.thisPlatformExists = true;
        ASSETOBJECT.thisInstallerExists = true;
        ASSETOBJECT.thisInstallerLink = (eachAsset.binary_link);
        ASSETOBJECT.thisInstallerSize = Math.floor((eachAsset.binary_size) / 1024 / 1024);
        ASSETOBJECT.thisBinaryExists = true;
        ASSETOBJECT.thisBinaryLink = (eachAsset.binary_link).replace(ASSETOBJECT.thisInstallerExtension, ASSETOBJECT.thisBinaryExtension);
        ASSETOBJECT.thisBinarySize = Math.floor((eachAsset.binary_size) / 1024 / 1024);
        ASSETOBJECT.thisChecksumLink = (eachAsset.binary_link).replace(ASSETOBJECT.thisInstallerExtension, '.sha256.txt');
      }
      // if the filename contains both the platform name and the matching BINARY extension, add the relevant info to the asset object
      if (uppercaseFilename.indexOf(ASSETOBJECT.thisBinaryExtension.toUpperCase()) >= 0) {
        var installerExist = false;
        if (ASSETARRAY.length > 0) {
          ASSETARRAY.forEach(function (asset) {
            if (asset.thisPlatform === ASSETOBJECT.thisPlatform) {
              installerExist = true;
            }
          });
        }
        if (!installerExist) {
          ASSETOBJECT.thisPlatformExists = true;
          ASSETOBJECT.thisBinaryExists = true;
          ASSETOBJECT.thisBinaryLink = (eachAsset.binary_link);
          ASSETOBJECT.thisBinarySize = Math.floor((eachAsset.binary_size) / 1024 / 1024);
          ASSETOBJECT.thisChecksumLink = (eachAsset.checksum_link)
        }
      }


      if (ASSETOBJECT.thisPlatformExists === true) {
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

  displayLatestPlatform();
  window.onhashchange = displayLatestPlatform;

  loading.innerHTML = ''; // remove the loading dots

  const latestContainer = document.getElementById('latest-container');
  latestContainer.className = latestContainer.className.replace(/(?:^|\s)invisible(?!\S)/g, ' animated fadeIn '); // make this section visible (invisible by default), with animated fade-in
}

/* eslint-disable no-unused-vars */
function selectLatestPlatform(thisPlatform) {
  /* eslint-enable no-unused-vars */
  window.location.hash = thisPlatform.toLowerCase();
}

function displayLatestPlatform() {
  var platformHash = window.location.hash.substr(1).toUpperCase();
  var thisPlatformInfo = document.getElementById('latest-info-' + platformHash);
  if (thisPlatformInfo) {
    unselectLatestPlatform('keep the hash');
    document.getElementById('latest-selector').classList.add('hide');
    thisPlatformInfo.classList.remove('hide');
  }
}

function unselectLatestPlatform(keephash) {
  if (!keephash) {
    history.pushState('', document.title, window.location.pathname + window.location.search);
  }
  var platformButtons = document.getElementById('latest-selector').getElementsByClassName('latest-asset');
  var platformInfoBoxes = document.getElementById('latest-info').getElementsByClassName('latest-info-container');

  for (i = 0; i < platformButtons.length; i++) {
    platformInfoBoxes[i].classList.add('hide');
  }

  document.getElementById('latest-selector').classList.remove('hide');
}
