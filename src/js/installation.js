var INSTALLDATA;

/* eslint-disable no-unused-vars */
function onInstallationLoad() {
  /* eslint-enable no-unused-vars */

  INSTALLDATA = new Object();
  populateInstallation(); // populate the Latest page
}

/* eslint-disable no-unused-vars */
function populateInstallation() {
  loadPlatformsThenData(function () {

    var handleResponse = function (response) {
      buildInstallationHTML(response);
      return true;
    };

    /* eslint-disable no-undef */
    loadAssetInfo(variant, jvmVariant, 'releases', 'latest', undefined, handleResponse, function () {
      errorContainer.innerHTML = '<p>Error... no installation information has been found!</p>';
      loading.innerHTML = ''; // remove the loading dots
    });
  });
}

function buildInstallationHTML(releasesJson) {

  // create an array of the details for each asset that is attached to a release
  var assetArray = releasesJson.binaries;

  var ASSETARRAY = [];

  // for each asset attached to this release, check if it's a valid binary, then add a download block for it...
  assetArray.forEach(function (eachAsset) {
    var ASSETOBJECT = new Object();
    var nameOfFile = (eachAsset.binary_name);
    var uppercaseFilename = nameOfFile.toUpperCase(); // make the name of the asset uppercase
    ASSETOBJECT.thisPlatform = findPlatform(eachAsset);

    // check if the platform name is recognised...
    if (ASSETOBJECT.thisPlatform) {

      ASSETOBJECT.thisPlatformOrder = getPlatformOrder(ASSETOBJECT.thisPlatform);
      ASSETOBJECT.thisOfficialName = getOfficialName(ASSETOBJECT.thisPlatform) + ' ' + eachAsset.binary_type;
      ASSETOBJECT.thisPlatformType = (ASSETOBJECT.thisPlatform + '-' + eachAsset.binary_type).toUpperCase();

      // if the filename contains both the platform name and the matching BINARY extension, add the relevant info to the asset object
      ASSETOBJECT.thisBinaryExtension = getBinaryExt(ASSETOBJECT.thisPlatform);
      if (uppercaseFilename.indexOf(ASSETOBJECT.thisBinaryExtension.toUpperCase()) >= 0) {
        ASSETOBJECT.thisPlatformExists = true;
        ASSETOBJECT.thisBinaryLink = eachAsset.binary_link;
        ASSETOBJECT.thisBinaryFilename = eachAsset.binary_name;
        ASSETOBJECT.thisChecksumLink = eachAsset.checksum_link;
        ASSETOBJECT.thisChecksumFilename = eachAsset.binary_name.replace(ASSETOBJECT.thisBinaryExtension, '.sha256.txt');
        ASSETOBJECT.thisUnzipCommand = getInstallCommand(ASSETOBJECT.thisPlatform).replace('FILENAME', ASSETOBJECT.thisBinaryFilename);
        ASSETOBJECT.thisChecksumCommand = getChecksumCommand(ASSETOBJECT.thisPlatform).replace('FILENAME', ASSETOBJECT.thisBinaryFilename);

        var dirName = releasesJson.release_name + (eachAsset.binary_type === 'jre' ? '-jre' : '');
        ASSETOBJECT.thisPathCommand = getPathCommand(ASSETOBJECT.thisPlatform).replace('DIRNAME', dirName);
      }

      if (ASSETOBJECT.thisPlatformExists === true) {
        ASSETARRAY.push(ASSETOBJECT);
      }


    }
  });

  ASSETARRAY = orderPlatforms(ASSETARRAY);

  INSTALLDATA.htmlTemplate = ASSETARRAY;

  var template = Handlebars.compile(document.getElementById('template').innerHTML);
  document.getElementById('installation-template').innerHTML = template(INSTALLDATA);

  setInstallationPlatformSelector(ASSETARRAY);
  window.onhashchange = displayInstallPlatform;

  loading.innerHTML = ''; // remove the loading dots
  var installationContainer = document.getElementById('installation-container');
  installationContainer.className = installationContainer.className.replace(/(?:^|\s)hide(?!\S)/g, ' animated fadeIn ');
}


function displayInstallPlatform() {
  var platformHash = window.location.hash.substr(1).toUpperCase();
  var thisPlatformInstallation = document.getElementById('installation-container-' + platformHash);
  unselectInstallPlatform();

  if (thisPlatformInstallation) {
    platformSelector.value = platformHash;
    thisPlatformInstallation.classList.remove('hide');
  }

  else {
    var currentValues = [];
    var platformSelectorOptions = Array.apply(null, platformSelector.options);
    platformSelectorOptions.forEach(function (eachOption) {
      currentValues.push(eachOption.value);
    });
    if (currentValues.indexOf('unknown') === -1) {
      var op = new Option();
      op.value = 'unknown';
      op.text = 'Select a platform';
      platformSelector.options.add(op, 0);
    }
    platformSelector.value = 'unknown';
  }
}

function unselectInstallPlatform() {
  var platformInstallationDivs = document.getElementById('installation-container').getElementsByClassName('installation-single-platform');

  for (i = 0; i < platformInstallationDivs.length; i++) {
    platformInstallationDivs[i].classList.add('hide');
  }
}

function setInstallationPlatformSelector(thisReleasePlatforms) {

  if (platformSelector) {
    if (platformSelector.options.length === 0) {
      thisReleasePlatforms.forEach(function (eachPlatform) {
        var op = new Option();
        op.value = eachPlatform.thisPlatformType;
        op.text = eachPlatform.thisOfficialName;
        platformSelector.options.add(op);
      });
    }

    var OS = detectOS();
    if (OS && window.location.hash.length < 1) {
      platformSelector.value = OS.searchableName;
      window.location.hash = platformSelector.value.toLowerCase();
      displayInstallPlatform();
    }
    else {
      displayInstallPlatform();
    }

    platformSelector.onchange = function () {
      window.location.hash = platformSelector.value.toLowerCase();
      displayInstallPlatform();
    };

  }
}
